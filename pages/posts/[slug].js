import Head from 'next/head';
import Link from "next/link";
import MarkdownIt from "markdown-it";
import { connectToDatabase } from "../../util/mongodb";
import { useRouter } from "next/router";
import DefaultErrorPage from "next/error";
import getBlogIndex from "../../util/blogFetch";
import { NextSeo } from "next-seo";
import { Skeleton } from "antd";
import { PageHeader, Layout } from 'antd';
const { Content } = Layout;
import { Typography } from 'antd';
import Footers from "../../components/Footers";
const { Title } = Typography;

import styles from './../../components/BlogPosts.module.css'
import dynamic from "next/dynamic";
const PSidebar = dynamic(() => { return import("../../components/PostMenu") }, { ssr: false });

export default function Home({ movies }) {
  const router = useRouter();

  if (router.isFallback) {
    return <Skeleton active />;
  }
  try {
    let md = new MarkdownIt();
    const { title, slug, dateCreated, author, category } = movies[0];
    let result = md.render(movies[0].content);
    function downloadFile() {
      var link = document.createElement('a');
      link.download = 'data.md';
      var blob = new Blob([movies[0].content], { type: 'text/plain' });
      link.href = window.URL.createObjectURL(blob);
      link.click();
    }
    const categories = ["Fashion",
      "Travel",
      "Music",
      "Lifestyle",
      "Fitness",
      "DIY",
      "Sports",
      "Developers",
      "General"];
    return (
      <div>
        <NextSeo
          title={title}
          description={result.replace(/<[^>]+>/g, "").slice(0, 149)}
          openGraph={{
            type: "article",
            url: `"https://zefny.com/posts/${slug}`,
            article: {
              publishedTime: dateCreated,
            },
            tags: title.split(" "),
          }}
        />


        <Layout style={{ minHeight: '100vh' }} >
          <PSidebar categories={categories} download={downloadFile} />
          <Layout className="site-layout">
            <PageHeader
              className={styles["myHeader"]}
              onBack={() => router.back()}
              title="Back"
              subTitle=""
            />


            <Content className={styles["post-c"]}>
              <Title level={1}>{title}</Title>
              <Title level={5}>Posted in <Link href={`/category/${category}`}><a><b>{category}</b></a></Link> by <b>{author}</b> on <b>{dateCreated}</b></Title>
              <br /><br />
              <div className={styles["markdown-body"]} dangerouslySetInnerHTML={{ __html: result }}></div>
            </Content>
            <Footers />

          </Layout>


        </Layout>





      </div>
    );
  } catch (e) {
    return (
      <div>
        <Head>
          <meta name="robots" content="noindex" />
        </Head>
        <DefaultErrorPage statusCode={404} />
      </div>
    );
  }
}

export async function getStaticPaths() {
  const movies = await getBlogIndex();

  // Get the paths we want to pre-render based on posts
  const paths = movies.map((post) => ({
    params: { slug: post.slug },
  }));

  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  try {
    const { db } = await connectToDatabase();
    const { slug } = params;
    const movies = await db
      .collection("movies")
      .find({ slug: slug })
      .toArray();
    if (movies.length === 0)
      throw new Error("invalid");
    return {
      props: { movies: JSON.parse(JSON.stringify(movies)) },
    };
  } catch (e) {
    return {
      notFound: true,
    };
  }

}
