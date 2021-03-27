/**
 * Cesium Terrain Server Iframe
 * @param {*} payload holds the url to the Cesium server, the status of the workflow, and the workflow id/folder with resulting quantized mesh
 * @returns an iframe of the Cesium visualization or a screenshot of it while running
 */
const CesiumViewer = (payload) => {
  const data = payload["statusMsg"]
  const url = payload["url"]
  const folder = payload["folder"]

  // wait for successful finish of workflow
  if (data.status === "SUCCESS"){
    // assemble path to let Cesium server know which files to serve
    let path = url + "/index.html" + "?" + folder
    return(
      <iframe src={path} width="100%" height="600px"></iframe>
    )
  }

  // return example screenshot while waiting for workflow to finish
  return(
    <img src="/images/cesium.png" alt="Screenshot of the resulting 3D terrain" width="100%" />
  )
}

export default CesiumViewer
