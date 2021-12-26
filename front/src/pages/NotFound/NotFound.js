import './NotFound.scss'
import React from 'react'
import { PageHeader } from '../../layouts/Private/components'

export default ({ currentUser }) => (
  <div className="not-found">
    <PageHeader title="Página no encontrada" description="La página que intenta acceder no existe." icon="question" />
  </div>
)
