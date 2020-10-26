import React from 'react';
import './App.css';
import {PersonOutlined} from "@material-ui/icons";
import {AppBar} from "@material-ui/core";
import {Avatar} from "@material-ui/core";
import {Toolbar} from "@material-ui/core";
import {Typography} from "@material-ui/core";
import {YogControl} from "./yog-control.js";

function MyAppBar(props) {
  return (
    <AppBar style={{background:'#2c3e50'}}>
      <Toolbar>
        <Typography
          variant="h6"
          style={{ marginLeft: "auto", marginRight: "auto" }}>
          YogAI
        </Typography>
        <Avatar>
          <PersonOutlined />
        </Avatar>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  return (
    <div>
      <div className="App">
        <MyAppBar />
      </div>
      <YogControl />
    </div>
  );
}

export default App;
