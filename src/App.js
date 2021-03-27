import React from 'react';
import './App.css';
import {YogControl} from "./yog-control.js";

function App() {
  return (
    <div>
      <img src={require("./logo.png")} alt={"YogAI"} />
      <YogControl />
    </div>
  );
}

export default App;
