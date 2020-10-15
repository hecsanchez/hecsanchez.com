import React from 'react';
import { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { getSortedPostData } from '@api';
import Link from 'next/link';

import useTranslation from '@intl/useTranslations';
import Layout from '@components/Layout';
import { Title, Subtitle, Text, Caption } from '@components/Typography';
import { Excerpt } from '@components/Post';

interface Props {
  locale: string;
  allPostsData: {
    date: string;
    title: string;
    lang: string;
    excerpt: string;
    description: string;
    readTime: string;
    id: any;
  }[];
}

const Index: NextPage<Props> = ({ locale, allPostsData }: Props) => {
  const { t } = useTranslation();
  const postsData = allPostsData.filter((post) => post.lang === locale);
  const LatestPost = postsData[0];
  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return (
    <Layout className="posts" title={t('homeMetaTitle')}>
      <div>
        <Subtitle>{t('homeIntro')}</Subtitle>
        <Title size="lg">{t('homeTitle')}</Title>
        <Text>
          <div dangerouslySetInnerHTML={{ __html: t('homeDescription') }} />
        </Text>
        <Excerpt>
          <Caption>{t('fromTheBlog')}</Caption>
          <Link href={`/[lang]/blog/[id]`} as={`/${locale}/blog/${LatestPost.id}`}>
            <a>
              <Subtitle>{LatestPost.title}</Subtitle>
            </a>
          </Link>
          <Text>
            <p>{LatestPost.excerpt}</p>
          </Text>
          <time>{new Date(LatestPost.date).toLocaleDateString(locale, dateOptions)}</time>{' '}
          • <span>{LatestPost.readTime} MIN READ</span>
        </Excerpt>
        <Link href={`/[lang]/blog/`} as={`/${locale}/blog`}>
          <Text>
            <p>
              <a>{t('viewAllPosts')}</a>
            </p>
          </Text>
        </Link>
      </div>
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async (ctx) => {
  const allPostsData = await getSortedPostData();

  return {
    props: {
      locale: ctx.params?.lang || 'es',
      allPostsData,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { lang: 'en' } }, { params: { lang: 'es' } }],
    fallback: false,
  };
};

export default Index;
