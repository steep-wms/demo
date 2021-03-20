const GraphDescription = () => {
  return (
    <ul>
      <li>
        Diamond-shapes represent the microservices that are called to modify data. <br />
          Hovering over them shows you their respective JSON workflow model.
      </li>
      <li>
        Circles show the assignment of fixed inputs needed by the <a href="https://steep-wms.github.io/#execute-actions">execute actions</a>.
      </li>
      <li>
        Ellipses hold the names of dynamic variables that contain the <a href="https://steep-wms.github.io/#parameters">in- and outputs</a> during the execution. <br />
          Clicking them will show more details below.
      </li>
      <li>
        Rectangles: Nodes grouped by a colored rectangle symbolize a <a href="https://steep-wms.github.io/#for-each-actions">for-each action</a>. <br />
          The smaller rectangle before the group holds a list of items, for which the actions inside are repeated. <br />
            Individual outputs are then joined in the variable after the for-each group.
      </li>
    </ul>
  )
}

export default GraphDescription
