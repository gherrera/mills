import './Content.scss'
import React from 'react'
import { Col } from 'antd'

const Content = ({ children }) => {
	return (
		<Col className="content" span={ 19 }>
			<div className="content-inner">
				{ children }
			</div>
		</Col>
	)
}

export default Content
