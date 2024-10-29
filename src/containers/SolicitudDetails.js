import React from 'react';
import moment from 'moment';
import styles from '../styles/emp.module.css';

const SolicitudDetails = (props) => {
  const { open, details } = props;

  const capturasArray = Object.values(details.capturas);
  const filesWithUrl = capturasArray.filter((file) => {
    return file.url !== '';
  });

  console.log(details);
  console.log(capturasArray);
  console.log(filesWithUrl);

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Inicio Solución</h3>
            <p>
              {details.fecha_ini_solucion !== null &&
                moment(details.fecha_ini_solucion).format(
                  'DD/MM/YYYY - kk:mm:ss'
                )}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Detalle Solicitud</h3>
            <p>{details.descripcion}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3
              className={styles.wrapTittles}
            >{`Archivos Adjuntos: ${filesWithUrl.length}`}</h3>
            {filesWithUrl.map((file, index) => {
              return (
                <p style={{ margin: '4px' }} key={file.name}>
                  <b>
                    <i>Archivo {index + 1}: </i>
                  </b>
                  <a
                    href={file.url}
                    target="_blank"
                    style={{
                      textDecoration: 'underline',
                      color: 'blue',
                      margin: '4px',
                    }}
                  >
                    {file.name}
                  </a>
                </p>
              );
            })}
          </span>
        </div>
      )}
    </>
  );
};

export default SolicitudDetails;
