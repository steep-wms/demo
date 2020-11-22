import Head from "next/head"
import styles from "../styles/Home.module.css"
import { useRef } from "react"

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

  const ref = useRef()

  // sends the example workflow on button-click
  const handleClick = async () => {
    // send JSON fetch request and wait for reply
    const reply = await postJSON(data)
    // console.log(reply)
    // reply is positive
    if (reply[0] === 1) {
      let status = "Workflow "+reply[1].status+" with ID "+reply[1].id
      ref.current.innerHTML = status
    }
    // bad reply
    else {
      ref.current.innerHTML = reply[1].error
    }
  }

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
        <p ref={ref}></p>
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

/**
 * POSTs the given JSON payload "data" to the Steep WMS server.
 * The server needs to run with "-e STEEP_HTTP_CORS_ENABLE=true" (docker) or "steep.​http.​cors.​enable=true" (config).
 * @param {JSON} data
 * @returns {{int}, {JSON}} int is either 1 for succesful fetch or -1 for error. payload/error-message is in the JSON
 */
async function postJSON(data) {
  const response = await fetch("http://localhost:8080/workflows", {
    method: "POST",
    mode: "cors",
    // Steep doesnt accept any headers by default
    body: JSON.stringify(data)
    })
    .then(async res => {
      // response from server is OK
      if (res.ok) {
        const reply = await res.json()
        console.log(reply)
        return [1, reply]
      // bad request
      }
      else throw Error("Request rejected: "+res.status)
    })
    // also catch HTTP errors
    .catch(err => {return [-1, { error:"Caught error: "+err+"." }]})
  return response
}

