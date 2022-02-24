import './Navigation.scss'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Icon, Menu, Dropdown, Button } from 'antd'

export default ({ currentUser, currentPage }) => {
  const { t } = useTranslation()

  const dropdownMenu = (
    <Menu>
      <Menu.Item key="1">
        <Link to={ '/maintenance/PENDING' }>
          Pendientes
        </Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link to={ '/maintenance/STARTED' }>
          En curso
        </Link>
      </Menu.Item>
      <Menu.Item key="3">
        <Link to={ '/maintenance/FINISHED' }>
          Realizados
        </Link>
      </Menu.Item>
    </Menu>
  )
  
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
      { currentPage.startsWith('maintenance') &&
        <Menu.Item id="projects">
          <Dropdown overlay={ dropdownMenu } overlayClassName="overlay-menu-projects" className="menu-projects">
            <Button ghost>
              Proyectos <Icon type="caret-down"/>
            </Button>
          </Dropdown>
        </Menu.Item>
      }
    </Menu>
  )
}
