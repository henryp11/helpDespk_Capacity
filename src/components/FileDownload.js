'use client';
import React, { useState } from 'react';
import { RiFileWord2Line } from 'react-icons/ri';
import { RiFileExcel2Line } from 'react-icons/ri';
import { FaRegFilePdf } from 'react-icons/fa6';
import { TbFileTypeTxt } from 'react-icons/tb';
import { TbFileTypeXml } from 'react-icons/tb';
import { FaDownload } from 'react-icons/fa';
import styles from '@/styles/forms.module.css';

//Función fuera del componente para ejecutar una unica vez al cargar el componente
const scrollUp = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const FileDownload = ({
  idFile, //Corresponde al key del array de capturas para modificar (file1, 2,3, 4)
  stateSolicitud, //Objeto con los datos de la solicitud así como los archivos con sus respectivas URL's de Firebase
  showModal,
  setShowModalFile,
}) => {
  //Aquí ejecuto antes de la carga del componente la función para que siempre empiece desde el principio, otra forma de usar useState.
  useState(scrollUp);
  return (
    <>
      {showModal.active && showModal.name === idFile && (
        <div className={styles.downloadFile}>
          <h3>
            {stateSolicitud.capturas[idFile].name &&
              `Nombre Archivo: ${stateSolicitud.capturas[idFile].name}`}
          </h3>
          <div className={styles.downloadFilePreview}>
            {stateSolicitud.capturas[idFile].url && (
              <span style={{ height: '100%' }}>
                {stateSolicitud.capturas[idFile].type.includes('image') && (
                  <img
                    src={stateSolicitud.capturas[idFile].url}
                    alt={stateSolicitud.capturas[idFile].name}
                    className={styles.previewImage}
                    style={{ height: 'inherit' }}
                  />
                )}

                {stateSolicitud.capturas[idFile].type.includes(
                  'officedocument.wordprocessingml.document'
                ) && (
                  <span className="reactIconsFiles">
                    <RiFileWord2Line />
                  </span>
                )}
                {stateSolicitud.capturas[idFile].type.includes(
                  'officedocument.spreadsheetml.sheet'
                ) && (
                  <span className="reactIconsFiles">
                    <RiFileExcel2Line />
                  </span>
                )}
                {stateSolicitud.capturas[idFile].type.includes(
                  'application/pdf'
                ) && (
                  <span className="reactIconsFiles">
                    <FaRegFilePdf />
                  </span>
                )}

                {stateSolicitud.capturas[idFile].type.includes(
                  'text/plain'
                ) && (
                  <span className="reactIconsFiles">
                    <TbFileTypeTxt />
                  </span>
                )}
                {stateSolicitud.capturas[idFile].type.includes('text/xml') && (
                  <span className="reactIconsFiles">
                    <TbFileTypeXml />
                  </span>
                )}
              </span>
            )}
          </div>
          <span>
            <a
              href={stateSolicitud.capturas[idFile].url}
              target="_blank"
              className={styles.downloadLink}
            >
              <FaDownload />
              Descargar
            </a>
            <button
              tittle="Cerrar"
              type="button"
              onClick={() => {
                setShowModalFile({ ...showModal, active: false });
              }}
              id={styles.downloadClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </button>
          </span>
        </div>
      )}
    </>
  );
};

export default FileDownload;
