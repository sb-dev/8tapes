import './home.css';

import { Button } from 'antd';
import React from "react";
import tape from './tape.png';

export default function Home(props) {

  function browse() {
    props.history.push("/browse");
  }
  
    return (
        <header className="App-header">
          <img src={tape} className="App-logo" alt="logo" />
          <p>
            Source from the 8tapes community, curated for you
          </p>
          <Button onClick={browse} type="primary">Get Started</Button>
        </header>
      );
}