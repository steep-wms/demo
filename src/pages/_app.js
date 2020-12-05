import styles from "../styles/globals.scss"
import EventBus from "vertx3-eventbus-client"
import EventBusContext from "../components/EventBusContext"
import { useEffect, useState } from "react"

// URL of the Steep server
const API_URL = "http://localhost:8080"

function App({ Component, pageProps }) {

  const [eventBus, setEventBus] = useState()

  useEffect(() => {
    let eb = new EventBus(API_URL + "/eventbus")
    eb.enableReconnect(true)
    eb.onopen = () => {
      setEventBus(eb)
    }

    return () => {
      eb.close()
    }
  }, [])

  return (
    <EventBusContext.Provider value={eventBus}>
      <Component {...pageProps} />
      <style jsx>{styles}</style>
    </EventBusContext.Provider>
  )
}

export default App
