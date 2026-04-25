// Simplified audio buffer player for continuous PCM 24000Hz stream
export class AudioPlayer {
  private audioContext: AudioContext;
  private nextPlayTime: number;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.nextPlayTime = this.audioContext.currentTime;
  }

  play16bitPCM(rawData: Uint8Array, sampleRate: number = 24000) {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    
    // Convert 16-bit PCM to Float32
    const numSamples = rawData.length / 2;
    const floatArray = new Float32Array(numSamples);
    const dataView = new DataView(rawData.buffer, rawData.byteOffset, rawData.byteLength);
    for (let i = 0; i < numSamples; i++) {
        // Little endian 16bit PCM
        const int = dataView.getInt16(i * 2, true);
        floatArray[i] = int / 32768.0;
    }

    const audioBuffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    audioBuffer.getChannelData(0).set(floatArray);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    if (this.nextPlayTime < this.audioContext.currentTime) {
      this.nextPlayTime = this.audioContext.currentTime;
    }

    source.start(this.nextPlayTime);
    this.nextPlayTime += audioBuffer.duration;
  }

  stop() {
    // A bit tricky without keeping track of all nodes, but suspending and recreating is easiest
    this.audioContext.close();
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.nextPlayTime = this.audioContext.currentTime;
  }
}

// Convert Float32Array to base64 encoded 16-bit PCM
export function float32ToPCMBase64(float32Array: Float32Array): string {
    const pcm16 = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    const buffer = new Uint8Array(pcm16.buffer);
    
    // Convert to base64
    let binary = '';
    // Chunk conversion to avoid max call stack size
    for(let i=0; i<buffer.byteLength; i++) {
        binary += String.fromCharCode(buffer[i]);
    }
    return btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
