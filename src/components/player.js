import './player.scss'

import { Icon, Slider } from 'antd';
import MediaPlayer, { CastPlayer, MediaPlayerState } from '../helpers/MediaPlayer';
import React, { useState } from "react";
import { formatTime, getTime } from '../helpers/mediaPlayerHelpers'

import { FaChromecast } from 'react-icons/fa'

export default function Player({selectedItems, isCastAvailable}) {    
    const [state, setState] = useState(selectedItems ? MediaPlayerState.UNSTARTED : null);
    const [mediaPlayer, setMediaPlayer] = useState(null);
    const [volume, setVolume] = useState(0);
    const [currentTimeProgess, setCurrentTimeProgess] = useState(0);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    async function handleCast() {
        await CastPlayer.requestCastSession()
    }

    function handleTogglePlay() {
        if (state === MediaPlayerState.PLAYING) {
            mediaPlayer.pause()
        } else if (state === MediaPlayerState.PAUSED || state === MediaPlayerState.ENDED) {
            mediaPlayer.play()
        }
    }

    function handlePreviousVideo() {
        const updatedIndex = currentMediaIndex - 1
        selectedItems && selectedItems[updatedIndex] && setCurrentMediaIndex(updatedIndex)
    }

    function handleNextVideo() {
        const updatedIndex = currentMediaIndex + 1
        selectedItems && selectedItems[updatedIndex] && setCurrentMediaIndex(updatedIndex)
    }

    function handleVolumeSlide(value) {
        setVolume(value)
        mediaPlayer.setVolume(value)
    }

    function handleProgressSlide(value) {
        if(!selectedItems) {
            return
        }

        const time = getTime(selectedItems[currentMediaIndex].duration, value)
        setCurrentTimeProgess(value)
        mediaPlayer.seekTo(time)
    }

    function formatCurrentTime(value) {
        if(!value) return null
        return formatTime(selectedItems[currentMediaIndex].duration, value)
    }

    function openVideoInYoutube() {
        if (state === MediaPlayerState.PLAYING) {
            mediaPlayer.pauseVideo()
        }
        selectedItems && window.open(selectedItems[currentMediaIndex].url, "_blank")
    }

    function _onReady(event) {
        setMediaPlayer(event.target)
    }

    function handleStateChange({data}) {
        setState(data)
    }

    function handleProgressChange({data}) {
        setCurrentTimeProgess(data)
    }

    function handleVolumeChange({data}) {
        setVolume(data)
    }

    function renderPlayer() {
        return (
            <>
                <MediaPlayer 
                    onReady={_onReady} 
                    onStateChange={handleStateChange}
                    onProgressChange={handleProgressChange} 
                    onVolumeChange={handleVolumeChange} 
                    target={selectedItems ? selectedItems[currentMediaIndex] : null} />
                    
                {selectedItems && <div className="now-playing-wrapper">
                    <div className="now-playing-content">
                    <div className="title">{selectedItems[currentMediaIndex].title}</div>
                    <div className="details pointer" onClick={openVideoInYoutube}>
                        <Icon 
                            className="youtube-button" 
                            type="youtube" 
                            theme="filled" />
                        &nbsp;
                        {selectedItems[currentMediaIndex].channelTitle}
                    </div>
                    </div>
                </div>}
            </>
        )
    }
      
    return (
        <div className={`player ${selectedItems ? 'active' : ''} ${state}`}>
            <Slider 
                defaultValue={0} 
                value={currentTimeProgess} 
                className="progress-slider" 
                step={0.001} 
                onChange={handleProgressSlide} 
                tipFormatter={formatCurrentTime} />
            <div className="left">
                { renderPlayer() }
            </div>
            <div className="center">
                <Icon className="button" type="step-backward" onClick={handlePreviousVideo}/>
                <Icon 
                    className="play-button"
                    onClick={handleTogglePlay} 
                    type={state === 'playing' ? "pause-circle" : "play-circle"} 
                    theme="filled" />
                <Icon className="button" type="step-forward" onClick={handleNextVideo} />
            </div>
            <div className="right">
                <div className="volume">
                    <Slider 
                        value={volume} 
                        className="volume-slider" 
                        onChange={handleVolumeSlide} />
                    <Icon className="button" type="sound" theme="filled" />
                </div>
                { isCastAvailable && <i className="cast button"><FaChromecast onClick={handleCast} /></i> }
            </div>
        </div>
    )
}