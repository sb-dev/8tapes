import './player.scss'

import React, { useEffect, useState } from "react";

import { Icon } from 'antd';
import YouTube from 'react-youtube';

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

    function togglePlay() {
        if (state === 'playing') {
            player.pauseVideo()
        } else if (state === 'paused' || state === 'ended') {
            player.playVideo()
        }
    }

    function openVideoInYoutube() {
        if (state === 'playing') {
            player.pauseVideo()
        }
        window.open(props.selectedItem.url, "_blank")
    }
    
    function _onReady(event) {
        console.log(event.target)
        setPlayer(event.target)
    }

    function _onStateChange({data}) {
        switch(data) {
            case 0:
                setState('ended')
                break
            case 1:
                setState('playing')
                break
            case 2:
                setState('paused')
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
        };
        
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
            <div className="left">
                {props.selectedItem ? renderSelectedVideo() : ''}
            </div>
            <div className="center">
                <Icon className="button" type="step-backward" />
                <Icon 
                    className="play-button"
                    onClick={togglePlay} 
                    type={state === 'playing' ? "pause-circle" : "play-circle"} 
                    theme="filled" />
                <Icon className="button" type="step-forward" />
            </div>
            <div className="right">
                <Icon className="button" type="sound" theme="filled" />
            </div>
        </div>
    )
}