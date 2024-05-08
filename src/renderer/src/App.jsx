// App.js
import { useEffect, useState } from 'react'
import Stopwatch from './components/Stopwatch'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import { idleTimeState } from './components/Atoms/Idle'
import { useRecoilState } from 'recoil'

function App() {
  const [img, setImg] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [idletime, setIdletime] = useState(0)
  const [activitypersent, setActivitypersent] = useState('')
  const [auth, setAuth] = useState(false)
  const [idle , setidle] =  useRecoilState(idleTimeState)
  const [addIdle, setAddidle] = useState(false)

  useEffect(() => {
    window.api.idletimer((event, data) => {
      console.log(data, "idletime")
      setidle(data)
    })
    window.api.screenshotSrc((event, data) => {
      setImg(data)
    })
    window.api.showidlemoadl((event, data) => {
      if (data) {
        setShowModal(true)
        setIdletime(data)
      }
    })
    window.api.activitypersent((e, data) => {
      if (data) {
        setActivitypersent(data)
      }
    })
    window.api.auth((e, data) => {
      if (data) {
        setAuth(true)
      }
    })
  }, [])

  const startDetection = () => window.electron.ipcRenderer.send('startdetection')
  const stopDetection = () => window.electron.ipcRenderer.send('stopdetection')

  const handlemodalclose = () =>{
    window.electron.ipcRenderer.send('IdlemodalHasbeemclosed')
    setShowModal(false)
  } 

  const handleAddidletime = () => {
    setAddidle(true)
    setShowModal(false)
    window.electron.ipcRenderer.send('IdlemodalHasbeemclosed')
  }

 

  return (
    <>
      <div className={'main-content'}>
        {auth ? 'Autheticated' : 'Need authentication'}

        <Stopwatch
          startDetection={startDetection}
          stopDetection={stopDetection}
          modalOpen={showModal}
          idletime={idletime}
          addIdle = {addIdle}
          setAddidle ={setAddidle}
        />

        {activitypersent && (
          <p className="activity-percentage">Your activity percentage is {activitypersent}%</p>
        )}
      </div>
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Header>
          <Modal.Title>Idle Time Alert</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {idletime && (
            <p>
              You have been idle for{' '}
              {Math.round(idletime) > 1
                ? `${Math.round(idletime)} minutes`
                : `${Math.round(idletime)} minute`}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handlemodalclose}>
            Continue
          </Button>
          <Button variant="primary" onClick={handleAddidletime}>
            Add idle time
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default App
