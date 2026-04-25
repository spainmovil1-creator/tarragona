import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { useLanguage } from '../context/LanguageContext';
import { appTranslation, historyData } from '../data';
import { AudioPlayer, float32ToPCMBase64, base64ToUint8Array } from '../audioUtils';

const controlAppFunctionDeclaration: FunctionDeclaration = {
  name: 'showStageOnScreen',
  description: 'Muestra la etapa correspondiente de la historia de Tarragona en la pantalla antes de empezar a hablar de ella. OBLIGATORIO DE USAR antes de narrar una etapa.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      stageName: { type: Type.STRING },
      sectionId: { type: Type.STRING },
      stageId: { type: Type.STRING }
    },
    required: ['stageName', 'sectionId', 'stageId']
  }
};

export const VoiceAssistant: React.FC = () => {
  const { language } = useLanguage();
  const t = appTranslation[language];
  const navigate = useNavigate();

  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorText, setErrorText] = useState('');

  const audioPlayerRef = useRef<AudioPlayer | null>(null);
  const sessionRef = useRef<Promise<any> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Stop everything
  const stopSession = () => {
    if (audioPlayerRef.current) {
        audioPlayerRef.current.stop();
        audioPlayerRef.current = null;
    }
    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (sessionRef.current) {
        sessionRef.current.then(s => s.close()).catch(console.error);
        sessionRef.current = null;
    }
    setIsActive(false);
    setIsConnecting(false);
  };

  useEffect(() => {
      return stopSession;
  }, []);

  const toggleAssistant = async () => {
    if (isActive) {
      stopSession();
      return;
    }

    try {
      setIsConnecting(true);
      setErrorText('');
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error("GEMINI_API_KEY no encontrada");

      const ai = new GoogleGenAI({ apiKey });
      audioPlayerRef.current = new AudioPlayer();

      // Formulate system instructions containing all the content
      let systemInstruction = 'Eres un experto guía turístico e historiador bilingüe sobre la Historia de Tarragona. Estás en una aplicación web interactiva.\\n\\n';
      systemInstruction += 'OBLIGATORIO: Antes de explicar el contenido de CUALQUIER ETAPA, DEBES usar la herramienta `showStageOnScreen` enviando el `stageName`, `sectionId` y `stageId` correspondientes de la etapa de la que vas a hablar.\\n\\n';
      systemInstruction += 'A continuación tienes toda la información de la historia:\\n';
      historyData.forEach(sec => {
          systemInstruction += `\nSECCIÓN [sectionId: "${sec.id}"] - Título: ${sec.title[language]}\n`;
          sec.stages.forEach(st => {
              systemInstruction += ` - ETAPA [stageId: "${st.id}"] - Título: ${st.title[language]}\n   Contenido: ${st.content[language]}\n`;
          });
      });
      systemInstruction += '\nRecuerda: Llama siempre a la herramienta EXACTAMENTE con los valores de sectionId y stageId listados antes de explicar sus detalles.';

      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          systemInstruction,
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          tools: [{ functionDeclarations: [controlAppFunctionDeclaration] }]
        },
        callbacks: {
          onopen: () => {
             console.log("Gemini Live Connected");
             setIsActive(true);
             setIsConnecting(false);
             startMic(sessionPromise);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Interruption
            if (message.serverContent?.interrupted) {
                if (audioPlayerRef.current) audioPlayerRef.current.stop();
            }

            // Audio output
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && audioPlayerRef.current) {
                const pcm = base64ToUint8Array(base64Audio);
                audioPlayerRef.current.play16bitPCM(pcm, 24000);
            }

            // Tools
            if (message.toolCall) {
                const calls = message.toolCall.functionCalls;
                if (calls && calls.length > 0) {
                    const call = calls[0];
                    if (call.name === 'showStageOnScreen') {
                        const args = call.args as any;
                        if (args && args.sectionId && args.stageId) {
                            navigate(`/section/${args.sectionId}#${args.stageId}`);
                        }
                    }
                    
                    sessionPromise.then(s => {
                        s.sendToolResponse({
                            functionResponses: calls.map(c => ({
                                id: c.id!,
                                name: c.name!,
                                response: { result: 'Navegación completada con éxito. El usuario ya está viendo la etapa en pantalla. Puedes empezar a hablar de la etapa.' }
                            }))
                        });
                    }).catch(console.error);
                }
            }
          },
          onerror: (error) => {
              console.error(error);
              setErrorText('Error de conexión');
              stopSession();
          },
          onclose: () => {
              console.log("Connection closed");
              stopSession();
          }
        }
      });
      
      sessionRef.current = sessionPromise;

    } catch (e: any) {
        console.error(e);
        setErrorText(e.message || 'Error initializing');
        stopSession();
    }
  };

  const startMic = async (sessionPromise: Promise<any>) => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: {
            channelCount: 1,
            sampleRate: 16000
          }});
          mediaStreamRef.current = stream;

          const actx = new (window.AudioContext || (window as any).webkitAudioContext)({
              sampleRate: 16000
          });
          audioContextRef.current = actx;

          const source = actx.createMediaStreamSource(stream);
          await actx.audioWorklet.addModule('/processor.js');

          const node = new AudioWorkletNode(actx, 'pcm-processor');
          node.port.onmessage = (e) => {
              const base64Data = float32ToPCMBase64(e.data);
              sessionPromise.then(s => {
                  s.sendRealtimeInput({
                      audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
                  });
              }).catch(console.error);
          };

          source.connect(node);
          node.connect(actx.destination); // Required for some browsers to keep processor running
      } catch (e) {
          console.error('Error starting mic', e);
      }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {errorText && (
        <div className="bg-red-500 text-white p-2 rounded-md mb-2 text-xs">
          {errorText}
        </div>
      )}
      <button
        onClick={toggleAssistant}
        disabled={isConnecting}
        className={`flex items-center justify-center p-4 rounded-full text-white shadow-lg transition-all ${
          isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#4a2c00] hover:bg-[#3d2400]'
        }`}
        title={isActive ? t.assistantActive : t.assistantInactive}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isActive ? (
          <Mic className="w-6 h-6 animate-pulse" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};
