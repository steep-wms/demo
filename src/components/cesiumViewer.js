// import Cesium from 'cesium/Cesium'
const CesiumViewer = (payload) => {
  const data = payload["statusMsg"]
  const url = payload["url"]
  const folder = payload["folder"]
  // const Cesium = require('cesium/Cesium')
  // const data = payload["statusMsg"]

  // const terrain = require("/tmp/out/tilesets/terrain/test/")
  // let viewer = new Cesium.Viewer("cesiumContainer")

  // no response yet
  if (data === undefined) return <div></div>

  // wait for successful finish of workflow
  if (data.status === "SUCCESS"){
    let path = url + "/index.html" + "?" + folder//[0] + "&" + folder[1]
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
