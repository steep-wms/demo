// import Cesium from 'cesium/Cesium'
const CesiumViewer = (payload) => {
  const data = payload["statusMsg"]
  const url = payload["url"]
  // const Cesium = require('cesium/Cesium')
  // const data = payload["statusMsg"]

  // const terrain = require("/tmp/out/tilesets/terrain/test/")
  // let viewer = new Cesium.Viewer("cesiumContainer")

  // wait for successful finish of workflow
  if (data.status === "SUCCESS"){
    return(
      <div>
        <iframe src={url} height="600" width="800" ></iframe>
      </div>
    )
  }

  // return nothing while waiting for workflow
  return(
    <div></div>
  )
}

export default CesiumViewer
