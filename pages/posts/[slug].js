import Head from 'next/head';
import Link from "next/link";
import MarkdownIt from "markdown-it";
import { connectToDatabase } from "../../util/mongodb";
import Router, { useRouter } from "next/router";
import DefaultErrorPage from "next/error";
import getBlogIndex from "../../util/blogFetch";
import { NextSeo } from "next-seo";
import { Skeleton } from "antd";
import { PageHeader,Layout,Button} from 'antd';
const {  Footer, Sider, Content } = Layout;
import { Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
import {useState} from 'react';

import styles from '../../components/BLogPosts.module.css'

export default function Home({ movies }) {
  const router = useRouter();

  if (router.isFallback) {
    return <Skeleton active />;
  }
  try {
    let md = new MarkdownIt();
    const { title, slug, dateCreated, author , category} = movies[0];
    let result = md.render(movies[0].content);
    function downloadFile(){
      var link = document.createElement('a');
link.download = 'data.md';
var blob = new Blob([movies[0].content], {type: 'text/plain'});
link.href = window.URL.createObjectURL(blob);
link.click();
    }
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

        
 <Layout  style={{ minHeight: '100vh' }} >
      <PageHeader
    className={styles["myHeader"]}
    onBack={() => router.push('/')}
    title="Back"
    subTitle=""
  /> 
      <Layout>
<Sider style={{
          overflow: "auto",
          height: "100vh",
          position: "sticky",
          top: 0,
          left: 0,
          minWidth:"60px"
        }} width="60"
      >
 <div className={styles["side-actions"]}>
<Button onClick={downloadFile} type="primary" icon={<DownloadOutlined />} size="large">
          
        </Button>
        </div>
      </Sider>
        <Content className={styles["post-c"]}>
        <Title level={1}>{title}</Title>
        <Title level={5}>Posted in <Link href={`/category/${category}`}><a><b>{category}</b></a></Link> by <b>{author}</b> on <b>{dateCreated}</b></Title>
        <br/><br/>
         <div className={styles["markdown-body"]} dangerouslySetInnerHTML={{ __html: result }}></div>
         </Content>
     
        
      </Layout>
   
      <Footer className={styles["foot-c"]}>Footer</Footer>
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
      if (movies.length===0)
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
