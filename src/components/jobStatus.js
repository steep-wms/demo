import useSWR from "swr"

// URL of the Steep server
const API_URL = "http://localhost:8080/workflows"

async function fetcher(...args) {
  const [url, payload] = args

  const res = await fetch(url+"/"+payload["jobid"])
  return await res.json()
}

/**
 * polls the status of a given worflow job
 * @param {string} payload holds the jobId of a workflow job
 * @returns {JSON} job status response of the steep server
 */
const JobStatus = (payload) => {
  const { data, error } = useSWR([API_URL, payload], fetcher)

  // ignore poll if no id is given
  if (payload["jobid"] === "") return <div></div>

  if (error) return <div>failed to load</div>
  if (data === undefined) return <div>loading...</div>

  return (
    <div>
      <p>Status:</p>
      <pre id="json">{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default JobStatus
