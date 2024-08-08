import React from 'react';
import moment from 'moment';
import { timeFormat } from '@/utils/helpers';
import styles from '../styles/emp.module.css';

const TicketsDetails = (props) => {
  const { open, details } = props;

  console.log(details);

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Categoría</h3>
            <p>
              {details.categorias_sop !== null &&
                details.categorias_sop.descrip}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Solicitante</h3>
            <p>{details.personal_emp.nombre}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Inicio Soporte</h3>
            <p>
              {details.fecha_ini_sop !== null &&
                moment(details.fecha_ini_sop).format('DD/MM/YYYY - kk:mm:ss')}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Fin Soporte</h3>
            <p>
              {details.fecha_fin_sop !== null &&
                moment(details.fecha_fin_sop).format('DD/MM/YYYY - kk:mm:ss')}
            </p>
          </span>
          {/* <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Tiempo Calculado</h3>
            <p>{timeFormat(Number(details.tiempo_calc_sop) * 1000)}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Tiempo Diferencial</h3>
            <p>{timeFormat(Number(details.tiempo_diferencial) * 1000)}</p>
          </span> */}
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Tiempo Final Soporte</h3>
            <p>{timeFormat(Number(details.tiempo_real_sop) * 1000)}</p>
          </span>
        </div>
      )}
    </>
  );
};

export default TicketsDetails;
