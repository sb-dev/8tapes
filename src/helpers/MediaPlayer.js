import React from "react";
import axios from "axios";
import { getProgress } from "./mediaPlayerHelpers";
import { loadScriptAsync } from "./loadScript";
import youTubePlayer from "youtube-player";

const cast = window.cast;
const chrome = window.chrome;

const SENDER_SDK_URL =
  '//www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';

/**
 * MediaPlayer
 *
 * Methods to implement:
 *  - play()
 *  - pause()
 *  - stop()
 *  - seekTo(time)
 *  - load(mediaIndex)
 *  - isMediaLoaded(mediaIndex)
 *  - prepareToPlay()
 *  - getMediaDuration()
 *  - getCurrentMediaTime()
 *  - setVolume(volumeSliderPosition)
 *  - mute()
 *  - unMute()
 *  - isMuted()
 */

const TIMER_STEP = 500;

export const MediaPlayerState = {
  IDLE: "idle",
  UNSTARTED: "unstarted",
  ENDED: "ended",
  PLAYING: "playing",
  PAUSED: "paused",
  BUFFERING: "buffering",
  CUED: "cued",
};

const PlayerDefaultEventHandlers = {
  onPlayerReady: (event) => console.info("Ready", event),
  onPlayerError: (event) => console.info("ERROR", event),
  unstarted: (event) => console.info("Unstarted", event),
  onEnd: (event) => console.info("Ended", event),
  onPlay: (event) => console.info("Playing", event),
  onPause: (event) => console.info("Paused", event),
  onBuffer: (event) => console.info("Buffering", event),
  onCue: (event) => console.info("Cued", event),
};

export default class MediaPlayer extends React.Component {
  static PlayerType = {
    LOCAL: "LOCAL",
    CAST: "CAST",
    YOUTUBE: "YOUTUBE",
  };

  constructor({
    target,
    onReady,
    onProgressChange,
    onVolumeChange,
    onStateChange,
  }) {
    super();

    this.target = target;
    this.playerContainer = null;
    this.playerHandler = null;

    // Player state
    this.playerState = MediaPlayerState.IDLE;
    this.currentPlayerType = MediaPlayer.PlayerType.YOUTUBE
    this.currentMediaIndex = 0;
    this.currentMediaTime = 0;
    this.mediaDuration = -1;
    this.timer = null;

    // Event handlers
    this.onReady = onReady;
    this.updatePlayerState = onStateChange
    this.updateProgressDisplay = onProgressChange;
    this.updateVolumeDisplay = onVolumeChange;
  }

  componentDidMount() {
    this.castPlayer = new CastPlayer(
      this.switchPlayer,
      this.handlePlayerStateChange,
      this.updateVolumeDisplay
    );
    
    this.youTubePlayer = new YoutubePlayer(
      this.playerContainer,
      this.handlePlayerStateChange
    );
    
    this.localPlayer = new LocalPlayer();
  }

  shouldComponentUpdate({ target: nextTarget }) {
    if (nextTarget && this.target !== nextTarget) {
      this.youTubePlayer.destroy()
      const isPreviousStateLoaded = this.restorePreviousState(nextTarget)

      if(!isPreviousStateLoaded) {
        this.currentMediaTime = 0;
        this.switchPlayer(MediaPlayer.PlayerType.YOUTUBE)
      } else if (this.currentPlayerType === MediaPlayer.PlayerType.CAST 
         && !cast.framework.CastContext.getInstance().getCurrentSession()) {
          this.switchPlayer(MediaPlayer.PlayerType.YOUTUBE)
      } else {
        this.switchPlayer(this.currentPlayerType);
      }
      
      this.setCurrentTarget(nextTarget)
      return true;
    }

    return false;
  }

  componentDidUpdate() {
    if(this.target) {
      this.load(this.playerState);
    }
  }

  componentWillUnmount() {
    this.stopProgressTimer();
  }

  switchPlayer = (playerType, loadMedia = true) => {
    this.stopProgressTimer();

    this.updatePlayerType(playerType)
    const playerStateBeforeSwitch = this.playerState;
    
    if (playerStateBeforeSwitch === MediaPlayerState.PLAYING && this.playerHandler){
      this.playerHandler.pause()
    }

    switch (playerType) {
      case MediaPlayer.PlayerType.LOCAL:
        this.playerHandler = this.localPlayer;
        break;
      case MediaPlayer.PlayerType.CAST:
        this.playerHandler = this.castPlayer;
        break;
      case MediaPlayer.PlayerType.YOUTUBE:
      default:
        this.playerHandler = this.youTubePlayer;
        break;
    }

    this.onReady({ target: this.playerHandler });
    
    if (playerStateBeforeSwitch !== MediaPlayerState.IDLE) {
      loadMedia && this.load(playerStateBeforeSwitch);
    }
  }

