import './index.css';

import * as serviceWorker from './serviceWorker';

import App from './App';
import GoogleAuth from './helpers/googleAuth';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import config from './config';

const { googleServices } = config;

GoogleAuth.configure(
  {
    apiKey: googleServices.API_KEY,
    clientId: googleServices.CLIENT_ID,
    service: {
      discoveryUrl: googleServices.services.youtube.DISCOVERY_URL,
      scope: googleServices.services.youtube.SCOPE,
    }
  }
);

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
