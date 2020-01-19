import './browse.css';

import { Col, Row } from 'antd';
import React, { useEffect, useState } from "react";

import { Card } from 'antd';
import GoogleAuth from '../helpers/googleAuth';
import { Layout } from 'antd';
import loadLikedVideos from '../helpers/youtubeHelpers'
import logo from './logo.svg';
import pizzaz from './pizzaz.gif';

;

const { Header, Content } = Layout;

export default function Browse(props) {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchVideos, setFetchVideos] = useState(0);

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

  async function handleSignOut() {
    await GoogleAuth.signOut();
    props.history.push("/");
  }

  function renderVideos() {
    return (
      <Layout>
        <Header>
          <div onClick={handleSignOut}><img src={logo} className="header-logo" alt="logo" /></div>
        </Header>
        <Content>
        <Row>
          {videos.map((video, i) => {return (
            <Col lg={4} md={8} sm={12} xs={24} key={video.id}>
              <Card
                className={'pointer video'}
                onClick={()=> window.open(video.url, "_blank")}
                bodyStyle={{ display: 'none' }}
                cover={
                    <img
                      alt={video.title}
                      src={video.thumbnail ? video.thumbnail.url : ''}
                    />
                }
              />
            </Col>
          )})}
        </Row>
        </Content>
      </Layout>
    );
  }
  
  return (
    <>
      {isLoading ? renderPazzaz() : renderVideos()}
    </>
  );
}