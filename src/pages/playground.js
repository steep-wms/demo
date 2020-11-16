import Head from "next/head"
import styles from "../styles/Home.module.css"

// example workflow
const data = {
  api: "4.1.0",
  vars: [{
    id: "sleep_seconds",
    value: 10
  }],
  actions: [{
    type: "execute",
    service: "sleep",
    inputs: [{
      id: "seconds",
      var: "sleep_seconds"
     }]
  }]
}

export default function Playground() {
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
        Test the backend connection by sub­mitting a sim­ple work­flow to Steep.
        The work­flow con­sists of a sin­gle ex­e­cute ac­tion that sleeps for 10 sec­onds and then quits.
        </p>
        <p className={styles.description}>
        Ex­e­cute by clicking the button below:
        </p>

        <button onClick={handleClick} className="btn btn-primary">Execute the workflow!</button>
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

// sends the example workflow on button-click
const handleClick = (e) => {
  // console.log(e)
  postJSON(data)
}

/**
 * POSTs the given JSON payload "data" to the Steep WMS server.
 * The server needs to run with "-e STEEP_HTTP_CORS_ENABLE=true" (docker) or "steep.​http.​cors.​enable=true" (config).
 * @param {JSON} data
 */
function postJSON(data) {
  fetch("http://localhost:8080/workflows", {
    method: "POST",
    mode: "cors",
    // Steep doesnt accept any headers by default
    body: JSON.stringify(data)
    })
    .then(response => {
      console.log(response)
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.blob()
      })
}

