import './App.css';

import React from 'react';
import Routes from "./routes";
import { withRouter } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <Routes />
    </div>
  );
}

export default withRouter(App);
