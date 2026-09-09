import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    locale: z.enum(['es', 'en']),
    tags: z.array(z.enum(['insurtech', 'healthtech', 'fintech', 'engineering-leadership', 'latam', 'product'])),
    draft: z.boolean().optional().default(false),
    /**
     * Shared key linking an article to its translation in the other locale.
     * Two posts with the same key are the same article; that is what lets the
     * language switcher and `hreflang` point at a real equivalent. Leave it
     * unset while an article exists in one language only.
     */
    translationKey: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
  }),
});

export const collections = { blog };
