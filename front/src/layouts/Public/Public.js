import './Public.scss'
import React from 'react'
import { Layout } from 'antd'

export default ({ children }) => {
  return (
    <Layout className="layout-public">
      { children }
    </Layout>
  )
}
