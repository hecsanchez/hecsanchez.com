import type { Locale } from '../i18n';

type LocalizedString = { es: string; en: string };

export interface Project {
  /** Stable ID. Doubles as the anchor on the Projects page. */
  id: string;
  title: LocalizedString;
  category: LocalizedString;
  /** One-line summary used on cards. */
  cardDescription: LocalizedString;
  /** Prose shown under the anchor on the Projects page. */
  body: LocalizedString;
  contribution: LocalizedString;
  /** Public product/demo/repository URL. Omitted until a real one exists. */
  url?: string;
  urlLabel?: LocalizedString;
  /** Screenshot in /public/projects/. Omitted until a real image exists. */
  image?: { src: string; alt: LocalizedString; width: number; height: number };
  featured: boolean;
  draft: boolean;
}

/**
 * Published project entries. Descriptions are deliberately short and factual —
 * expand them with real case-study material, not invented features or results.
 * Planned tools stay out of this list until they ship.
 */
export const projects: Project[] = [
  {
    id: 'the-woods-crm',
    title: { en: 'The Woods CRM', es: 'CRM de The Woods' },
    category: { en: 'Client work', es: 'Proyecto para cliente' },
    cardDescription: {
      en: 'A custom CRM for The Woods, a business selling wooden floors and materials.',
      es: 'Un CRM a medida para The Woods, una empresa que vende pisos de madera y materiales.',
    },
    body: {
      en: 'I built a custom CRM for The Woods. The project sits at the intersection of software development and the day-to-day needs of a sales business.',
      es: 'Desarrollé un CRM a medida para The Woods. Es un proyecto que conecta el desarrollo de software con las necesidades cotidianas de un negocio de ventas.',
    },
    contribution: {
      en: 'Custom CRM development.',
      es: 'Desarrollo de CRM a medida.',
    },
    featured: true,
    draft: false,
  },
  {
    id: 'hubspot-lead-routing',
    title: { en: 'HubSpot lead routing', es: 'Asignación de prospectos en HubSpot' },
    category: { en: 'Business application', es: 'Aplicación de negocio' },
    cardDescription: {
      en: 'A HubSpot app for assigning leads using agent schedules, with a calendar view of availability.',
      es: 'Una app de HubSpot que asigna prospectos según los horarios de los asesores, con un calendario de disponibilidad.',
    },
    body: {
      en: 'I built a lead routing application connected to HubSpot. It includes a calendar for viewing agents and their schedules, and uses those schedules in lead assignment.',
      es: 'Desarrollé una aplicación de asignación de prospectos conectada a HubSpot. Incluye un calendario para consultar a los asesores y sus horarios, y utiliza esos horarios para la asignación.',
    },
    contribution: {
      en: 'Application development and HubSpot integration.',
      es: 'Desarrollo de la aplicación e integración con HubSpot.',
    },
    featured: true,
    draft: false,
  },
  {
    id: 'zaplink',
    title: { en: 'Zaplink', es: 'Zaplink' },
    category: { en: 'Product', es: 'Producto' },
    cardDescription: {
      en: 'Authentication through WhatsApp using one-time codes and magic links.',
      es: 'Autenticación mediante WhatsApp con códigos de un solo uso y enlaces de acceso.',
    },
    body: {
      en: 'I built Zaplink to let products use WhatsApp for authentication. It supports one-time codes and magic links, with React and Node integration packages.',
      es: 'Desarrollé Zaplink para que los productos puedan utilizar WhatsApp en la autenticación de usuarios. Permite usar códigos de un solo uso y enlaces de acceso, con paquetes de integración para React y Node.',
    },
    contribution: {
      en: 'Product engineering.',
      es: 'Ingeniería de producto.',
    },
    url: 'https://zaplink.so',
    urlLabel: { en: 'Explore Zaplink', es: 'Conoce Zaplink' },
    featured: true,
    draft: false,
  },
  {
    id: 'estateflow',
    title: { en: 'Estateflow', es: 'Estateflow' },
    category: { en: 'Product · In development', es: 'Producto · En desarrollo' },
    cardDescription: {
      en: 'Technology for real estate sales operations.',
      es: 'Tecnología para operaciones de ventas inmobiliarias.',
    },
    body: {
      en: "I'm building the technology behind Estateflow, working on software for real estate sales operations. It is an ongoing product effort that connects my engineering work with how sales teams operate.",
      es: 'Estoy desarrollando la tecnología detrás de Estateflow, con software para operaciones de ventas inmobiliarias. Es un proyecto en marcha que conecta mi trabajo de ingeniería con la forma en que operan los equipos comerciales.',
    },
    contribution: {
      en: 'Product and engineering development.',
      es: 'Desarrollo de producto e ingeniería.',
    },
    featured: false,
    draft: false,
  },
];

export const publishedProjects = projects.filter((p) => !p.draft);

export function getProject(id: string): Project {
  const project = publishedProjects.find((p) => p.id === id);
  if (!project) throw new Error(`Unknown project id: ${id}`);
  return project;
}

/** Anchor on the Projects page for a given project, e.g. `/en/projects#zaplink`. */
export function projectAnchor(projectsRoute: string, id: string): string {
  return `${projectsRoute}#${id}`;
}

export type { Locale };
