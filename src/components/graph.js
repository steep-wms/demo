import React from "react"
import * as d3 from "d3"

import * as dagreD3 from "dagre-d3"
import * as dagre from "dagre"

// const jobData = require("../workflow.json")

class App extends React.Component {
  constructor(props) {
    super(props)
    // load workflow from props
    const jobData = props["jobData"]
    this.myRef = React.createRef()
    // read JSON
    this.vars = jobData.vars
    this.actions = jobData.actions
    this.variables = []
    this.colors = d3.schemePastel2 // color scheme with 8 entries
    this.groupCount = 0
    // svg size
    this.width = 900
    this.height = 500
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
  createActions(actions, graph, group = undefined) {
    actions.forEach(element => {
      let inp = []
      let out = []

      // if action is a for loop, unpack its actions
      if (element["type"] === "for") {
        // select color (repeats after 8 groups)
        let color = this.colors[this.groupCount % 8]
        // increment groups
        this.groupCount += 1
        // set group name
        let name = "group" + this.groupCount
        // add cluster for loop
        graph.setNode(name, { label: "for loop", clusterLabelPos: "top", style: "fill: " + color })
        this.createActions(element["actions"], graph, name)
        // setup input, enumerator, output, yields
        graph.setNode(element.input, { label: element.input, shape: "rect" })
        graph.setNode(element.output, { label: element.output, shape: "rect" })
        graph.setEdge(element.input, element.enumerator)
        graph.setEdge(element.yieldToOutput, element.output)

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
        // assign nodes to cluster
        if (group !== undefined) {
          graph.setParent(element.service, group)
        }
        // create edges from each input to action
        inp.forEach(i => {
          graph.setEdge(i, element.service)
          // assign nodes to cluster
          if (group !== undefined) {
            graph.setParent(i, group)
          }
        })
        // create edges from action to each output
        out.forEach(o => {
          graph.setEdge(element.service, o)
          // assign nodes to cluster
          if (group !== undefined) {
            graph.setParent(o, group)
          }
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

    let g = new dagreD3.graphlib.Graph({ compound:true }).setGraph({})
    // set graph to Left-to-Right (horizontal) layout
    g.graph().rankDir = "LR"
    g.graph().ranksep = 20
    g.graph().edgesep = 10

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function() { return {} })

    // create graph
    this.createVars(g)
    this.createActions(this.actions, g)

    // build svg
    let svg = d3.select(this.myRef.current)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height)

    // style the graph
    let inner = svg.append("g").attr("fill", "none").style("stroke", "black")

    let render = new dagreD3.render()
    render(inner, g)

    // scale & center graph
    let scale = 0.99 // initial value used as mild padding
    let maxZoom = 2
    let graphWidth = inner.node().getBBox().width
    let graphHeight = inner.node().getBBox().height

    let midX = inner.node().getBBox().x + graphWidth / 2
    scale = Math.min(scale / Math.max(graphWidth / this.width, graphHeight / this.height), maxZoom)
    let translate = [this.width / 2 - scale * midX, 0]

    inner.attr("transform", "translate(" + translate + "), scale(" + scale +")")
    // reduce needed height
    svg.attr("height", inner.node().getBoundingClientRect().height)
  }

  render() {
    return (
      <div ref={this.myRef}>
      </div>
    )
  }

}
export default App
