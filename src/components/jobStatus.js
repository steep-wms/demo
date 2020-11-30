// URL of the Steep server
const API_URL = "http://localhost:8080"

/**
 * polls the status of a given worflow job
 * @param {string} payload holds the jobId of a workflow job
 * @returns {JSON} job status response of the steep server
 */
const JobStatus = (payload) => {
  const data = payload["statusMsg"]

  // ignore if no id is given (default before interaction)
  if (payload["jobId"] === "") return <div></div>

  // no response yet
  if (data === undefined) return <div>loading...</div>

  return (
    <div>
      <p>Status:</p>
      <pre id="json">{JSON.stringify(data.status, null, 2)}</pre>
    </div>
  )
}

export default JobStatus
