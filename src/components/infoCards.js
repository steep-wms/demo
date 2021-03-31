import React from "react"

import { TabContent, TabPane, Nav, NavItem, NavLink, Card, CardTitle, CardText, Row, Col, Container } from "reactstrap"

import CesiumViewer from "../components/cesiumViewer"

/**
 * Displays information of workflow partial results
 * @param payload the selected tab and a callback to highlight nodes in graph
 * @returns div with TabPane + Cards of information
 */
const InfoCards = (payload) => {
  const activeTab = payload["selection"]
  const toggle = payload["callback"]

  return (
    <div>
      <Container sm={{ size: 10, offset: 1 }}>
      <Nav tabs>
        <NavItem>
          <NavLink
            className={{ active: activeTab === "inputfile" }}
            onClick={() => { toggle("inputfile") }}
          >
            inputfile
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={{ active: activeTab === "sorted_file" }}
            onClick={() => { toggle("sorted_file") }}
          >
            sorted_file
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={{ active: activeTab === "tif_file" }}
            onClick={() => { toggle("tif_file") }}
          >
            tif_file
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={{ active: activeTab === "transformed_file" }}
            onClick={() => { toggle("transformed_file") }}
          >
            transformed_file
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={{ active: activeTab === "outputdirectory" }}
            onClick={() => { toggle("outputdirectory") }}
          >
            outputdirectory
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={activeTab} sm={{ size: 10, offset: 1 }}>
        <TabPane tabId="inputfile">
          <Row>
            <Col>
              <Card body>
                <CardTitle>Initial Condition</CardTitle>
                <img src="/images/xyz_file.png" alt="Visualization of a single tile of 3D points" width="100%" />
                <br/>
                <CardText>
                  We start with a <a href="https://www.opengeodata.nrw.de/produkte/geobasis/hm/dgm1_xyz/dgm1_xyz_paketiert/">Digital Terrain Model</a>&nbsp;
                    containing 3D points in the textbased format xyz.<br/>
                  For the workflow, we use 12 files where each is describing a square area with 4 million points.<br/>
                  A visualization of those point clouds can be seen above.<br/>
                  The points are declared in the EPSG:4647 coordinate reference system.
                </CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="sorted_file">
          <Row>
            <Col>
              <Card body>
                <CardTitle>First Step: Sorting</CardTitle>
                <Row>
                  <Col xs={{ size: 5, offset: 0 }}>
                    <img src="/images/inputfile.png" alt="Excerpt of the input file containing xyz coordinates" width="100%" />
                  </Col>
                  <Col xs={{ size: 5, offset: 2 }}>
                    <img src="/images/sorted_file.png" alt="Excerpt of the sorted input file containing xyz coordinates" width="100%" />
                  </Col>
                </Row>
                <br/>
                <CardText>
                  By default, the points are sorted by the x-coordinate column first, then by the second y-coordinate column (left image).<br/>
                  The GDAL tool we use for the next step, however, assumes the points are ordered by the y coordinate first, with increasing values for x.<br/>
                  As such, the first action is to sort each of the input files (right image).
                </CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="tif_file">
          <Row>
            <Col>
            <Card body>
                <CardTitle>Conversion to GeoTIFF</CardTitle>
                <img src="/images/tif_file.png" alt="Converted GeoTIFF file with height color-coded" width="100%" />
                <br/>
                <CardText>
                  Working with the original point clouds is quite unwieldy, given their 120 Megabyte file size and 4 million 3D points per file.<br/>
                  We use <a href="https://gdal.org/programs/gdal_translate.html">gdal_translate</a>&nbsp; to convert the sorted file to the GeoTIFF file format.<br/>
                  This format represents our 3D data in a 2D image with color-coded height (see legend to right in the image).<br/>
                  Additional metadata contains, among other things, the original map projection and coordinate system, while reducing the file size to a manageable 15 MB.
                </CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="transformed_file">
          <Row>
            <Col>
            <Card body>
                <CardTitle>Warping to globe</CardTitle>
                <img src="/images/transformed_file.png" alt="GeoTIFF warped in new geodetic coordinate system" width="100%" />
                <br/>
                <CardText>
                  The inital EPSG:4647 coordinate reference system of our input data is a projected coordinate system, meaning it has been flattened akin to a paper map.<br/>
                  For our goal of a true 3D globe visualization, we need to warp the points into another coordinate system, the World Geodetic System 1984, WGS:84, also called EPSG:4326.<br/>
                  Using <a href="https://gdal.org/programs/gdalwarp.html">gdalwarp</a>, our inputs are reprojected to fit the curvature of the planet.
                  In this example, missing data is left as zero height (notice the blue border and the changed scale of the legend in the image).
                </CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="outputdirectory">
          <Row>
            <Col>
            <Card body>
                <CardTitle>Mesh Creation and Live Demo</CardTitle>
                <CesiumViewer url={payload.url} folder={payload.folder} statusMsg={payload.statusMsg}/>
                <br/>
                <CardText>
                  The last step creates a <a href="https://github.com/CesiumGS/quantized-mesh">quantized mesh</a>&nbsp; from the warped GeoTIFFs.<br/>
                  This file structure includes a pyramid of heightmaps, implementing a level of detail scheme.<br/>
                  Supplied from a server, this allows for more terrain features being loaded the farther one zoomed in.<br/>
                  In turn, a distant viewport needs less detail, further decreasing transfer and computation overhead compared to the millions of points from the start of the workflow.<br/>
                  <br/>
                  Once the workflow execution is finished, the above image will be replaced by a live view of the resulting 3D visualization. Feel free to explore!
                </CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </TabContent>
      </Container>
    </div>
  )
}

export default InfoCards
