import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.resolve(process.cwd(), "posts");
const getAllPostFileNames = async (directoryPath, filesList = [], files=[]) => {
  const context = require.context('../posts', true, /\.md$/)
  for(const key of context.keys()){
    const post = key.slice(5);

    if (fs.statSync(`${directoryPath}/${key}`).isDirectory()) {
      filesList = await getAllPostFileNames(`${directoryPath}/${key}`, filesList);
    } else {
      filesList.push(path.join(path.basename(directoryPath), "/", post));
      const id = post.replace(/\.md$/, "");
      const content = await import(`../posts/${key.slice(2)}`);
      const meta = matter(content.default)
      console.log('meta', meta)
      files.push({
        id,
        slug: id,
        title: meta.data.title,
        lang: meta.data.lang
      })
    }
  }
  return files;
}

export const getSortedPostData = async() => {
  const posts = await getAllPostFileNames(postsDirectory);
  console.log('posts', posts)

  return posts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export const getAllPostIds = async () => {
  const posts = await getAllPostFileNames(postsDirectory);
  return posts.map(({id, lang}) => ({
    params: {
      id,
      lang,
    },
  }));
}

export async function getPostData(id) {
  const content = await import(`../posts${id}.md`);
  const meta = matter(content.default)

  return {
    id,
    date: meta.data.date,
    title: meta.data.title,
    contentHtml: meta.content,
  };
}