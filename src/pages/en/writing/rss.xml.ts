import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => data.locale === 'en' && !data.draft);
  return rss({
    title: 'Hec Sánchez — Shipping Notes',
    description: 'Notes on architecture, engineering leadership, and building in regulated industries.',
    site: context.site!,
    items: posts
      .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
      .map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `/en/writing/${post.id.replace(/\.mdx?$/, '')}`,
      })),
    customData: '<language>en-us</language>',
  });
}
