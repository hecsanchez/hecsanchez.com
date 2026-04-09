import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.locale === 'es' && !data.draft);
  return rss({
    title: 'Hec Sánchez — Bitácora',
    description: 'Notas sobre arquitectura, liderazgo de ingeniería y construir en industrias reguladas.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/es/escritos/${post.id.replace(/\.mdx?$/, '')}`,
      })),
    customData: '<language>es-mx</language>',
  });
}
