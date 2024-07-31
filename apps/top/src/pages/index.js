import Head from 'next/head'

import { Ogp } from '../components/Ogp'
import { Header } from '../components/Header'
import { Profile } from '../components/Profile'
import { Blog } from '../components/Blog'
import { Works } from '../components/Works'
import { Contact } from '../components/Contact'


const Home = () => (
  <>
    <Head>
      <title>thinceller</title>
      <meta name="description" content="thinceller's portfolio site" />
    </Head>
    <Ogp />
    <Header />
    <main>
      <Profile />
      <Blog />
      <Works />
      <Contact />
      <style jsx global>{`
        body {
          font-family: sans-serif;
          font-weight: 300;
          font-size: 17px;
          color: black;
          background: #f5f5f5;
          margin: 80px;
        }

        section {
          margin-bottom: 50px;
        }

        h1 {
          font-weight: 300;
          font-size: 2rem;
        }

        h2 {
          font-weight: 300;
          font-size: 1.5rem;
        }

        h3 {
          font-weight: 300;
          font-size: 1.2rem;
        }

        p {
          font-weight: 300;
          font-size: 1rem;
        }

        ul {
          font-weight: 300;
          font-size: 1rem;
        }
      `}</style>
    </main>
  </>
)

export default Home
