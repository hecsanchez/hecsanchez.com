import { GetStaticProps, GetStaticPaths, NextPage } from 'next';

import { getAllPostIds, getPostData } from '@api';
import Layout from '@components/Layout';
import { Title, Text, Caption } from '@components/Typography';
import { PostTitle } from '@components/Post';

interface Props {
  locale: string;
  postData: {
    lang: string;
    title: string;
    slug: string;
    date: string;
    category: string;
    readTime: string;
    contentHtml: string;
  };
}

const Post: NextPage<Props> = ({ locale, postData }) => {
  const { title, contentHtml, category, date, readTime } = postData;
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return (
    <Layout title={title}>
      <article className="post-content">
        <Caption>{category}</Caption>
        <PostTitle>
          <Title>{title}</Title>
          <time>{new Date(date).toLocaleDateString(locale, dateOptions)}</time> •{' '}
          <span>
            {locale === 'es' ? `LECTURA DE ${readTime} MINS` : `${readTime} MIN READ`}
          </span>
        </PostTitle>
        <Text className="content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </article>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const postData = await getPostData(`/${params.lang}/${params.id}`);

  return {
    props: {
      locale: params?.lang || 'en',
      postData,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = await getAllPostIds();

  return {
    paths,
    fallback: false,
  };
};

export default Post;
