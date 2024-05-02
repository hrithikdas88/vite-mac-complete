import { useEffect, useState } from "react"
import Stopwatch from "./components/Stopwatch"

function App() {
  const [img, setImg] = useState("")

  useEffect(()=>{
    window.api.idletimer((event, data)=> {
     console.log(data, "idletime")
    })
    window.api.screenshotSrc((event, data)=> {
      setImg(data)
    })
 },[])
  const startdetection = () => window.electron.ipcRenderer.send('startdetection')
  const stopDetection = () => window.electron.ipcRenderer.send('stopdetection')
  let modalOpen = false


  return (
    <>
    <Stopwatch startDetection={startdetection} stopDetection={stopDetection} modalOpen = {modalOpen}/>
    
    <img src={img} alt="img"/>
    </>

  )
}

export default App

