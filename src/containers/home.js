import './home.css';

import { Button } from 'antd';
import React from "react";
import tape from './tape.svg';

export default function Home(props) {

  async function browse() {
    props.history.push("/browse");
  }
  
  return (
    <header className="home-header">
      <img src={tape} className="App-logo" alt="logo" />
      <p>
        Source from the 8tapes community, curated for you
      </p>
      <Button onClick={browse} type="dashed">Get Started</Button>
    </header>
  );
}