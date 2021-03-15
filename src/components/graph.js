import React from "react"
import * as d3 from "d3"

import * as dagreD3 from "dagre-d3"
import * as dagre from "dagre"

class App extends React.Component {
  constructor(props) {
    super(props)
    // callback for clicked Nodes
    this.callback = props["callback"]
    // load workflow from props
    const jobData = props["jobData"]
    // load workflow chain status && name of the active node in infoCards
    this.state = { chains: props["chains"], activeNode: props["selection"] }
    this.myRef = React.createRef()
    // read JSON
    this.vars = jobData.vars
    this.actions = jobData.actions
    this.variables = []
    this.colors = d3.schemePastel2 // color scheme with 8 entries
    this.groupCount = 0
    // svg size
    this.width = Math.round(0.8*window.innerWidth) // 80% of window size
    this.height = 500

    this.g = new dagreD3.graphlib.Graph({ compound:true }).setGraph({})
    this.nodes = []
    this.chainInputs = {}
  }

  async parseChains(chains) {
    for (let c in chains) {
      let name = c
      let executables = await chains[c].executables
      let status = chains[c].status
      // if already parsed, update status
      if (Object.prototype.hasOwnProperty.call(this.chainInputs, name)) {
        this.chainInputs[name].status = status
      }
      // create chainInputs dict
      else {
        let obj = { status: status }
        // for each executable (only multiple for chains)
        for (let i = 0; i < executables.length; i++) {
          let exe = executables[i]
          let service = exe.serviceId
          let inputs = []
          // check arguments
          for (let ii = 0; ii < exe.arguments.length; ii++) {
            let arg = exe.arguments[ii]
            // only look at inputs
            if (arg.type === "input") {
              // ignore service
              if (arg.id !== exe.serviceId) {
                let id = arg.variable.id
                // in loops, id has suffix $iterator e.g. $5 -> strip it
                let pos$ = id.lastIndexOf("$")
                if (pos$ !== -1) {
                  id = id.substring(0, pos$)
                }
                // save variable unless its already in
                if (!inputs.includes(id)) {
                  inputs.push(id)
                }
              }
            }
          }
          // save each service of a chain with its inputs (possible duplicates dont matter since they'd have the same status)
          obj[service] = inputs
        }
        this.chainInputs[name] = obj
      }
    }
  }

  matchNodesToChain(node) {
    let service = node.service
    let foundStatus = null
    // go through all parsed chains
    for (const [chainName, obj] of Object.entries(this.chainInputs)) {
      // check if service is in chain
      if (Object.prototype.hasOwnProperty.call(obj, service)) {
        // check if inputs match
        if (obj[service].length === node.inputs.length) {
          let counter = 0
          for (let i = 0; i < node.inputs.length; i++) {
            if (node.inputs[i].var === obj[service][i]) {
              counter += 1
            }
          }
          if (counter === node.inputs.length) {
            // if there is at least one running task for that node, keep the status
            if (obj.status === "RUNNING") {
              return [true, obj.status]
            }
            else {
              foundStatus = obj.status
            }
          }
        }
      }
    }
    if (foundStatus !== null) {
      return [true, foundStatus]
    }
    return [false]
  }

  async componentDidUpdate(prevProps) {
    const chains = this.props["chains"]
    if (JSON.stringify(chains) !== JSON.stringify(this.state.chains)) {
      this.setState({ chains: chains })

      await this.parseChains(chains)

      this.nodes.forEach(n => {
        let [boo, status] = this.matchNodesToChain(JSON.parse(n))
        if (boo) {
          d3.select(this.myRef.current).select("svg").selectAll("g")
            .select("[id='id" + n + "']").attr("class", "node " + status)
        }
      })
    }
    // highlights active node from infoCards
    const activeNode = this.props["selection"]
    if (activeNode !== this.state.activeNode) {
      this.setState({ activeNode: activeNode })

      d3.select(this.myRef.current).select("svg").selectAll("g")
        // remove all filters
        .style("filter", null)
        // add only to active node
        .select("[id='" + activeNode + "']")
        .style("filter", "url(#glow)")
    }
  }

