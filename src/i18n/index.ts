import es from './es.json';
import en from './en.json';

export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';

const dictionaries = { es, en } as const;

export type Dictionary = typeof es;

export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const testimonials = [
  {
    quote: {
      es: 'Hec aporta claridad técnica y ejecución real. No solo aconseja, construye.',
      en: 'Hec brings technical clarity and real execution. He doesn\'t just advise, he builds.',
    },
    name: 'Tania Gomez',
    title: { es: 'Product Manager', en: 'Product Manager' },
    company: 'Konfio',
  },
  {
    quote: {
      es: 'Una de las pocas personas que entiende la estrategia y también escribe el código.',
      en: 'One of the few people who understands the strategy and also writes the code.',
    },
    name: 'Nate Hershey',
    title: { es: 'VP de Ingeniería', en: 'VP Engineering' },
    company: 'Fresh Tri',
  },
] as const;

export const companies = [
  'Camino Real',
  'Pluto TV',
  'Lala',
  'Cabify',
  'Airbus',
  'Freightliner',
] as const;

// TODO: Hec to provide
export const contactInfo = {
  email: 'hec@hecsanchez.com',
  linkedin: 'https://www.linkedin.com/in/hectorsanchezm/',
  github: 'https://github.com/hecsanchez',
  calendly: 'https://calendly.com/hecsanchez/30min',
};
