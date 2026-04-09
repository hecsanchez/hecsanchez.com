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

export const collections = { blog };
