
/**
 * visualizes the status of a given worflow job
 * @param payload holds the jobId of a workflow job and its corresponding status message
 * @returns job status response of the steep server
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
