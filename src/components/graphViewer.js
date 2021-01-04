import dynamic from "next/dynamic"

const GraphViewer = dynamic(
  (payload) => import('../components/graph'),
  { ssr: false , loading: () => <p>...generating graph...</p> }
)
export default GraphViewer