  async load(playerState) {
    await this.playerHandler.load(playerState, this.currentMediaIndex, this.currentMediaTime, {
      onEnd: (event) => {
        this.currentMediaTime = 0;
        this.stopProgressTimer();
      },
      onPlay: (event) => this.prepareToPlay(),
      onPause: (event) => this.stopProgressTimer(),
    });
  }

  prepareToPlay() {
    this.updateVolumeDisplay({ data: this.playerHandler.getVolume() });
    this.startProgressTimer();
  }

  incrementMediaTimeHandler() {
    this.updateProgress(this.mediaDuration, this.playerHandler.getCurrentTime());
  }

  startProgressTimer() {
    this.stopProgressTimer();
    this.timer = setInterval(
      () => this.incrementMediaTimeHandler(),
      TIMER_STEP
    );
  }

  stopProgressTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateCurrentTarget(currentMediaIndex) {
    localStorage.setItem('8tapes-current-media-index', currentMediaIndex);
    this.currentMediaIndex = currentMediaIndex;
  }

  retrieveCurrentTarget() {
    return localStorage.getItem('8tapes-current-media-index');
  }

  setCurrentTarget(target) {
    this.target = target;
    if(target) {
      this.currentMediaIndex = target.id;
      this.mediaDuration = target.duration;

      this.updateCurrentTarget(this.currentMediaIndex)
    }
  }

  updatePlayerType(playerType) {
    localStorage.setItem('8tapes-player-type', playerType);
    this.currentPlayerType = playerType
  }

  retrievePlayerState() {
    this.currentPlayerType = localStorage.getItem('8tapes-player-type')
    this.playerState = localStorage.getItem('8tapes-player-state');
    return this.currentPlayerType
  }

  updateProgress(mediaDuration, currentMediaTime) {
    localStorage.setItem('8tapes-current-media-time', currentMediaTime);
    this.setProgress(mediaDuration, currentMediaTime)
  }

  retrieveProgress(mediaDuration) {
    const currentMediaTime = localStorage.getItem('8tapes-current-media-time');
    this.setProgress(mediaDuration, currentMediaTime)
    return currentMediaTime
  }

  setProgress(mediaDuration, currentMediaTime) {
    this.currentMediaTime = currentMediaTime;
    const progress = getProgress(mediaDuration, currentMediaTime);
    this.updateProgressDisplay({ data: progress });
  }

  restorePreviousState(currentTarget) {
      const previousMediaIndex = this.retrieveCurrentTarget()
      if(previousMediaIndex !== currentTarget.id) {
        return false;
      }
      
      this.retrievePlayerState()
      this.retrieveProgress(currentTarget.duration)
      return true
  }

  handlePlayerStateChange = (event) => {
    this.playerState = event.data
    localStorage.setItem('8tapes-player-state', this.playerState);
    this.updatePlayerState(event)
  }

  refContainer = (container) => {
    this.playerContainer = container;
  };

