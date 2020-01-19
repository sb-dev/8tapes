const dev = {
  googleServices: {
    API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    services: {
      youtube: {
        DISCOVERY_URL: 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
        SCOPE: 'https://www.googleapis.com/auth/youtube.force-ssl'
      }
    }
  }
};

const prod = {
  googleServices: {
    API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    services: {
      youtube: {
        DISCOVERY_URL: 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
        SCOPE: 'https://www.googleapis.com/auth/youtube.force-ssl'
      }
    }
  }
};

// Default to dev if not set
const config = process.env.APP_ENV === 'prod'
  ? prod
  : dev;

export default {
  YOUTUBE_DISCOVERY_URL: 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
  ...config
};