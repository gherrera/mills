import './Navigation.scss'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Icon, Menu, Dropdown, Button } from 'antd'

export default ({ currentUser, currentPage }) => {
  const { t } = useTranslation()

  return (
    <Menu
      className="navigation"
      theme="light"
      mode="horizontal"
      >
      { currentPage.startsWith('maintenance') &&
        <Menu.Item id="setup">
            Setup
            <Link to={ '/maintenance/setup' } />
        </Menu.Item>
      }
      { currentUser.modules && currentUser.modules.includes('REPORT') &&
        <Menu.Item id="report">
          Informes
        </Menu.Item>
      }
    </Menu>
  )
}
