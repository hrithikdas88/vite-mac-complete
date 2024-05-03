import { useEffect, useState } from "react"
import Stopwatch from "./components/Stopwatch"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function App() {
  const [img, setImg] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [idletime, setIdletime] = useState("")

  useEffect(() => {
    window.api.idletimer((event, data) => {
      console.log(data, "idletime")
    })
    window.api.screenshotSrc((event, data) => {
      setImg(data)
    })
    window.api.showidlemoadl((event, data) => {
      if (data) {
        console.log(data)
        setShowModal(true)
        setIdletime(data)
      }
    })
  }, [])
  const startdetection = () => window.electron.ipcRenderer.send('startdetection')
  const stopDetection = () => window.electron.ipcRenderer.send('stopdetection')
  let modalOpen = false


  return (
    <>
      <Stopwatch startDetection={startdetection} stopDetection={stopDetection} modalOpen={modalOpen} />
      {showModal && <p>You have been idle for {Math.round(idletime)>1 ? `${Math.round(idletime)} minutes` : `${Math.round(idletime)} minute`  } </p>}

      {/* <Button variant="primary" onClick={()=>setShowModal(false)}>
        Launch demo modal
      </Button> */}

      {/* <Modal show={showModal}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you are reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" >
            Close
          </Button>
          <Button variant="primary" >
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal> */}

      {/* <img src={img} alt="img" /> */}
    </>

  )
}

export default App

