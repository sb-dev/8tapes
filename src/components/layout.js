import './layout.scss';

import { Layout as AntdLayout } from 'antd';
import GoogleAuth from '../helpers/googleAuth';
import React from "react";
import logo from '../assets/tape.svg';
import { withRouter } from "react-router-dom";

const { Header, Content } = AntdLayout;

function Layout(props) {
  async function handleSignOut() {
    await GoogleAuth.signOut();
    props.history.push("/");
  }
      
  return (
    <AntdLayout>
        <Header>
            <div onClick={handleSignOut}><img src={logo} className="header-logo" alt="logo" /></div>
        </Header>
        <Content className={props.contentClassName}>
            {props.children}
        </Content>
    </AntdLayout>
  );
}

export default withRouter(Layout);