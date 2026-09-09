import type { Locale } from '../i18n';

type LocalizedString = { es: string; en: string };

/** A screenshot slot. The file lives in `public/projects/` and is optional — see that folder's README. */
export interface ProjectImage {
  /** Path relative to `public/projects/`, e.g. `estateflow/hero.png`. */
  file: string;
  alt: LocalizedString;
  caption?: LocalizedString;
}

export interface ProjectSection {
  title: LocalizedString;
  body: LocalizedString[];
  image?: ProjectImage;
}

export interface Project {
  /** Stable ID. Doubles as the anchor on the Projects index and the detail-page slug. */
  id: string;
  title: LocalizedString;
  category: LocalizedString;
  /** One-line summary used on cards. */
  cardDescription: LocalizedString;
  /** Prose shown under the anchor on the Projects index. */
  body: LocalizedString;
  /** Public product/demo/repository URL. Omitted until a real one exists. */
  url?: string;
  urlLabel?: LocalizedString;
  featured: boolean;
  draft: boolean;

  // ---- Detail page ----
  /** Opening paragraphs on the project's own page. */
  intro: LocalizedString[];
  /** Full-width screenshot below the intro. */
  hero?: ProjectImage;
  sections: ProjectSection[];
  /** Factual list of what it's built with. */
  stack: string[];
  /** IDs of other projects to cross-link. */
  related: string[];
}

