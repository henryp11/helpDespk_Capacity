import React from 'react';
import styles from '../styles/emp.module.css';

const AgentesDetails = (props) => {
  const { open, details } = props;

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Nombre Agente</h3>
            <p>{details.nombre}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Cédula</h3>
            <p>{details.cedula}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Nacimiento</h3>
            <p>{details.fecha_nacimiento}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Ingreso</h3>
            <p>{details.fecha_ingreso}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Salida</h3>
            <p>{details.fecha_salida}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Cargo</h3>
            <p>{details.cargo}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Nivel Atención</h3>
            <p>{details.nivel_atencion}</p>
          </span>
        </div>
      )}
    </>
  );
};

export default AgentesDetails;
