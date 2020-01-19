import './browse.css';

import React, { useEffect, useState } from "react";

import { Layout } from 'antd';
import { Link } from "react-router-dom";
import logo from './logo.svg';
import pizzaz from './pizzaz.gif'

const { Header, Content } = Layout;

export default function Browse() {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function onLoad() {
      setIsLoading(false);
    }

    setTimeout(() => { onLoad() }, 3000);
  });

  function renderPazzaz() {
    return (<img src={pizzaz} />);
  }

  function renderVideos() {
    return (
      <Layout>
        <Header>
          <Link to="/"><img src={logo} className="header-logo" alt="logo" /></Link>
        </Header>
        <Content>Browse</Content>
      </Layout>
    );
  }
  
  return (
    <>
      {isLoading ? renderPazzaz() : renderVideos()}
    </>
  );
}