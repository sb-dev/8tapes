import './home.css';

import { Button } from 'antd';
import GoogleAuth from '../helpers/googleAuth';
import React from "react";
import tape from './tape.svg';

export default function Home(props) {

  async function browse() {
    await GoogleAuth.signIn();
    props.history.push("/browse");
  }
  
  return (
    <header className="home-header">
      <img src={tape} className="App-logo" alt="logo" />
      <h1 className={'handwritten'}>
        Sourced from the 8tapes community, curated for you.
      </h1>
      <Button onClick={browse} type="dashed" size={'large'}>Get Started</Button>
    </header>
  );
}