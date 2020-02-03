const dev = {
  googleServices: {
    API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    ENABLE_AUTH: false,
    services: {
      youtube: {
        URL: 'http://localhost:3001',
        DISCOVERY_URL: 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
        SCOPE: 'https://www.googleapis.com/auth/youtube.force-ssl',
        QUERY_LIMIT: process.env.REACT_APP_YOUTUBE_QUERY_LIMIT ? process.env.REACT_APP_YOUTUBE_QUERY_LIMIT : 5000
      },
      googleAnalytics: {
        TRACKING_ID: process.env.REACT_APP_GOOGLE_TRACKING_ID
      }
    }
  }
};

const prod = {
  googleServices: {
    API_KEY: process.env.REACT_APP_GOOGLE_API_KEY,
    CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    ENABLE_AUTH: true,
    services: {
      youtube: {
        URL: 'https://www.googleapis.com/youtube/v3',
        DISCOVERY_URL: 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest',
        SCOPE: 'https://www.googleapis.com/auth/youtube.force-ssl',
        QUERY_LIMIT: process.env.REACT_APP_YOUTUBE_QUERY_LIMIT ? process.env.REACT_APP_YOUTUBE_QUERY_LIMIT : 5000
      },
      googleAnalytics: {
        TRACKING_ID: process.env.REACT_APP_GOOGLE_TRACKING_ID
      }
    }
  }
};

// Default to dev if not set
const config = process.env.APP_ENV === 'prod'
  ? prod
  : dev;

export default {
  ...config
};