import React from "react"

import { TabContent, TabPane, Nav, NavItem, NavLink, Card, CardTitle, CardText, Row, Col, Container } from "reactstrap"

import CesiumViewer from "../components/cesiumViewer"

/**
 * visualizes the status of a given worflow job
 * @param payload holds the jobId of a workflow job and its corresponding status message
 * @returns job status response of the steep server
 */
const InfoCards = (payload) => {
  const activeTab = payload["selection"]
  const toggle = payload["callback"]

  // no response yet
  // if (data === undefined) return <div>loading...</div>

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
                <CardTitle>Special Title Treatment</CardTitle>
                <img src="/images/xyz_file.png" alt="Screenshot of the resulting 3D terrain" width="100%" />
                <CardText>xyz coord, 4 mil points</CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="sorted_file">
          <Row>
            <Col>
              <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <Row>
                  <Col xs={{ size: 5, offset: 0 }}>
                    <img src="/images/inputfile.png" alt="Screenshot of the resulting 3D terrain" width="100%" />
                  </Col>
                  <Col xs={{ size: 5, offset: 2 }}>
                    <img src="/images/sorted_file.png" alt="Screenshot of the resulting 3D terrain" width="100%" />
                  </Col>
                </Row>
                <CardText>left org x-col first, right sorted y-col first</CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="tif_file">
          <Row>
            <Col>
            <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <img src="/images/tif_file.png" alt="Screenshot of the resulting 3D terrain" width="100%" />
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="transformed_file">
          <Row>
            <Col>
            <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <img src="/images/transformed_file.png" alt="Screenshot of the resulting 3D terrain" width="100%" />
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="outputdirectory">
          <Row>
            <Col>
            <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <CesiumViewer url={payload.url} folder={payload.folder} statusMsg={payload.statusMsg}/>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
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
