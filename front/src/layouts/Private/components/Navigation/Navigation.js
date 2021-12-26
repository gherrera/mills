import './Navigation.scss'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Icon, Menu, Dropdown, Button } from 'antd'

export default ({ currentUser }) => {
  const { t } = useTranslation()

  return (
    <Menu
      className="navigation"
      theme="light"
      mode="horizontal"
      >
      <Menu.Item id="home">
          Inicio
          <Link to={ '/' } />
      </Menu.Item>
      { currentUser.modules && currentUser.modules.includes('REPORT') &&
        <Menu.Item id="report">
          Informes
        </Menu.Item>
      }
    </Menu>
  )
}
