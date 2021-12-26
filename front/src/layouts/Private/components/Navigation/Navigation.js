import './Navigation.scss'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Icon, Menu, Dropdown, Button } from 'antd'

export default ({ currentUser }) => {
  const { t } = useTranslation()

  const dropdownMenuEstados = (
    <Menu>
      <Menu.Item>
        <Link to={ '/manage/RECIBIDO' }>
          Recibido
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link to={ '/manage/PENDIENTE' }>
          Pendiente
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link to={ '/manage/EVALUACION' }>
          En Evaluación
        </Link>
      </Menu.Item>
      <Menu.Item>
        <Link to={ '/manage/CERRADO' }>
          Cerrado
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
      <Menu.Item id="home">
          Inicio
          <Link to={ '/' } />
      </Menu.Item>
      { currentUser.modules && currentUser.modules.includes('DESIGN') &&
        <Menu.Item id="design">
          Diseño
          <Link to={ '/design' } />
        </Menu.Item>
      }
      { currentUser.modules && currentUser.modules.includes('FORMS') &&
        <Menu.Item id="manage">
          <Dropdown overlay={ dropdownMenuEstados }>
              <Button type="link" ghost>
                <Link to={ '/manage' }>
                <span>Gestión</span>&nbsp;&nbsp;<Icon type="caret-down"/></Link>
              </Button>
          </Dropdown>
        </Menu.Item>
      }
      { currentUser.modules && currentUser.modules.includes('DEST') &&
        <Menu.Item id="recipients">
          Destinatarios
          <Link to={ '/recipients' } />
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
