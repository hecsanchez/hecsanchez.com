import Head from 'next/head';
import Header from '@components/Header';
import { Container, Content } from './Layout.styled';

interface LayoutProps {
  className?: string;
  children: React.ReactNode;
  desc?: string;
  title: string;
  thumb?: string;
}

const Layout: React.FC<LayoutProps> = ({ className, children, title, desc, thumb }) => {
  const description = desc || 'A Next.js multilingual site';
  const thumbnail =
    thumb ||
    'https://avatars0.githubusercontent.com/u/3080957?s=460&u=66c664c8f2b2c5f4c9b395caf3dbabf2f334330c&v=4';

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={thumbnail} />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={description} />
        <meta property="twitter:image" content={thumbnail} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        <link
          type="text/css"
          rel="stylesheet"
          href="//fast.fonts.net/cssapi/b37f351e-73ae-416e-89af-2e3d1d657360.css"
        />
      </Head>
      <Header />
      <Container>
        <Content>{children}</Content>
      </Container>
      {/* <Footer>
        <p>Hector Sanchez - 2020</p>
      </Footer> */}
    </>
  );
};

export default Layout;
