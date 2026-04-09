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
  'Lala',
  'Cabify',
  'Freightliner',
] as const;

type LocalizedString = { es: string; en: string };

export const careerTimeline: Array<{
  company: LocalizedString;
  /** Filename in /public/logos/companies/ — `null` until the user provides one. */
  logo: string | null;
  role: LocalizedString;
  years: LocalizedString;
}> = [
  {
    company: { en: 'Nolte', es: 'Nolte' },
    logo: null,
    role: { en: 'Head of Engineering', es: 'Head of Engineering' },
    years: { en: '2025–present', es: '2025–presente' },
  },
  {
    company: { en: 'Independent', es: 'Independiente' },
    logo: null,
    role: { en: 'Fractional CTO', es: 'CTO Fraccionario' },
    years: { en: '2025–present', es: '2025–presente' },
  },
  {
    company: { en: 'Happy Software', es: 'Happy Software' },
    logo: null,
    role: { en: 'Co-founder', es: 'Cofundador' },
    years: { en: '2021–2025', es: '2021–2025' },
  },
  {
    company: { en: 'Pluto TV', es: 'Pluto TV' },
    logo: null,
    role: { en: 'Sr. Full-stack Developer', es: 'Desarrollador Full-stack Senior' },
    years: { en: '2019–2021', es: '2019–2021' },
  },
  {
    company: { en: 'Fresh Tri', es: 'Fresh Tri' },
    logo: null,
    role: { en: 'Sr. React Native Developer', es: 'Desarrollador React Native Senior' },
    years: { en: '2019', es: '2019' },
  },
  {
    company: { en: 'Venzee Technologies', es: 'Venzee Technologies' },
    logo: null,
    role: { en: 'Full Stack Engineer', es: 'Ingeniero Full Stack' },
    years: { en: '2018–2019', es: '2018–2019' },
  },
  {
    company: { en: 'Adext AI', es: 'Adext AI' },
    logo: null,
    role: { en: 'Sr. Frontend Developer', es: 'Desarrollador Frontend Senior' },
    years: { en: '2017–2018', es: '2017–2018' },
  },
  {
    company: { en: 'Koneksys', es: 'Koneksys' },
    logo: null,
    role: { en: 'Senior Developer', es: 'Desarrollador Senior' },
    years: { en: '2017', es: '2017' },
  },
  {
    company: { en: 'Agile Kitchen', es: 'Agile Kitchen' },
    logo: null,
    role: { en: 'Founder', es: 'Fundador' },
    years: { en: '2014–2016', es: '2014–2016' },
  },
  {
    company: { en: 'Crowdbait', es: 'Crowdbait' },
    logo: null,
    role: { en: 'Technical Manager', es: 'Gerente Técnico' },
    years: { en: '2012–2014', es: '2012–2014' },
  },
  {
    company: { en: 'Freelance', es: 'Freelance' },
    logo: null,
    role: { en: 'Web Designer & Developer', es: 'Diseñador y Desarrollador Web' },
    years: { en: '2008–2012', es: '2008–2012' },
  },
];

// TODO: Hec to confirm email + cal.com link/event slug
export const contactInfo = {
  email: 'hec@hecsanchez.com',
  linkedin: 'https://www.linkedin.com/in/hecsanchez/',
  github: 'https://github.com/hecsanchez',
  /** Cal.com link in `username/event-slug` form. */
  calLink: 'hecsanchez/30min',
};
