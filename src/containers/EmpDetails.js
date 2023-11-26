import React from 'react';
import styles from '../styles/emp.module.css';

const EmpDetails = (props) => {
  const { open, details } = props;

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Nombre / Razón Social</h3>
            <p>{details.nombre_emp}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>RUC</h3>
            <p>{details.ruc}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Dirección</h3>
            <p>{details.direccion}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Teléfono</h3>
            <p>{details.telefono}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Correo</h3>
            <p>{details.correo}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Correo Alterno</h3>
            <p>{details.correo_secund}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Ciudad</h3>
            <p>{details.ciudad}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Tiene Plan de Soporte?</h3>
            <p>{details.planMant ? 'SI' : 'NO'}</p>
          </span>
        </div>
      )}
    </>
  );
};

export default EmpDetails;
