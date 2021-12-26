import './Sidebar.scss'
import React from 'react'
import { Col, Icon } from 'antd'
import iconMessages from './icon-message.png'
import iconNetwork from './icon-network.png'
import iconAlert from './icon-alert.png'
import iconSettings from './icon-settings.png'
import { useTranslation } from 'react-i18next';

const Sidebar = ({ currentUser, activeTab, onTabChange, statuses, service }) => {
	const { t } = useTranslation()

	return (
		<Col className="sidebar" span={5}>
			<div className="sidebar-inner">
				<div className="menu-block">
					<h3>Gestión de cargas de trabajo</h3>
					<ul>
						{ (service ==='servicio1' && (currentUser.type === 'SUPERVISOR' || currentUser.type === 'MOP' || currentUser.type === 'AUDIT' || currentUser.type === 'ADMIN')) &&
							<li className={activeTab === 'tab-documents-CUSTODIA' ? 'active' : ''} onClick={() => onTabChange('tab-documents-CUSTODIA')}>
								<div className="menu-item-inner">
									Custodia
											<Icon type="check" />
								</div>
							</li>
						}
						{ (currentUser.type === 'SUPERVISOR') &&
							<li className={activeTab === 'tab-documents-RECIBIDO' ? 'active' : ''} onClick={() => onTabChange('tab-documents-RECIBIDO')}>
								<div className="menu-item-inner">
									Recibidos
											<Icon type="check" />
								</div>
							</li>
						}
						{ (currentUser.type === 'SUPERVISOR' || currentUser.type === 'ANALISTA' || currentUser.type === 'SOPORTE' || currentUser.type === 'AUDIT' || currentUser.type === 'ADMIN') &&
							<li className={activeTab === 'tab-documents-ASIGNADO' ? 'active' : ''} onClick={() => onTabChange('tab-documents-ASIGNADO')}>
								<div className="menu-item-inner">
									Asignados
	                    <Icon type="check" />
								</div>
							</li>
						}
					</ul>
				</div>
				{ (currentUser.type === 'SUPERVISOR' || currentUser.type === 'ANALISTA' || currentUser.type === 'SOPORTE' || currentUser.type === 'AUDIT' || currentUser.type === 'ADMIN') &&
					<>
						{statuses.length > 0 &&
							<div className="menu-block">
								<h3>{/*<img src={ iconMessages } alt="" />*/}Gestión por documento</h3>
								<ul>
									{statuses.map((status) =>
										<li key={status} className={activeTab === 'tab-documents-' + status ? 'active' : ''} onClick={() => onTabChange('tab-documents-' + status)}>
											<div className="menu-item-inner">
												{t('messages.docs.stage.' + status)}
												<Icon type="check" />
											</div>
										</li>
									)}
								</ul>
							</div>
						}
						<div className="menu-block">
							<h3>{/*<img src={ iconMessages } alt="" />*/}Administración por registro</h3>
							<ul>
									<li className={activeTab === 'tab-register' ? 'active' : ''} onClick={() => onTabChange('tab-register')}>
										<div className="menu-item-inner">
											{t('messages.docs.category.PROVEEDORES')}
											<Icon type="check" />
										</div>
									</li>
							</ul>
						</div>
						{ (currentUser.type === 'SUPERVISOR' || currentUser.type === 'ANALISTA' || currentUser.type === 'AUDIT' || currentUser.type === 'ADMIN') &&
							<div className="menu-block">
								<h3>Informes</h3>
								<ul>
										<li className={activeTab === 'tab-reports' ? 'active' : ''} onClick={() => onTabChange('tab-reports')}>
											<div className="menu-item-inner">
												{t('messages.docs.REPORTS')}
												<Icon type="check" />
											</div>
										</li>
								</ul>
							</div>
						}
					</>
				}

			</div>
		</Col>
	)
}

export default Sidebar