  // scan JSON for variables and create nodes in the graph
  createVars(graph) {
    this.vars.forEach(element => {
      // filter out fixed parameters
      if (! Object.prototype.hasOwnProperty.call(element, "value")) {
        this.variables.push(element.id)
        // create node
        graph.setNode(element.id, { label: element.id, shape: "ellipse", id: element.id })
      }
      else {
        this.variables.push(element.id)
        // assemble html text for node label
        let text = element.id+" =<br/>"+element.value
        // create node
        graph.setNode(element.id, { label: text, labelType: "html", shape: "circle", labelStyle: "font-weight: 1000; text-align: center; font-size:0.9em" })
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
        let name = JSON.stringify(element.actions)//"group" + this.groupCount
        // add cluster for loop
        graph.setNode(name, { label: "for-each action", clusterLabelPos: "top", style: "fill: " + color + ";fill-opacity: 0.5" })
        this.createActions(element["actions"], graph, name)
        // setup input, enumerator, output, yields
        graph.setNode(element.input, { label: element.input, shape: "rect", id: element.input })
        graph.setNode(element.output, { label: element.output, shape: "rect", id: element.output })
        graph.setEdge(element.input, element.enumerator)
        graph.setEdge(element.yieldToOutput, element.output)

      }
      // "normal" nodes
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
        graph.setNode(JSON.stringify(element), { label: element.service, shape: "diamond", id: "id"+JSON.stringify(element), class: "" }) // match class to status CSS fill color (ERROR, SUCCESFUL, RUNNING)
        // add node id to list
        this.nodes.push(JSON.stringify(element))
        // assign nodes to cluster
        if (group !== undefined) {
          graph.setParent(JSON.stringify(element), group)
        }
        // create edges from each input to action
        inp.forEach(i => {
          graph.setEdge(i, JSON.stringify(element))
          // assign nodes to cluster
          if (group !== undefined) {
            graph.setParent(i, group)
          }
        })
        // create edges from action to each output
        out.forEach(o => {
          graph.setEdge(JSON.stringify(element), o)
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
    let g = this.g
    // set graph to Left-to-Right (horizontal) layout
    g.graph().rankDir = "LR"
    g.graph().ranksep = 20
    g.graph().edgesep = 10
    // g.graph().align = "DR"

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
    // set tooltip
    let tooltip = d3.select("body")
      .append("pre")
      .attr("position", "absolute")
      .attr("class", "tooltip")
      .style("opacity", 0)
    // nodes tooltips
    this.nodes.forEach(n => {
      inner.selectAll("g").select("[id='id" + n + "']")
        .on("mouseover", function(d) {
          d3.select(this).style("cursor", "pointer")
          tooltip.transition()
            .duration(250)
            .style("opacity", .9)
          })
        .on("mousemove", function(event, d) {
          tooltip
          .html(function(e) {
            return "<pre id=json>" + JSON.stringify(JSON.parse(n), null, 2) + "</pre>"
          })
          .style("left", (event.pageX+5) + "px")
          .style("top", (event.pageY) + "px")
        })
        .on("mouseout", function(d) {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0)
      })
    })
    // this is that and that is this hook
    let that = this
    // show info about intermediate results onClick
    let vars_to_inspect = ["inputfile", "sorted_file", "tif_file", "transformed_file", "outputdirectory"]
    let gs = inner.selectAll("g")
    vars_to_inspect.forEach(v => {
      gs.select("[id='" + v + "']")
      .on("mouseover", function(d) {
          d3.select(this).style("cursor", "pointer")
        })
      .on("click", function(d) {
        that.callback(v)
        })
    })

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

    // glow filter based on https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization/
    //Container for the gradients
    let defs = svg.append("defs")

    //Filter for the outside glow
    let filter = defs.append("filter")
      .attr("id", "glow")
    filter.append("feGaussianBlur")
      .attr("in", "SourceGraphic")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur")
    filter.append("feMorphology")
      .attr("in", "coloredBlur")
      .attr("operator", "dilate")
      .attr("radius", "2")
      .attr("result", "coloredBlur")
    let feMerge = filter.append("feMerge")
    feMerge.append("feMergeNode")
      .attr("in", "coloredBlur")
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic")
  }

  render() {
    return (
      <div ref={this.myRef}>
      </div>
    )
  }

}
export default App
