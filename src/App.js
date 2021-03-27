import React from 'react';
import './App.css';
import {Typography} from "@material-ui/core";
import {YogControl} from "./yog-control.js";

function App() {
  return (
    <div>
      <img src={require("./logo.png")} />
      <YogControl />
    </div>
  );
}

export default App;