/**
 * Published project entries. Descriptions are factual accounts of what the
 * software does — no invented features, metrics, or outcomes. Screenshots are
 * declared here but render only once the file exists in `public/projects/`.
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
    featured: true,
    draft: false,
    intro: [
      {
        en: "The Woods sells wooden floors and the materials that go with them. I built the internal application the business runs on: the leads and quotes at the front of the process, and the stock, purchasing, deliveries, and collections behind them.",
        es: 'The Woods vende pisos de madera y los materiales que los acompañan. Desarrollé la aplicación interna con la que opera el negocio: los prospectos y las cotizaciones al frente del proceso, y el inventario, las compras, las entregas y la cobranza detrás.',
      },
      {
        en: 'The interesting part was never the CRM screens. It was that a quote for flooring is a measurement problem, that the customer conversation happens on WhatsApp, and that a signed quote has to reach purchasing, the warehouse, and accounting without anyone retyping it.',
        es: 'Lo interesante nunca fueron las pantallas del CRM. Fue que cotizar piso es un problema de medidas, que la conversación con el cliente ocurre en WhatsApp, y que una cotización aprobada tiene que llegar a compras, al almacén y a contabilidad sin que nadie la recapture.',
      },
    ],
    hero: {
      file: 'the-woods-crm/hero.png',
      alt: { en: 'The Woods CRM dashboard', es: 'Tablero del CRM de The Woods' },
    },
    sections: [
      {
        title: { en: 'One inbox for WhatsApp', es: 'Una bandeja compartida de WhatsApp' },
        body: [
          {
            en: 'Customers write on WhatsApp, so the team answers there. The inbox is shared: messages arrive in real time, every conversation is attached to the customer record, and the next person to pick it up can see what was already said.',
            es: 'Los clientes escriben por WhatsApp, así que el equipo responde ahí. La bandeja es compartida: los mensajes llegan en tiempo real, cada conversación queda ligada al registro del cliente, y quien la retoma ve lo que ya se dijo.',
          },
          {
            en: 'Two AI assists sit on top of it. One drafts a follow-up when a thread has gone quiet. The other reads a conversation and pulls out the details that belong on the customer record, so a salesperson is correcting a draft instead of filling in a form.',
            es: 'Encima hay dos apoyos con IA. Uno redacta un seguimiento cuando la conversación se enfría. El otro lee el hilo y extrae los datos que corresponden al registro del cliente, de modo que el vendedor corrige un borrador en lugar de llenar un formulario.',
          },
        ],
        image: {
          file: 'the-woods-crm/inbox.png',
          alt: { en: 'Shared WhatsApp inbox', es: 'Bandeja compartida de WhatsApp' },
          caption: {
            en: 'Conversations stay attached to the customer they belong to.',
            es: 'Las conversaciones quedan ligadas al cliente al que pertenecen.',
          },
        },
      },
      {
        title: { en: 'Quotes built from measurements', es: 'Cotizaciones que parten de las medidas' },
        body: [
          {
            en: "A quote starts from the room, not from a product list. The builder takes measurements and works out the area, the skirting, and the waste, then prices the result against the catalogue. Discounts past an agreed threshold need someone with authority to approve them.",
            es: 'Una cotización parte del espacio, no de una lista de productos. El generador toma las medidas y calcula el área, el zoclo y el desperdicio, y después cotiza el resultado contra el catálogo. Los descuentos que rebasan cierto umbral requieren la autorización de alguien con facultad para darla.',
          },
          {
            en: 'A salesperson can also dictate the quote and have the system parse it into line items. When it goes out, the quote is frozen as a snapshot and sent as a PDF over WhatsApp, so what the customer received stays readable later even after the catalogue moves on.',
            es: 'El vendedor también puede dictar la cotización y el sistema la convierte en partidas. Al enviarse, la cotización se congela como una fotografía y sale en PDF por WhatsApp, para que lo que recibió el cliente siga siendo legible aunque el catálogo cambie después.',
          },
        ],
        image: {
          file: 'the-woods-crm/proposal.png',
          alt: { en: 'Proposal builder', es: 'Generador de cotizaciones' },
          caption: {
            en: 'Measurements in, priced line items out.',
            es: 'Entran medidas, salen partidas cotizadas.',
          },
        },
      },
      {
        title: { en: 'Stock, purchasing, and delivery', es: 'Inventario, compras y entregas' },
        body: [
          {
            en: 'Behind the quote sits the part that decides whether the promise holds. The catalogue tracks stock across warehouses and flags what is running low. When a proposal is paid, the purchase order it implies is raised automatically rather than remembered.',
            es: 'Detrás de la cotización está la parte que decide si la promesa se cumple. El catálogo controla existencias por almacén y avisa lo que está por agotarse. Cuando una cotización se paga, la orden de compra que implica se genera sola en lugar de quedar en la memoria de alguien.',
          },
          {
            en: 'From there the system carries the order through requisitions, the shipping paperwork carriers ask for, the delivery itself, and the payments and statements that close it out.',
            es: 'De ahí el sistema lleva el pedido por requisiciones, la documentación que piden las transportistas, la entrega y, al final, los pagos y estados de cuenta que lo cierran.',
          },
        ],
        image: {
          file: 'the-woods-crm/inventory.png',
          alt: { en: 'Inventory and purchasing', es: 'Inventario y compras' },
        },
      },
    ],
    stack: [
      'Next.js 15',
      'PostgreSQL',
      'Drizzle ORM',
      'BullMQ',
      'Cloudflare R2',
      'WhatsApp Business API',
      'Claude Haiku',
      'Whisper',
    ],
    related: [],
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
    featured: true,
    draft: false,
    intro: [
      {
        en: 'A lead that lands with someone who is off shift waits. This app assigns new records to whoever is actually working: it reads each agent’s schedule, picks an available owner, and shows the team who is on duty right now.',
        es: 'Un prospecto que cae con alguien que no está en turno se queda esperando. Esta aplicación asigna los registros nuevos a quien realmente está trabajando: lee el horario de cada asesor, elige un responsable disponible y muestra al equipo quién está de guardia en ese momento.',
      },
      {
        en: 'I built it as part of Estateflow, and it installs into a client’s HubSpot portal on its own — the team works with it inside the CRM they already use, not in another tab.',
        es: 'La desarrollé como parte de Estateflow y se instala por su cuenta en el portal de HubSpot del cliente: el equipo la usa dentro del CRM que ya utiliza, no en otra pestaña.',
      },
    ],
    hero: {
      file: 'hubspot-lead-routing/hero.png',
      alt: { en: 'Lead router running inside HubSpot', es: 'El router de prospectos dentro de HubSpot' },
    },
    sections: [
      {
        title: { en: 'Assigning by who is on shift', es: 'Asignar según quién está en turno' },
        body: [
          {
            en: 'Each agent has shifts, in their own timezone, with effective date ranges and exceptions for the days that break the pattern. The app refuses to save a shift that overlaps one the agent already has, because an overlap is usually a typo rather than an intention.',
            es: 'Cada asesor tiene turnos, en su propia zona horaria, con rangos de vigencia y excepciones para los días que rompen el patrón. La aplicación no guarda un turno que se traslape con otro del mismo asesor, porque un traslape casi siempre es un error de captura y no una intención.',
          },
          {
            en: 'When a lead arrives, the candidates are the agents on shift at that moment, and the app takes turns among them rather than always handing work to the first name on the list.',
            es: 'Cuando llega un prospecto, los candidatos son los asesores en turno en ese momento, y la aplicación va rotando entre ellos en lugar de darle siempre el trabajo al primero de la lista.',
          },
        ],
        image: {
          file: 'hubspot-lead-routing/schedule.png',
          alt: { en: 'Agent schedule view', es: 'Vista de horarios de los asesores' },
          caption: {
            en: 'Who is working, and when.',
            es: 'Quién trabaja y cuándo.',
          },
        },
      },
      {
        title: { en: 'Pools, rules, and leads that already have an owner', es: 'Grupos, reglas y prospectos que ya tienen dueño' },
        body: [
          {
            en: 'Not every lead should go to the same group. Routing pools are matched by rules on the record’s own properties, and a pool can belong to a specific development, so enquiries about one project reach the people who sell it.',
            es: 'No todos los prospectos deben ir al mismo grupo. Los grupos de asignación se eligen con reglas sobre las propiedades del propio registro, y un grupo puede pertenecer a un desarrollo específico, para que las solicitudes de un proyecto lleguen a quienes lo venden.',
          },
          {
            en: 'A record that already has an owner is the case worth getting right. The policy for those is explicit and configurable, so a returning customer is not quietly taken away from the person who has been working with them.',
            es: 'El caso que vale la pena resolver bien es el del registro que ya tiene dueño. La política para esos casos es explícita y configurable, para que a un cliente que regresa no se le quite en silencio a la persona que ya lo venía atendiendo.',
          },
          {
            en: 'Inbound calls fit the same model: phone numbers map to routing groups, so a call and a form fill land with the same logic.',
            es: 'Las llamadas entrantes siguen el mismo modelo: los números telefónicos se mapean a grupos de asignación, para que una llamada y un formulario se resuelvan con la misma lógica.',
          },
        ],
        image: {
          file: 'hubspot-lead-routing/settings.png',
          alt: { en: 'Routing pools and settings', es: 'Grupos de asignación y configuración' },
        },
      },
      {
        title: { en: 'Where it runs', es: 'Dónde se ejecuta' },
        body: [
          {
            en: 'The interface is a HubSpot UI extension, so it lives inside the portal. Routing is triggered by webhooks when a contact is created or a deal changes stage, and it is also available as a workflow action for teams that would rather decide when it fires.',
            es: 'La interfaz es una extensión de UI de HubSpot, así que vive dentro del portal. La asignación se dispara con webhooks cuando se crea un contacto o cambia la etapa de un negocio, y también está disponible como acción de workflow para los equipos que prefieren decidir cuándo se ejecuta.',
          },
          {
            en: 'Every portal connects through its own OAuth install, and requests from the extension are signed before the Estateflow API will act on them.',
            es: 'Cada portal se conecta con su propia instalación OAuth, y las solicitudes de la extensión van firmadas antes de que la API de Estateflow actúe sobre ellas.',
          },
        ],
      },
    ],
    stack: [
      'HubSpot UI Extensions',
      'HubSpot OAuth & webhooks',
      'React',
      'NestJS',
      'Prisma',
      'PostgreSQL',
    ],
    related: ['estateflow'],
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
    url: 'https://zaplink.so',
    urlLabel: { en: 'Explore Zaplink', es: 'Conoce Zaplink' },
    featured: true,
    draft: false,
    intro: [
      {
        en: 'Zaplink lets a product authenticate people over WhatsApp instead of email. The user gets a one-time code or a link in the app they already have open, and signs in from there.',
        es: 'Zaplink permite que un producto autentique a las personas por WhatsApp en lugar de correo. El usuario recibe un código de un solo uso o un enlace en la app que ya tiene abierta, y entra desde ahí.',
      },
      {
        en: 'In much of Latin America that is the difference between a login that works and one that quietly fails: the inbox is an afterthought, but WhatsApp is where people actually are.',
        es: 'En buena parte de Latinoamérica esa es la diferencia entre un inicio de sesión que funciona y uno que falla en silencio: el correo es secundario, pero WhatsApp es donde la gente realmente está.',
      },
    ],
    hero: {
      file: 'zaplink/hero.jpg',
      alt: { en: 'Zaplink sign-in over WhatsApp', es: 'Inicio de sesión por WhatsApp con Zaplink' },
    },
    sections: [
      {
        title: { en: 'Signing in over WhatsApp', es: 'Iniciar sesión por WhatsApp' },
        body: [
          {
            en: 'The platform issues one-time codes and magic links, verifies them, and can act as a second factor for products that already have a password. Rate limiting and abuse protection are part of the service rather than something each integrator has to remember.',
            es: 'La plataforma emite códigos de un solo uso y enlaces de acceso, los verifica y puede funcionar como segundo factor para productos que ya usan contraseña. El control de frecuencia y la protección contra abuso son parte del servicio, no algo que cada integrador tenga que recordar.',
          },
          {
            en: 'Provider callbacks arrive on their own endpoint and the slow work — delivery, retries — runs on a queue, so an authentication request does not wait on a messaging provider to answer.',
            es: 'Las respuestas del proveedor llegan a su propio endpoint y el trabajo lento —entrega, reintentos— corre en una cola, para que una solicitud de autenticación no se quede esperando a que conteste el proveedor de mensajería.',
          },
        ],
      },
      {
        title: { en: 'Packages for the framework you already use', es: 'Paquetes para el framework que ya usas' },
        body: [
          {
            en: 'The point of Zaplink is that adding it should be small. There are packages for Node and the browser, a React client, a React Native client, and a Next.js integration, all built on a shared core, plus example applications that show each one wired up end to end.',
            es: 'El objetivo de Zaplink es que integrarlo sea poco trabajo. Hay paquetes para Node y el navegador, un cliente de React, uno de React Native y una integración para Next.js, todos sobre un núcleo común, además de aplicaciones de ejemplo que muestran cada uno funcionando de principio a fin.',
          },
        ],
      },
      {
        title: { en: 'The console', es: 'La consola' },
        body: [
          {
            en: 'Behind the API there is a console for the people running it: applications and their credentials, the users who have signed in, and an audit trail of what happened.',
            es: 'Detrás de la API hay una consola para quien la opera: las aplicaciones y sus credenciales, los usuarios que han entrado y una bitácora de lo que ocurrió.',
          },
        ],
        image: {
          file: 'zaplink/console.png',
          alt: { en: 'Zaplink console', es: 'Consola de Zaplink' },
        },
      },
    ],
    stack: ['NestJS', 'Prisma', 'PostgreSQL', 'Redis', 'BullMQ', 'React', 'Vite', 'Nx'],
    related: [],
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
    featured: false,
    draft: false,
    intro: [
      {
        en: 'Estateflow is the operating system for a real-estate marketing agency and the developers it sells for. It reads the CRM a client already runs, measures the sales operation against the standard the agency has agreed to enforce, and gives the agency one place to run its own delivery.',
        es: 'Estateflow es el sistema operativo de una agencia de marketing inmobiliario y de los desarrollos para los que vende. Lee el CRM que el cliente ya opera, mide la operación comercial contra el estándar que la agencia se comprometió a sostener, y le da a la agencia un solo lugar donde llevar su propia ejecución.',
      },
      {
        en: 'It is in active development and I am building it end to end: the API, the web application, the mobile client, and the integrations that connect it to the tools sales teams already have open.',
        es: 'Está en desarrollo activo y lo estoy construyendo de extremo a extremo: la API, la aplicación web, el cliente móvil y las integraciones que lo conectan con las herramientas que los equipos comerciales ya tienen abiertas.',
      },
    ],
    hero: {
      file: 'estateflow/hero.png',
      alt: { en: 'Estateflow web application', es: 'Aplicación web de Estateflow' },
    },
    sections: [
      {
        title: { en: 'Reading the CRM a client already runs', es: 'Leer el CRM que el cliente ya opera' },
        body: [
          {
            en: 'Nobody is asked to move CRMs or re-enter anything. Estateflow connects to a client’s HubSpot portal, holds those credentials encrypted and scoped to that client alone, and mirrors the deals, contacts, activity, tasks, and conversations it needs.',
            es: 'A nadie se le pide cambiar de CRM ni recapturar información. Estateflow se conecta al portal de HubSpot del cliente, guarda esas credenciales cifradas y limitadas a ese cliente, y replica los negocios, contactos, actividad, tareas y conversaciones que necesita.',
          },
          {
            en: 'On top of that copy it runs diagnostics: how cohorts are actually converting, which profile is really buying, and where the data itself has gone wrong. Those findings are the argument the agency takes into a meeting.',
            es: 'Sobre esa copia corre diagnósticos: cómo están convirtiendo las cohortes en realidad, qué perfil es el que efectivamente compra y dónde se descompuso la información. Esos hallazgos son el argumento con el que la agencia llega a una junta.',
          },
        ],
      },
      {
        title: { en: 'The pipeline and the standard it is held to', es: 'El pipeline y el estándar que debe cumplir' },
        body: [
          {
            en: 'The agency sells an operating standard, not just leads: a defined pipeline, response times a lead is owed, and a rhythm the sales team is meant to keep. Estateflow makes that standard something the software checks rather than something a manager remembers.',
            es: 'La agencia vende un estándar de operación, no solo prospectos: un pipeline definido, tiempos de respuesta que cada prospecto merece y un ritmo que el equipo comercial debe sostener. Estateflow convierte ese estándar en algo que el software verifica y no en algo que un gerente tiene que recordar.',
          },
          {
            en: 'A stage a deal cannot legitimately be in, a lead nobody answered in time, a week where the rhythm slipped — these surface as findings rather than as a feeling that something is off.',
            es: 'Una etapa en la que un negocio no debería estar, un prospecto que nadie contestó a tiempo, una semana en la que se perdió el ritmo: todo eso aparece como hallazgo y no como la sensación de que algo anda mal.',
          },
        ],
        image: {
          file: 'estateflow/pipeline.png',
          alt: { en: 'Pipeline and service-level view', es: 'Vista de pipeline y niveles de servicio' },
        },
      },
      {
        title: { en: 'Getting the lead to a person', es: 'Llevar el prospecto a una persona' },
        body: [
          {
            en: 'Measuring response time is only useful if a lead reaches someone who can respond. That is what the lead router does: it assigns new records to agents who are on shift, and it installs into the client’s HubSpot portal so the team stays in the CRM they already use.',
            es: 'Medir el tiempo de respuesta solo sirve si el prospecto llega a alguien que pueda responder. Para eso está el router de prospectos: asigna los registros nuevos a asesores en turno y se instala en el portal de HubSpot del cliente, para que el equipo se quede en el CRM que ya usa.',
          },
          {
            en: 'Inbound calls route the same way, so a phone call and a form fill are treated as the same kind of event.',
            es: 'Las llamadas entrantes se asignan igual, de modo que una llamada y un formulario se tratan como el mismo tipo de evento.',
          },
        ],
      },
      {
        title: { en: 'Reporting someone will actually open', es: 'Reportes que alguien sí va a abrir' },
        body: [
          {
            en: 'Reports are built for the two conversations that keep happening: the one with the developer about whether the money is working, and the one with the sales team about how the week went. Stage distribution, setter response times, and the ability to drill from a number into the records behind it.',
            es: 'Los reportes están hechos para las dos conversaciones que se repiten: la del desarrollador sobre si la inversión está funcionando, y la del equipo comercial sobre cómo fue la semana. Distribución por etapa, tiempos de respuesta de los setters y la posibilidad de bajar de un número a los registros que lo componen.',
          },
        ],
        image: {
          file: 'estateflow/reports.png',
          alt: { en: 'Reporting views', es: 'Vistas de reportes' },
        },
      },
      {
        title: { en: 'And the agency’s own operation', es: 'Y la operación de la propia agencia' },
        body: [
          {
            en: 'The other half is the layer the agency runs itself on: projects, the people working them, intake, work items, and the assets a campaign needs. It exists so project state lives somewhere other than the founder’s head. Clients never see it.',
            es: 'La otra mitad es la capa con la que opera la propia agencia: proyectos, las personas que los trabajan, el intake, las tareas y los materiales que necesita una campaña. Existe para que el estado de un proyecto viva en algún lugar que no sea la cabeza del fundador. Los clientes nunca la ven.',
          },
          {
            en: 'There is a mobile client for the parts of that work that do not happen at a desk.',
            es: 'Hay un cliente móvil para las partes de ese trabajo que no ocurren frente a un escritorio.',
          },
        ],
        image: {
          file: 'estateflow/mobile.png',
          alt: { en: 'Estateflow mobile client', es: 'Cliente móvil de Estateflow' },
        },
      },
    ],
    stack: [
      'NestJS',
      'Prisma',
      'PostgreSQL',
      'React',
      'Vite',
      'React Native',
      'HubSpot API',
      'Nx',
    ],
    related: ['hubspot-lead-routing'],
  },
];

export const publishedProjects = projects.filter((p) => !p.draft);

export function getProject(id: string): Project {
  const project = publishedProjects.find((p) => p.id === id);
  if (!project) throw new Error(`Unknown project id: ${id}`);
  return project;
}

/** Detail-page path for a project, e.g. `/en/projects/zaplink`. */
export function projectHref(projectsRoute: string, id: string): string {
  return `${projectsRoute}/${id}`;
}

export type { Locale };
