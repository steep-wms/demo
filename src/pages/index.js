import Head from "next/head"
import styles from "../styles/Home.module.css"
import EventBus from "vertx3-eventbus-client"
import EventBusContext from "../components/EventBusContext"
import { useState, useContext, useEffect } from "react"

import { Row, Col, Container } from "reactstrap"

import { Send } from "react-feather"

import JobStatus from "../components/jobStatus"
import InfoCards from "../components/infoCards"
import GraphViewer from "../components/graphViewer"
import GraphDescription from "../components/graphDescription"

// URL of the Steep server
const API_URL = "http://localhost:8080"
// URL of the Cesium Terrain Server
const CESIUM_URL = "http://localhost:8888"

const jobData = require("../workflow.json")

export default function Playground() {

  const [id, setId] = useState("")
  const [status, setStatus] = useState("")
  const [chains, setChains] = useState(new Object)
  const [clickedNode, setClickedNode] = useState("inputfile")

  const eb = useContext(EventBusContext)

  // handle eventbus messages from Steep Server
  useEffect(() => {
    const registeredHandlers = {}

    if (eb !== undefined) {
      let address = "steep.submissionRegistry.submissionStatusChanged"
      let addressChain = "steep.submissionRegistry.processChainStatusChanged"

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

  // sends the workflow on button-click
  const handleClick = async () => {
    // send JSON fetch request and wait for reply
    const { data, error } = await postJSON(jobData)
    // reply is positive
    if (data !== undefined) {
      // send JobId to jobStatus component
      setId(data.id)
    }
    // bad reply
    else {
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
          Check out the Steep Workflow Management in action by sub­mitting a realistic work­flow. <br/>
          In this example, we will apply different actions to visualize 3D terrain data. <br/>
          <br/>
          A schematic of the work­flow can be seen below:
        </p>

        <Container className="container-larger">
        <Row>
          <Col xs={{ size: 9, offset: 0 }}>
            <GraphViewer jobData={jobData} chains={chains} selection={clickedNode} callback={(node) => setClickedNode(node)} />
          </Col>
          <Col xs={{ size: 3, offset: 0 }} style={{ alignSelf: "center" }} >
            <GraphDescription />
          </Col>
        </Row>
        </Container>
        <br/>

        <div className="btns">
          <p onClick={handleClick} className="btn btn-primary"><Send className="feather" />{" "} Execute the workflow!</p>
          <JobStatus url={API_URL} jobId={id} statusMsg={status} />
        </div>

        <p className={styles.description + " container"}>
          Execute the workflow and check the backend to see <a href="https://steep-wms.github.io/">Steep</a> in action.<br/>
          Inspect the graph and the information below for details about intermediate results and a live demo, once the workflow finished.
        </p>
        <br/>
        <InfoCards selection={clickedNode} callback={(node) => setClickedNode(node)} url={CESIUM_URL} folder={id} statusMsg={status} />

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
