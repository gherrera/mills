import './Wrapper.scss'
import React from 'react'
import { Row } from 'antd'

const Wrapper = ({ children }) => {
	return (
		<Row className="wrapper">
			{ children }
		</Row>
	)
}

export default Wrapper
