import Head from "next/head"
import styles from "../styles/Home.module.css"
import EventBus from "vertx3-eventbus-client"
import EventBusContext from "../components/EventBusContext"
import { useRef, useState, useContext, useEffect } from "react"

import JobStatus from "../components/jobStatus"
import InfoCards from "../components/infoCards"
import GraphViewer from "../components/graphViewer"

// URL of the Steep server
const API_URL = "http://localhost:8080"
// URL of the Cesium Terrain Server
const CESIUM_URL = "http://localhost:8888"

// example workflow
// const jobData = {
//   api: "4.1.0",
//   vars: [{
//     id: "sleep_seconds",
//     value: 5
//   }],
//   actions: [{
//     type: "execute",
//     service: "sleep",
//     inputs: [{
//       id: "seconds",
//       var: "sleep_seconds"
//      }]
//   }]
// }
const jobData = require("../workflow.json")

export default function Playground() {

  const ref = useRef()
  const [id, setId] = useState("")
  const [status, setStatus] = useState("")
  const [chains, setChains] = useState(new Object)
  const [clickedNode, setClickedNode] = useState("inputfile")

  const eb = useContext(EventBusContext)

  useEffect(() => {
    const registeredHandlers = {}

    if (eb !== undefined) {
      let address = "steep.submissionRegistry.submissionStatusChanged"
      let addressChain = "steep.submissionRegistry.processChainStatusChanged"
      // processChainProgressChanged for in-chain progress
      // handles submissions
      let handler = (error, message) => {
        // first status always gets set
        if (id === "") setStatus(message.body)
        // check if current ids match (e.g. if there are 2 workflows running, only react to the one in id)
        else if (message.body.submissionId === id) setStatus(message.body)
      }
      // handles process chains
      let handlerChain = async (error, message) => {
        if (message.body.submissionId === id) {
          let chainId = message.body.processChainId
          setChains( (prevState, props) => {
            let c = JSON.parse(JSON.stringify(prevState))
            if (Object.prototype.hasOwnProperty.call(prevState, chainId)) {
              c[chainId]["status"] = message.body.status
              return c
            }
            else {
              let exe = fetchChainExe(chainId)
              c[chainId] = { executables: exe, status: message.body.status }
              return c
            }
          })
        }
      }
      eb.registerHandler(address, handler)
      registeredHandlers[address] = handler
      eb.registerHandler(addressChain, handlerChain)
      registeredHandlers[addressChain] = handlerChain
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
      let status = "Workflow " + data.status + " with ID " + data.id
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
        <br/>

        <p className={styles.description}>
          Check out the Steep Workflow Management in action by sub­mitting a sim­ple work­flow. <br/>
          In this example, we will apply different actions to visualize 3D terrain data. <br/>
          <br/>
          A visualization of the work­flow can be seen below:
        </p>

        <GraphViewer jobData={jobData} chains={chains} selection={clickedNode} callback={(node) => setClickedNode(node)} />
        <br/>

        <ul>
          <li>
            Diamond-shapes represent the microservices that are called to modify data. <br/>
            Hovering over them shows you their respective JSON workflow model.
          </li>
          <li>
            Circles show the assignment of fixed inputs needed by the <a href="https://steep-wms.github.io/#execute-actions">execute actions</a>.
          </li>
          <li>
            Ellipses hold the names of dynamic variables that contain the <a href="https://steep-wms.github.io/#parameters">in- and outputs</a> during the execution. <br/>
            Clicking them will show more details below.
          </li>
          <li>
            Rectangles: Nodes grouped by a colored rectangle symbolize a <a href="https://steep-wms.github.io/#for-each-actions">for-each action</a>. <br/>
            The smaller rectangle before the group holds a list of items, for which the actions inside are repeated. <br/>
            Individual outputs are then joined in the variable after the for-each group.
          </li>
        </ul>

        <p className={styles.description}>
          We start with a <a href="https://www.opengeodata.nrw.de/produkte/geobasis/hm/dgm1_xyz/dgm1_xyz_paketiert/">Digital Terrain Model</a>&nbsp;
           containing 3D points in a textbased format. <br/>
        </p>

        <InfoCards selection={clickedNode} callback={(node) => setClickedNode(node)} url={CESIUM_URL} folder={id} statusMsg={status} />

        <div className="btns">
          <p onClick={handleClick} className="btn btn-primary">Execute the workflow!</p>
        </div>

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

/**
 * fetches the executables of a processchain with the given id
 * @param chainId the id of the chain
 * @returns {JSON} the executables of the chain
 */
async function fetchChainExe(chainId) {
  let data = await fetch(API_URL+"/processchains/"+chainId).then(function(response) {
    return response.text()
  })
  return JSON.parse(data).executables
}
