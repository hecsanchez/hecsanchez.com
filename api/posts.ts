import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import marked from 'marked';
import readTimeEstimate from 'read-time-estimate';

interface MarkdownFile {
  default: string;
}

const postsDirectory = path.resolve(process.cwd(), 'posts');
const getAllPostFileNames = async (directoryPath, filesList = [], files = []) => {
  const context = require.context('../posts', true, /\.md$/);

  for (const key of context.keys()) {
    const post = key.slice(5);

    if (fs.statSync(`${directoryPath}/${key}`).isDirectory() as boolean) {
      filesList = await getAllPostFileNames(
        `${directoryPath as string}/${key}`,
        filesList as string[]
      );
    } else {
      filesList.push(path.join(path.basename(directoryPath), '/', post));
      const id: string = post.replace(/\.md$/, '');
      const content: MarkdownFile = await import(`../posts/${key.slice(2)}`);
      const meta = matter(content.default);
      const { duration } = readTimeEstimate(content.default, 275, 12, 500, [
        'img',
        'Image',
      ]);

      files.push({
        id,
        slug: id,
        title: meta.data.title,
        lang: meta.data.lang,
        excerpt: meta.data.excerpt || null,
        date: meta.data.date,
        category: meta.data.category || null,
        readTime: Math.round(duration),
      });
    }
  }
  return files;
};

export const getSortedPostData = async () => {
  const posts = await getAllPostFileNames(postsDirectory);

  return posts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
};

export const getAllPostIds = async () => {
  const posts = await getAllPostFileNames(postsDirectory);
  return posts.map(({ id, lang }) => ({
    params: {
      id,
      lang,
    },
  }));
};

export async function getPostData(id) {
  const content = await import(`../posts${id}.md`);
  const meta = matter(content.default);
  const post = marked(meta.content);
  const { duration } = readTimeEstimate(content.default, 275, 12, 500, ['img', 'Image']);

  return {
    id,
    date: meta.data.date,
    title: meta.data.title,
    excerpt: meta.data.excerpt || null,
    contentHtml: post,
    category: meta.data.category || null,
    readTime: Math.round(duration),
  };
}
