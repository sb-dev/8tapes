import './layout.scss';

import { Layout as AntdLayout, Dropdown, Menu } from 'antd';
import { FaUserCircle } from 'react-icons/fa';
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
        <div className="inner-header">
          <div className="header-logo">
            <img src={logo} alt="8tapes" />
          </div>
          <div className="secondary-navigation">
            <div className="nav-item"><FaUserCircle /></div>
          </div>
        </div>
        </Header>
        <Content className={props.contentClassName}>
            {props.children}
        </Content>
    </AntdLayout>
  );
}

export default withRouter(Layout);