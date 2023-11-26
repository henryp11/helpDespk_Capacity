import React from 'react';
import moment from 'moment';
import styles from '../styles/emp.module.css';

const TicketsDetails = (props) => {
  const { open, details } = props;

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Empresa / Solicitante</h3>
            <p>
              {details.personal_emp.empresa.nombre_emp} |{' '}
              {details.personal_emp.nombre}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Inicio Soporte</h3>
            <p>
              {moment(details.fecha_ini_sop).format('DD/MM/YYYY - kk:mm:ss')}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Fin Soporte</h3>
            <p>
              {moment(details.fecha_fin_sop).format('DD/MM/YYYY - kk:mm:ss')}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Tiempo Calculado</h3>
            <p>{details.tiempo_cal_sop}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Tiempo Diferencial</h3>
            <p>{details.tiempo_diferencial}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Tiempo Final Soporte</h3>
            <p>{details.tiempo_real_soporte}</p>
          </span>
        </div>
      )}
    </>
  );
};

export default TicketsDetails;
