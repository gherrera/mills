import './ModalPdfViewer.scss';
import React, { useEffect, useState } from 'react';
import apiConfig from '../../../../config/api';
import { getB64FormPromise } from '../../promises'
import { Spin } from 'antd';

const ModalPdfViewer = ({pdfId}) => {
    const [base64, setBase64] = useState(null)

    useEffect(() => {
        getB64FormPromise(pdfId).then((response) => {
            setBase64(response);
        })
    }, [])

        return (
        <div>
            {base64 === null ? <Spin spinning={true} tip="Cargando..." size="big"/> 
            :
                <iframe src={"data:application/pdf;base64,"+ base64} height="560px" width="100%"></iframe>
            }
            
        </div>
        );
}

export default ModalPdfViewer
