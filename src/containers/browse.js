import './browse.css';

import { Col, Progress, Row } from 'antd';
import React, { useEffect, useState } from "react";

import { Card } from 'antd';
import { CastPlayer } from '../helpers/MediaPlayer'
import Layout from '../components/layout';
import LazyLoad from 'react-lazyload';
import Player from '../components/player';
import { isMobile } from 'react-device-detect';
import loadLikedVideos from '../helpers/youtubeHelpers'
import pizzaz from '../assets/pizzaz.gif';

export default function Browse(props) {
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [fetchVideos, setFetchVideos] = useState(0);
  const [isCastAvailable, setIsCastAvailable] = useState(false)

  function handleVideoClick(video) {
    isMobile ? window.open(video.url, "_blank") : updateSelected([video])
  }

  function updateSelected(selectedItems) {
    localStorage.setItem('8tapes-queue', JSON.stringify(selectedItems));
    setSelected(selectedItems)
  }

  function handleLoadProgress(progress) {
    setLoadingProgress(progress)
  }

  useEffect(() => {
    async function onLoad() {
      try {
        const videos = await loadLikedVideos(handleLoadProgress);
        setVideos(videos);
      } catch (e) {
        console.error(e);
      }
      
      setIsLoading(false);
      const lastQueue = localStorage.getItem('8tapes-queue')
      lastQueue && setSelected(JSON.parse(lastQueue))
    }
    
    setTimeout(() => { onLoad() }, 1000);
  }, [fetchVideos]);

  window['__onGCastApiAvailable'] = function(isAvailable) {
    // TODO: Enable Chromecast
    // setIsCastAvailable(isAvailable)
    isAvailable && CastPlayer.initialiseCastApi()
  }

  function renderPazzaz() {
    return (<>
      <Progress strokeColor="#6ACBAA" className="pizzaz-progress" percent={loadingProgress} status="active" showInfo={false} />
      <img src={pizzaz} className="pizzaz" alt="pizzaz" />
    </>);
  }

  function renderVideos() {
    return (
      <>
        <Layout>
            {videos.map((category, i) => { return (
              <div key={i}>
                <h1>{category.label}</h1>
                <Row>
                {category.videos.map((video, i) => {
                  return (<Col xl={3} lg={4} md={6} sm={8} xs={12} key={video.id}>
                    <LazyLoad offset={100} once>
                      <Card
                          className={'pointer video'}
                          onClick={()=> handleVideoClick(video) }
                          bodyStyle={{ display: 'none' }}
                          cover={
                              <img
                                alt={video.title}
                                src={video.thumbnail ? video.thumbnail.url : ''}
                              />
                          }
                        />
                    </LazyLoad>
                  </Col>)
                })}
                </Row>
              </div>
            )})}
        </Layout>
        {isMobile ? '' : <Player selectedItems={selected} isCastAvailable={isCastAvailable}/>}
      </>
    );
  }
  
  return (
    <>
      {isLoading ? renderPazzaz() : renderVideos()}
    </>
  );
}