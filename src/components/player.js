import './player.scss'

import { Icon, Slider } from 'antd';
import React, { useEffect, useState } from "react";
import { formatTime, getProgress, getTime } from '../helpers/mediaPlayerHelpers'

import YouTube from 'react-youtube';
import moment from 'moment'
import momentDurationFormatSetup from 'moment-duration-format'

momentDurationFormatSetup(moment);

/**
 * Youtube player
 * 
 * https://developers.google.com/youtube/iframe_api_reference#top_of_page
 * 
 * @param {*} props 
 */
export default function Player(props) {
    const [player, setPlayer] = useState(null);
    const [state, setState] = useState(null);
    const [volume, setVolume] = useState(0);
    const [currentTimeProgess, setCurrentTimeProgess] = useState(0);
    const [currentTimeInterval, setCurrentTimeInterval] = useState(0);

    useEffect(() => {
        return () => { stopTrackingTime() }
    }, [] );

    function handleTogglePlay() {
        if (state === 'playing') {
            player.pauseVideo()
        } else if (state === 'paused' || state === 'ended') {
            player.playVideo()
        }
    }

    function handlePreviousVideo() {
        player.previousVideo()
    }

    function handleNextVideo() {
        player.nextVideo()
    }

    function handleVolumeChange(value) {
        setVolume(value)
        player.setVolume(value)
    }

    function handleProgressChange(value) {
        const time = getTime(props.selectedItem.duration, value)
        setCurrentTimeProgess(value)
        player.seekTo(time)
    }

    function formatCurrentTime(value) {
        if(!value) return null
        return formatTime(props.selectedItem.duration, value)
    }

    function trackCurrentTime() {
        const interval = setInterval(() => {
            const progress = getProgress(props.selectedItem.duration, player.getCurrentTime())
            setCurrentTimeProgess(progress)
        }, 500)

        setCurrentTimeInterval(interval)
    }

    function stopTrackingTime() {
        clearInterval(currentTimeInterval);
    }

    function openVideoInYoutube() {
        if (state === 'playing') {
            player.pauseVideo()
        }
        window.open(props.selectedItem.url, "_blank")
    }
    
    function _onReady(event) {
        console.log("_onReady")
        setPlayer(event.target)
        event.target.loadPlaylist([props.selectedItem.id, 'VHUS9j0wna8'])
    }

    function _onStateChange({data}) {
        switch(data) {
            case 0:
                setState('ended')
                stopTrackingTime()
                break
            case 1:
                setState('playing')
                stopTrackingTime()
                setVolume(player.getVolume())
                trackCurrentTime()
                break
            case 2:
                setState('paused')
                stopTrackingTime()
                break
            case 3:
                setState('buffering')
                break
            case 5:
                setState('video-cued')
                break
            default:
                setState('unstarted')
          }
    }
    
    function renderSelectedVideo() {
        const opts = {
            width: '90px',
            height: '60px',
            playerVars: {
                autoplay: 1,
                controls: 0
            }
        }
        
        return (
            <>
                <YouTube
                    className="image-wrapper"
                    videoId={props.selectedItem.id}
                    opts={opts}
                    onReady={_onReady} 
                    onStateChange={_onStateChange} />
                <div className="now-playing-wrapper">
                    <div className="now-playing-content">
                    <div className="title">{props.selectedItem.title}</div>
                    <div className="details pointer" onClick={openVideoInYoutube}>
                        <Icon 
                            className="youtube-button" 
                            type="youtube" 
                            theme="filled" />
                        &nbsp;
                        {props.selectedItem.channelTitle}
                    </div>
                    </div>
                </div>
            </>
        )
    }
      
    return (
        <div className={`player ${props.selectedItem ? 'active' : ''}`}>
            <Slider 
                defaultValue={0} 
                value={currentTimeProgess} 
                className="progress-slider" 
                step={0.001} 
                onChange={handleProgressChange} 
                tipFormatter={formatCurrentTime} />
            <div className="left">
                {props.selectedItem ? renderSelectedVideo() : ''}
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
                    <Slider value={volume} className="volume-slider" onChange={handleVolumeChange} />
                    <Icon className="button" type="sound" theme="filled" />
                </div>
            </div>
        </div>
    )
}