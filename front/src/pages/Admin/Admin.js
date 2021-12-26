import './Admin.scss'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { Tabs } from 'antd'
import { Page, PageBottomBar, PageContent, PageFooter, PageHeader, PageTopBar } from '../../layouts/Private/components'
import { AdminAuditPage, AdminUsersPage } from '../'

const { TabPane } = Tabs

class Admin extends Component {
  state = {
    breadcrumbs: this.getBreadcrumbs()
  }

  getBreadcrumbs() {
    const { t } = this.props

    const breadcrumbs = [
      { title: t('messages.aml.administration'), icon: 'file-search', link: '/admin' },
    ]

    return breadcrumbs
  }

  render() {
    const { breadcrumbs } = this.state
    const { currentUser, t } = this.props

    return (
      <div className="admin">
        <PageHeader
            breadcrumbs={breadcrumbs}
            />
        <Page>
          <PageHeader
            title={ t('messages.aml.administrationPageTitle') }
            description={ t('messages.aml.administrationPageDescription')}
            icon="file-search"
            />
          <PageContent>
            <Tabs type="card">
              <TabPane tab={ t('messages.aml.users') } key="1">
                <AdminUsersPage currentUser={ currentUser } />
              </TabPane>
              {/*
              <TabPane tab={ t('messages.aml.auditTitle') } key="2">
                <AdminAuditPage currentUser={ currentUser } />
              </TabPane>
              */}
            </Tabs>
          </PageContent>
          <PageFooter>

          </PageFooter>
        </Page>
        <PageBottomBar breadcrumbs={ breadcrumbs } />
      </div>
    )
  }
}

export default withTranslation()(Admin)
