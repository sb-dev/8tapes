import './browse.css';

import { Col, Row } from 'antd';
import React, { useEffect, useState } from "react";

import { Card } from 'antd';
import Layout from '../components/layout';
import LazyLoad from 'react-lazyload';
import Player from '../components/player';
import { isMobile } from 'react-device-detect';
import loadLikedVideos from '../helpers/youtubeHelpers'
import pizzaz from './pizzaz.gif';

export default function Browse(props) {
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchVideos, setFetchVideos] = useState(0);

  function handleVideoClick(video) {
    isMobile ? window.open(video.url, "_blank") : setSelected(video)
  }

  useEffect(() => {
    async function onLoad() {
      try {
        const videos = await loadLikedVideos();
        setVideos(videos);
      } catch (e) {
        console.error(e);
      }
      
      setIsLoading(false);
    }

    setTimeout(() => { onLoad() }, 3000);
  }, [fetchVideos]);

  function renderPazzaz() {
    return (<img src={pizzaz} className="pizzaz"/>);
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
        {isMobile ? '' : <Player selectedItem={selected}/>}
      </>
    );
  }
  
  return (
    <>
      {isLoading ? renderPazzaz() : renderVideos()}
    </>
  );
}