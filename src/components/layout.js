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

  async function handleSwitchAccount() {
    await GoogleAuth.signIn('select_account');
    window.location.reload();
  }


  const menu = (
    <Menu>
      <Menu.Item onClick={handleSwitchAccount}>Switch Account</Menu.Item>
      <Menu.Item onClick={handleSignOut}>Sign out</Menu.Item>
    </Menu>
  );
      
  return (
    <AntdLayout>
        <Header>
        <div className="inner-header">
          <div className="header-logo">
            <img src={logo} alt="8tapes" />
          </div>
          <div className="secondary-navigation">
            <Dropdown overlay={menu}>
              <div className="nav-item"><FaUserCircle /></div>
            </Dropdown>
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