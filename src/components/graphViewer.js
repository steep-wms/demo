import dynamic from "next/dynamic"

const GraphViewer = dynamic(
  () => import('../components/graph'),
  { ssr: false , loading: () => <p>...generating graph...</p>}
)
export default GraphViewer
