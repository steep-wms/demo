import styles from "../styles/Home.module.css"
import { Loader, ExternalLink, XOctagon, CheckSquare } from "react-feather"

/**
 * visualizes the status of a given worflow job in a button to the backend
 * @param payload holds the jobId of a workflow job and its corresponding status message and the URL of the Steep Sever
 * @returns a button/link to the workflow in the steep server
 */
const JobStatus = (payload) => {
  const data = payload["statusMsg"]
  const API_URL = payload["url"]

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
