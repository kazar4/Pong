import { useState, useEffect, useRef } from "react";
import './App.css';
import SketchTest from './SketchTest.js'

function App() {

  const [status, setStatus] = useState("Not Connected To A Room...");
  const [inputText, setInputText] = useState("None");
  const [sendData, setSendData] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        {/* <img src={logo} className="App-logo" alt="logo" /> */}

        <h1>Pong.</h1>

        <div class="Menu">
        <input class="Room" placeholder='Enter Room Code' onInput={e => setInputText(e.target.value)}></input>
        {/* 
        Link for button css
        https://codepen.io/Brandon-Stoyles/pen/RajYmd
         */}
        <button class="Enter" onClick={e => setSendData(true)}>Create Room/Join</button>
        </div>

        <div className='Status'>{status}</div>

        <SketchTest 
          status={status} 
          setStatus={setStatus} 
          inputText={inputText} 
          sendData={sendData}
          setInputText={setInputText}></SketchTest>

        {/*
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        */}

        {/*
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        > Learn React
        </a>
        */}
        
      </header>
    </div>
  );
}

export default App;
