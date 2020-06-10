import './home.css';

import { Button, Carousel } from 'antd';
import React, { useState } from "react";

import GoogleAuth from '../helpers/googleAuth';
import { Link } from 'react-router-dom';
import config from '../config';
import tape from '../assets/tape.svg';

export default function Home(props) {
  const [onboarding, setOnboarding] = useState(0);

  function onChange(a, b, c) {
    console.log(a, b, c);
  }

  async function browse() {
    // if(config.googleServices.ENABLE_AUTH) {
    //   await GoogleAuth.signIn();
    // }
    
    props.history.push("/browse");
  }
  
  return (
    <>
      {onboarding !== 0 ?
        <content>
            {onboarding === 1 && <div className="inner-content">
              <h1>
                Let's find out what you like.
              </h1>
              <Button onClick={() => setOnboarding(2)} type="primary">Connect your Youtube account</Button>
              <br />
              <Button onClick={() => setOnboarding(3)} type="dashed">Skip</Button>
            </div>}
            {onboarding === 2 && <div className="inner-content">
              <h1>
                Choose playlists to import.
              </h1>
              <Button onClick={() => setOnboarding(3)} type="dashed">Confirm</Button>
            </div>}
            {onboarding === 3 && <div className="inner-content">
              <h1>
                Choose categories that interest you.
              </h1>
              <Button onClick={() => browse()} type="primary">Let's go</Button>
              <br />
              <Button onClick={() => setOnboarding(1)} type="dashed">Back</Button>
            </div>}
        </content> : 
        <header className="home-header">
          <img src={tape} className="App-logo" alt="logo" />
          <h1 className={'handwritten'}>
            Sourced from the 8tapes community, curated for you.
          </h1>
          <Button onClick={() => setOnboarding(1)} type="dashed" size={'large'}>Get Started</Button>
        </header> 
      }
      <footer><Link to="/privacy-policy">Privacy Policy</Link> | <Link to="/terms-of-service">Terms of Service</Link></footer>
    </>
  );
}