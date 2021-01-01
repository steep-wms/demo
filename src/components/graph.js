import React from "react"
import * as d3 from "d3"

import * as dagreD3 from "dagre-d3"
import * as dagre from "dagre"
import { useEffect } from "react"

const jobData = require("../workflow.json")

// https://medium.com/@varvara.munday/d3-in-react-a-step-by-step-tutorial-cba33ce000ce
class App extends React.Component {
  constructor(props) {
    super(props)
    this.myRef = React.createRef()
    // read JSON
    this.vars = jobData.vars
    this.actions = jobData.actions
    this.variables = []
  }

  // scan JSON for variables and create nodes in the graph (ignores fixed vars like parameters)
  createVars(graph) {
    this.vars.forEach(element => {
      if (! Object.prototype.hasOwnProperty.call(element, "value")) {
        this.variables.push(element.id)
        // create node
        graph.setNode(element.id, { label: element.id, shape: "ellipse" })
      }
    })
  }

  // create nodes for workflow actions and connect them to in/outputs with edges
  createActions(actions, graph) {
    actions.forEach(element => {
      let inp = []
      let out = []

      // if action is a for loop, unpack its actions
      if (element["type"] === "for") {
        this.createActions(element["actions"], graph)
      }
      else {
        // check inputs
        if (Object.prototype.hasOwnProperty.call(element, "inputs")) {
          element["inputs"].forEach(input => {
            if (this.variables.includes(input.var)) {
              inp.push(input.var)
            }
          })
        }
        // check outputs
        if (Object.prototype.hasOwnProperty.call(element, "outputs")) {
          element["outputs"].forEach(output => {
            if (this.variables.includes(output.var)) {
              out.push(output.var)
            }
          })
        }
        // create node
        graph.setNode(element.service, { label: element.service, shape: "diamond" })
        // create edges from each input to action
        inp.forEach(i => {
          graph.setEdge(i, element.service)
        })
        // create edges from action to each output
        out.forEach(o => {
          graph.setEdge(element.service, o)
        })
      }
    })
    dagre.layout(graph)
  }

  componentDidMount() {
    // d3.select(this.myRef.current)
    //   .append("p")
    //   .text("Hello from D3")

    // convert workflow to graph ########

    let g = new dagreD3.graphlib.Graph().setGraph({})
    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function() { return {} })

    // create graph
    this.createVars(g)
    this.createActions(this.actions, g)

    // build svg
    let svg = d3.select(this.myRef.current)
                .append("svg")
                .attr("width", 500)
                .attr("height", 500)

    // style the graph
    let inner = svg.append("g").attr("fill", "none").style("stroke", "black")

    let render = new dagreD3.render()
    render(inner, g)

    // Center the graph
    let xCenterOffset = (svg.attr("width") - g.graph().width) / 2
    inner.attr("transform", "translate(" + xCenterOffset + ", 20)")
    svg.attr("height", g.graph().height + 40)
  }

  render() {
    return (
      <div ref={this.myRef}>
      </div>
    )
  }

}
export default App
