import Head from "next/head"
import styles from "../styles/Home.module.css"
import EventBus from "vertx3-eventbus-client"
import EventBusContext from "../components/EventBusContext"
import { useRef, useState, useContext, useEffect } from "react"

import JobStatus from "../components/jobStatus"

// URL of the Steep server
const API_URL = "http://localhost:8080"

// example workflow
const jobData = {
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
  const [id, setId] = useState("")
  const [status, setStatus] = useState("")

  const eb = useContext(EventBusContext)

  useEffect(() => {
    const registeredHandlers = {}

    if (eb !== undefined) {
      let address = "steep.submissionRegistry.submissionStatusChanged"
      let handler = (error, message) => {
        console.log(message.body)
        // first status always gets set
        if (id === "") setStatus(message.body)
        // check if current ids match (e.g. if there are 2 workflows running, only react to the one in id)
        else if (message.body.submissionId === id) setStatus(message.body)
      }
        eb.registerHandler(address, handler)
        registeredHandlers[address] = handler
    }

    return () => {
      if (eb !== undefined && eb.state === EventBus.OPEN) {
        for (let address in registeredHandlers) {
          eb.unregisterHandler(address, registeredHandlers[address])
        }
      }
    }
  }, [eb, id])

  // sends the example workflow on button-click
  const handleClick = async () => {
    // send JSON fetch request and wait for reply
    const { data, error } = await postJSON(jobData)
    // reply is positive
    if (data !== undefined) {
      let status = "Workflow "+data.status+" with ID "+data.id
      ref.current.innerHTML = status
      // send JobId to jobStatus component
      setId(data.id)
    }
    // bad reply
    else {
      ref.current.innerHTML = error
      // clear old id
      setId("")
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
        <JobStatus jobId={id} statusMsg={status}/>
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
 * @returns { error, data } data contains the JSON reply, while error holds any occured error messages
 */
async function postJSON(data) {
  let response = { error: undefined, data: undefined }
  await fetch(API_URL + "/workflows", {
    method: "POST",
    mode: "cors",
    // Steep doesnt accept any headers by default
    body: JSON.stringify(data)
    })
    .then(async res => {
      // response from server is OK
      if (res.ok) {
        const reply = await res.json()
        response["data"] = reply
        return response
      // bad request
      }
      else throw Error("Request rejected: "+res.status)
    })
    // also catch HTTP errors
    .catch(err => {
      response["error"] = `Caught error: ${err}.`
      return response
    })
  return response
}
