const dev = {
  googleServices: {
    API_KEY: 'AIzaSyBkfEKMvO5vm2yXon6DyyAEuD9LPR9TjM0',
    CLIENT_ID: '863053770362-m9q5n2tbefn0nlvs7d6e16bkj7djl24v.apps.googleusercontent.com',
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
const config = process.env.REACT_APP_ENV === 'prod'
  ? prod
  : dev;

export default {
  ...config
};