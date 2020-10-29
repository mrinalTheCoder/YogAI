import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import firebase from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBXPg2s3xi5koHS-W2dgkkMe9r_2EDe4HQ",
  authDomain: "yogai2020.firebaseapp.com",
  databaseURL: "https://yogai2020.firebaseio.com",
  projectId: "yogai2020",
  storageBucket: "yogai2020.appspot.com",
  messagingSenderId: "634790331487",
  appId: "1:634790331487:web:85019a2421a36e101707ea"
};

firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