  render() {
    return (
      <div
        id="media-player"
        className="image-wrapper"
        ref={this.refContainer}
        style={{  
          backgroundImage: `url(${this.target ? this.target.thumbnail.url : ''})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat'
        }}
      />
    );
  }
}

/**
 * Youtube player
 *
 * https://developers.google.com/youtube/iframe_api_reference#top_of_page
 *
 * @param {*} props
 */
class YoutubePlayer {
  static PlayerState = {
    UNSTARTED: -1,
    ENDED: 0,
    PLAYING: 1,
    PAUSED: 2,
    BUFFERING: 3,
    CUED: 5,
  };

  constructor(playerContainer, updatePlayerState) {
    this.playerContainer = playerContainer;
    this.updatePlayerState = updatePlayerState;
    this.youTubePlayer = null;

    this.eventHandlers = {
      ...PlayerDefaultEventHandlers,
    };
  }

  /**
   * https://developers.google.com/youtube/iframe_api_reference#onReady
   *
   * @param {Object} event
   *   @param {Object} target - player object
   */
  onPlayerReady = (event) => {
    this.youTubePlayer = event.target;
    this.eventHandlers.onPlayerReady(event);
  };

  /**
   * https://developers.google.com/youtube/iframe_api_reference#onError
   *
   * @param {Object} event
   *   @param {Integer} data  - error type
   *   @param {Object} target - player object
   */
  onPlayerError = (event) => {
    this.eventHandlers.onPlayerError(event);
  };

  /**
   * https://developers.google.com/youtube/iframe_api_reference#onStateChange
   *
   * @param {Object} event
   *   @param {Integer} data  - status change type
   *   @param {Object} target - actual YT player
   */
  onPlayerStateChange = (event) => {
    switch (event.data) {
      case YoutubePlayer.PlayerState.ENDED:
        this.eventHandlers.onEnd(event);
        this.updatePlayerState({ data: MediaPlayerState.ENDED });
        break;

      case YoutubePlayer.PlayerState.PLAYING:
        this.eventHandlers.onPlay(event);
        this.updatePlayerState({ data: MediaPlayerState.PLAYING });
        break;

      case YoutubePlayer.PlayerState.PAUSED:
        this.eventHandlers.onPause(event);
        this.updatePlayerState({ data: MediaPlayerState.PAUSED });
        break;

      case YoutubePlayer.PlayerState.BUFFERING:
        this.eventHandlers.onBuffer(event);
        this.updatePlayerState({ data: MediaPlayerState.BUFFERING });
        break;

      case YoutubePlayer.PlayerState.CUED:
        this.eventHandlers.onCue(event);
        this.updatePlayerState({ data: MediaPlayerState.CUED });
        break;

      default:
        this.eventHandlers.unstarted(event);
        this.updatePlayerState({ data: MediaPlayerState.UNSTARTED });
        break;
    }
  };

  setEventHandlers(eventHandlers) {
    this.eventHandlers = {
      ...PlayerDefaultEventHandlers,
      ...eventHandlers,
    };
  }

  load(playerState, videoId, currentMediaTime, eventHandlers) {
    this.setEventHandlers(eventHandlers);
    if (!this.internalPlayer)
      this.internalPlayer = this.initInternalPlayer(this.playerContainer);

    if (playerState === MediaPlayerState.PAUSED) {
      this.internalPlayer.cueVideoById(videoId, currentMediaTime);
    } else {
      this.internalPlayer.loadVideoById(videoId, currentMediaTime);
    }
  }

  play() {
    this.youTubePlayer.playVideo();
  }

  pause() {
    this.youTubePlayer.pauseVideo();
  }

  seekTo(time) {
    this.youTubePlayer.seekTo(time);
  }

  getCurrentTime() {
    return this.youTubePlayer.getCurrentTime();
  }

  getVolume() {
    return this.youTubePlayer.getVolume();
  }

  setVolume(value) {
    return this.youTubePlayer.setVolume(value);
  }

  destroy() { 
    this.internalPlayer && this.internalPlayer.destroy(); 
    this.internalPlayer = null
  }

  initInternalPlayer(playerContainer) {
    const opts = {
      width: "90px",
      height: "60px",
      playerVars: {
        controls: 0,
      },
    };

    const internalPlayer = youTubePlayer(playerContainer, opts);
    internalPlayer.on("ready", this.onPlayerReady);
    internalPlayer.on("error", this.onPlayerError);
    internalPlayer.on("stateChange", this.onPlayerStateChange);

    return internalPlayer;
  }
}

export class CastPlayer {
  static PlayerState = {
    // No media is loaded into the player. For remote playback, maps to
    // the PlayerState.IDLE state.
    IDLE: "IDLE",
    // Player is in PLAY mode but not actively playing content. For remote
    // playback, maps to the PlayerState.BUFFERING state.
    BUFFERING: "BUFFERING",
    // The media is loaded but not playing.
    LOADED: "LOADED",
    // The media is playing. For remote playback, maps to the PlayerState.PLAYING state.
    PLAYING: "PLAYING",
    // The media is paused. For remote playback, maps to the PlayerState.PAUSED state.
    PAUSED: "PAUSED",
  };

  static loadCastSDK() {
    if (window['cast'] && window['cast']['framework']) {
      return Promise.resolve();
    }
    return loadScriptAsync(SENDER_SDK_URL);
  }

  static loadFramework() {
    return new Promise((resolve, reject) => {
      CastPlayer.loadCastSDK()
        .then(() => {
          console.warn('Cast sender lib has been loaded successfully');
        })
        .catch(e => {
          console.warn('Cast sender lib loading failed', e);
          reject(e);
        });
    });
  }

  static initialiseCastApi() {
    cast.framework.CastContext.getInstance().setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
    });
  }

  static requestCastSession() {
    return new Promise((resolve) => {
      cast.framework.CastContext.getInstance().requestSession().then(
          function() { resolve() },
          function(errorCode) { console.error('Error code: ' + errorCode); }
      );
    })
  }

  constructor(switchPlayer, updatePlayerState, updateVolumeDisplay) {
    this.updatePlayerState = updatePlayerState;
    this.updateVolumeDisplay = updateVolumeDisplay;
    this.switchPlayer = switchPlayer

    this.eventHandlers = {
      ...PlayerDefaultEventHandlers,
    };

    this.initInternalPlayer()
  }

  onPlayerReady = () => {
    this.eventHandlers.onPlayerReady();
  };

  onPlayerError = () => {
    this.eventHandlers.onPlayerError();
  };

  onPlayerStateChange = (playerState) => {
    switch(playerState) {
      case CastPlayer.PlayerState.PLAYING:
        this.eventHandlers.onPlay({});
        this.updatePlayerState({ data: MediaPlayerState.PLAYING });
        break;

      case CastPlayer.PlayerState.PAUSED:
        this.eventHandlers.onPause({});
        this.updatePlayerState({ data: MediaPlayerState.PAUSED });
        break;

      case CastPlayer.PlayerState.BUFFERING:
        this.eventHandlers.onBuffer({});
        this.updatePlayerState({ data: MediaPlayerState.BUFFERING });
        break;

      default:
        this.eventHandlers.unstarted({});
        this.updatePlayerState({ data: MediaPlayerState.UNSTARTED });
        break;
    }
  }

  setEventHandlers(eventHandlers) {
    this.eventHandlers = {
      ...PlayerDefaultEventHandlers,
      ...eventHandlers,
    };
  }

  async load(playerState, videoId, currentMediaTime, eventHandlers) {
    this.setEventHandlers(eventHandlers)

    await this.castVideo(videoId, currentMediaTime);
  }

  play() {
    if (this.remotePlayer.isPaused) {
      this.remotePlayerController.playOrPause();
    }
  }

  pause() {
    if (!this.remotePlayer.isPaused) {
      this.remotePlayerController.playOrPause();
    }
  }

  seekTo(time) {
    this.remotePlayer.currentTime = time;
    this.remotePlayerController.seek();
  }

  getCurrentTime() {
    return this.remotePlayer.currentTime;
  }

  getVolume() {
    return this.remotePlayer.volumeLevel * 100;
  }

  setVolume(volumeLevel) {
    this.remotePlayer.volumeLevel = volumeLevel / 100;
    this.remotePlayerController.setVolumeLevel();
  }

  destroy() {}

  async initInternalPlayer() {
    await CastPlayer.loadFramework();
    this.remotePlayer = new cast.framework.RemotePlayer();
    this.remotePlayerController = new cast.framework.RemotePlayerController(
      this.remotePlayer
    );

    this.remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
      () => {
        if(this.isConnected()) {
          this.switchPlayer(MediaPlayer.PlayerType.CAST);
          this.onPlayerReady();
        } else {
          this.switchPlayer(MediaPlayer.PlayerType.YOUTUBE);
        }
      }
    );

    this.remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED,
      () => {
        this.updateVolumeDisplay({ data: this.getVolume() })
      }
    );

    this.remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED,
      () => {
        this.onPlayerStateChange(this.remotePlayer.playerState)
      }
    );
  }

  isConnected() {
    return cast && cast.framework && this.remotePlayer.isConnected;
  }

  /**
   * https://developers.google.com/cast/docs/reference/chrome/chrome.cast.media.LoadRequest
   * 
   * Test URL: http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
   *
   * @param {String} videoId
   * @param {Number} currentMediaTime in seconds
   *
   */
  castVideo = async (videoId, currentMediaTime = 0) => {
    const url = await this.getStream(videoId);

    const mediaInfo = new chrome.cast.media.MediaInfo(url, "video/mp4");
    const request = new chrome.cast.media.LoadRequest(mediaInfo);

    request.currentTime = currentMediaTime

    const castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    castSession &&
      castSession.loadMedia(request).then(
        () => {console.info("Cast video loaded");this.initInternalPlayer()},
        (errorCode) => console.error("Load error: " + CastPlayer.getErrorMessage(errorCode))
      );
  };

  async getStream(videoId) {
    const reponse = await axios({
      method: "GET",
      url: `http://localhost:3001/videos/${videoId}`,
    });

    return reponse.data.url;
  }

  static getErrorMessage(error) {
    switch (error.code) {
      case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
        return (
          "The API is not initialized." +
          (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.CANCEL:
        return (
          "The operation was canceled by the user" +
          (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.CHANNEL_ERROR:
        return (
          "A channel to the receiver is not available." +
          (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.EXTENSION_MISSING:
        return (
          "The Cast extension is not available." +
          (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.INVALID_PARAMETER:
        return (
          "The parameters to the operation were not valid." +
          (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
        return (
          "No receiver was compatible with the session request." +
          (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.SESSION_ERROR:
        return (
          "A session could not be created, or a session was invalid." +
          (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.TIMEOUT:
        return (
          "The operation timed out." +
          (error.description ? " :" + error.description : "")
        );
      default:
        return error;
    }
  }
}

class LocalPlayer {
  play() {}
  pause() {}
  getCurrentTime() {}
  getVolume() {}
}
