export type Language = 'es' | 'ca';

export interface Stage {
  id: string;
  title: Record<Language, string>;
  image: string;
  content: Record<Language, string>;
}

export interface Section {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  image: string;
  stages: Stage[];
}

export const appTranslation = {
  es: {
    start: 'Explorar la Historia',
    selectLang: 'Idioma',
    homeTitle: 'Tarragona',
    homeSubtitle: 'Tarraco, crónica de una ciudad eterna',
    sections: 'Índice de Contenidos',
    assistantActive: 'Asistente escuchando...',
    assistantInactive: 'Asistente de Voz',
    assistantError: 'Error en el asistente.',
    back: 'Volver al Inicio',
    explore: 'Leer Capítulo'
  },
  ca: {
    start: 'Explorar la Història',
    selectLang: 'Idioma',
    homeTitle: 'Tarragona',
    homeSubtitle: 'Tàrraco, crònica d\'una ciutat eterna',
    sections: 'Índex de Continguts',
    assistantActive: 'Assistent escoltant...',
    assistantInactive: 'Assistent de Veu',
    assistantError: 'Error en l\'assistent.',
    back: 'Tornar a l\'Inici',
    explore: 'Llegir Capítol'
  }
};
