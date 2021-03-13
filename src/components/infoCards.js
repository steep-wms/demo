import React from "react"

import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, CardImg, Row, Col, Container } from "reactstrap"

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
                <CardText>With supporting text below as a naturalsdfdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd lead-in to additional content.</CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="sorted_file">
          <Row>
            <Col>
              <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
                <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tabId="tif_file">
          <Row>
            <Col>
            <Card body>
                <CardTitle>Special Title Treatment</CardTitle>
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
                <Button>Go somewhere</Button>
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
