import React from 'react';
import moment from 'moment';
import styles from '../styles/emp.module.css';

const SolicitudDetails = (props) => {
  const { open, details } = props;

  console.log(details);

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
        </div>
      )}
    </>
  );
};

export default SolicitudDetails;
