import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    locale: z.enum(['es', 'en']),
    tags: z.array(z.enum(['insurtech', 'healthtech', 'fintech', 'engineering-leadership', 'latam'])),
    draft: z.boolean().optional().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    summary: z.object({ es: z.string(), en: z.string() }),
    whatItIs: z.object({ es: z.string(), en: z.string() }),
    whatIBuilt: z.object({ es: z.string(), en: z.string() }),
    stack: z.array(z.string()),
    image: z.string().optional(),
  }),
});

export const collections = { blog, projects };
