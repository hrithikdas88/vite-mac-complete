// Stopwatch.js
import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import "./Stopwatch.css";
import axios from "axios";

function Stopwatch({ modalOpen, startDetection, stopDetection,idletime, setAddidle,addIdle }) {

  
  const initialProjects = [
    { id: 1, name: "Project 1", time: 0, isRunning: false, tasks: [] },
    { id: 2, name: "Project 2", time: 0, isRunning: false, tasks: [] },];

    const [projects, setProjects] = useState(initialProjects);
  
    // useEffect(() => {
    //   const fetchData = async () => {
    //     try {
    //       const response = await axios.get('http://192.168.1.242:8000/api/projects/project-data', {
    //         headers: {
    //           Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzE1MTMwOTE0LCJpYXQiOjE3MTUwODc3MTQsImp0aSI6ImUyMTUwNmY3ZDhhODQ5NGQ4ZTExNGQwNDJjMmJjZDZiIiwidXNlcl9pZCI6MjM1fQ.d3ZcYJnbbZaC43VTYIVIdndjS-aPB-T2h01mMD6Xook'
    //         }
    //       });
    //       const projectsWithTime = response.data.results.data.map(project => ({
    //         ...project,
    //         time: 0 
    //       }));
    //       setProjects(projectsWithTime);
    //     } catch (error) {
    //       console.error("Error fetching projects:", error);
    //     } finally {
    //       console.log("Projects fetched successfully.");
    //     }
    //   };
    
    //   fetchData();
    // }, []);

    const addIdleTime = () => {


      if(addIdle){
        console.log("lolll")
        console.log(idletime, "idletime")
        
        const idleSeconds = Math.round(idletime * 60); // Convert minutes to seconds
        console.log(idleSeconds, "idleseconds ")
        setProjects((projects) =>
          projects.map((project) =>
            project.isRunning ? { ...project, time: project.time + idleSeconds } : project
          )
        );
      

        setAddidle(false)
      }
     
    };


  useEffect(()=>{
    console.log("triggered")
   

    addIdleTime()

  }, [addIdle])

    

  useEffect(() => {
    const timers = projects.map((project) => {
      let timer;
      if (project.isRunning && !modalOpen) {
        timer = setInterval(() => {
          setProjects((projects) =>
            projects.map((p) =>
              p.id === project.id ? { ...p, time: p.time + 1 } : p
            )
          );
        }, 1000);
      } else {
        clearInterval(timer);
      }
      return timer;
    });

    return () => {
      timers.forEach((timer) => clearInterval(timer));
    };
  }, [projects, modalOpen]);

  const toggleStopwatch = (projectId) => {
    setProjects((projects) =>
      projects.map((project) =>
        project.id === projectId
          ? { ...project, isRunning: !project.isRunning }
          : { ...project, isRunning: false }
      )
    );

    const project = projects.find((p) => p.id === projectId);
    if (project.isRunning) {
      stopDetection();
    } else {
      startDetection();
    }
  };

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const totalProjectTime = projects.reduce((total, project) => total + project.time, 0);

  return (
    <div className="stopwatch-container">
      <h1>TimeTracker</h1>
      <div className="project-list">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <h2 className="project-name">{project.name}</h2>
            <div className="project-time">{formatTime(project.time)}</div>
            <div className="project-buttons">
              <Button
                variant={project.isRunning ? "danger" : "success"}
                onClick={() => toggleStopwatch(project.id)}
              >
                {project.isRunning ? "Stop" : "Start"}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="total-time-container">
        <h2>Total Time for All Projects</h2>
        <span className="total-time">{formatTime(totalProjectTime)}</span>
      </div>
      {/* <Button onClick={addIdleTime}>
        Add time
      </Button> */}
    </div>
  );
}

export default Stopwatch;
