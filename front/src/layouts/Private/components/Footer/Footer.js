import './Footer.scss'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import i18nextConfig from '../../../../config/i18next'
import moment from 'moment'
import { LocalStorageService } from '../../../../services'
import { Col, Icon, Row } from 'antd'
import iconLangEs from './lang-es.png'
import iconLangEn from './lang-en.png'
import logoAml from './logo-aml.png'
import logoTemp from './logo-temp.png'

export default ({ currentUser }) => {
  const { t } = useTranslation()

  const lang = LocalStorageService.read('i18nextLng')

  const [language, setLanguage] = useState(lang)
  const [theme, setTheme] = useState('theme-metal')

  useEffect(() => {
    let theme = LocalStorageService.read('theme')

    if ('i18nextLng' in localStorage) {
      const l = lang.substring(0, 2)
      handleLanguageChange(l)
    }

    if (theme === null) {
      theme = 'theme-metal'
      LocalStorageService.create('theme', theme)
    }
    setTheme(theme)
    document.body.className = theme
  }, [])

  const handleThemeChange = (e, themeClassName) => {
    e.preventDefault()

    setTheme(themeClassName)

    document.body.className = themeClassName

    LocalStorageService.update('theme', themeClassName)
  }

  const handleLanguageChange = async (lng) => {
    let language = lng
    await setLanguage(language)
    await i18nextConfig.changeLanguage(language)
    await LocalStorageService.update('i18nextLng', language)
    moment.locale(lng)
  }

  return (
    <div id="footer">
      <Row className="footer-inner">
        <Col>
          Copyright &copy; - Mills - Todos los derechos reservados - Powered by HTG Soluciones
        </Col>
      </Row>
    </div>
  )
}
