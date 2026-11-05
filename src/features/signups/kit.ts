import type { ResourceAsset } from '../ai/config.ts';
import { KIT_DOWNLOAD_URL, KIT_ID, KIT_VERSION } from './contracts.ts';

// Inventory and prerequisites verified against the uploaded v1.1 ZIP by the
// parent agent. SHA256: 275ef24f5809395cf5d23d3f0b2af4ecb407d304b11e685517784aae29b8bdf7.
export const kitAsset: ResourceAsset = {
  id: KIT_ID, version: KIT_VERSION, url: KIT_DOWNLOAD_URL, kind: 'download',
  formats: 'ZIP con una guía PDF de 10 páginas, un cuaderno de Excel, prompts y ejemplos en PDF y texto',
  contents: [
    'Guía v1.1 de 10 páginas para elegir una tarea y preparar una prueba.',
    'Cuaderno de Excel con las hojas Mi tarea, Contexto, Ejemplo, Pruebas e Impacto.',
    'Prompts para practicar con el ejemplo, trabajar una tarea propia y hacer pruebas adicionales.',
    'Tres cotizaciones ficticias C-101, C-102 y C-103 en PDF, con una alternativa en texto.',
    'Archivo EMPIEZA AQUÍ con las instrucciones de inicio.',
  ],
  prerequisites: 'Extrae el ZIP. Usa preferentemente una computadora, Microsoft Excel para el cuaderno y ChatGPT u otro asistente que permita adjuntar archivos o pegar texto. No necesitas programar. Practica con datos ficticios y no subas datos personales o confidenciales sin autorización.',
};