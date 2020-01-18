const dev = {
    YOUTUBE_KEY: "",
  };
  
  const prod = {
    YOUTUBE_KEY: "",
  };
  
  // Default to dev if not set
  const config = process.env.APP_ENV === 'prod'
    ? prod
    : dev;
  
  export default {
    // Add common config values here
    PROVIDER: 'youtube',
    ...config
  };