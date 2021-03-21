import styles from "../styles/Home.module.css"
import { Loader, ExternalLink, XOctagon, CheckSquare } from "react-feather"
const API_URL = "http://localhost:8080"

/**
 * visualizes the status of a given worflow job
 * @param payload holds the jobId of a workflow job and its corresponding status message
 * @returns job status response of the steep server
 */
const JobStatus = (payload) => {
  const data = payload["statusMsg"]

  let url = API_URL
  let icon = <ExternalLink className="feather" />

  // if no id is given (default before interaction)
  if (payload["jobId"] === "") {
    url = API_URL
    icon = <ExternalLink className="feather" />
  }

  // if workflow is running
  if (data.status === "RUNNING") {
    url = API_URL + "/workflows/" + payload["jobId"]
    icon = <Loader className="spinner feather" />
  }

  // if workflow failed
  if (data.status === "ERROR") {
    url = API_URL + "/workflows/" + payload["jobId"]
    icon = <XOctagon className="feather" />
  }

  // if workflow completed
  if (data.status === "SUCCESS") {
    url = API_URL + "/workflows/" + payload["jobId"]
    icon = <CheckSquare className="feather" />
  }

  return (
    <a
    className="btn"
    href={url}
    target="_blank"
    rel="noopener noreferrer"
  >
    {icon}
    {" "} Check the backend {" "}
    <img src="/images/steep-logo.svg" className={styles.logo}/>
  </a>
  )
}

export default JobStatus
