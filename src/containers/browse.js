import './browse.css';

import { Layout } from 'antd';
import { Link } from "react-router-dom";
import React from "react";
import logo from './logo.svg';

const { Header, Footer, Sider, Content } = Layout;

export default function Browse(props) {
    return (
      <Layout>
        <Header>
        <Link to="/"><img src={logo} className="header-logo" alt="logo" /></Link>
        </Header>
        <Content>Browse</Content>
      </Layout>
      );
}