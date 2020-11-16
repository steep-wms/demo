import Head from "next/head"
import Link from "next/link"
import styles from "../styles/Home.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Steep WMS Demo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to the <a href="https://steep-wms.github.io/">Steep</a> Playground!
        </h1>

        <p className={styles.description}>
          Get started by selecting one of the example datasets
        </p>

        <div className={styles.grid}>
          <Link href="/playground" className={styles.card}>
            <a>
              <h3>Card1 &rarr;</h3>
              <p>Lorem.</p>
            </a>
          </Link>

          <a href="https://" className={styles.card}>
            <h3>Card2 &rarr;</h3>
            <p>Ipsum!</p>
          </a>

        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://steep-wms.github.io/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/images/steep-logo.svg" alt="Steep Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
