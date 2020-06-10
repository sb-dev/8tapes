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

  const menu = (
    <Menu className="vertical-menu">
      <Menu.Item key="0">
        <span>Sports</span>
      </Menu.Item>
      <Menu.Item key="1">
        <span>Society</span>
      </Menu.Item>
      <Menu.Item key="2">
        <span>Gaming</span>
      </Menu.Item>
    </Menu>
  );
      
  return (
    <AntdLayout>
        <Header>
        <div className="inner-header">
          <div className="header-logo">
            <img src={logo} alt="8tapes" />
          </div>
          <ul className="menu primary-navigation">
            <li><span>Music</span></li>
            <li><span>Entertainment</span></li>
            <li><span>Lifestyle</span></li>
            <li>
              <Dropdown overlay={menu}>
                <span className="ant-dropdown-link" onClick={e => e.preventDefault()}>More...</span>
              </Dropdown>
            </li>
          </ul>
          <div className="secondary-navigation">
            <div className="nav-item"></div>
            <div className="nav-item"><span>Your Collections</span></div>
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