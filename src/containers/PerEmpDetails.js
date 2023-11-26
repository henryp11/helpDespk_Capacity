import React from 'react';
import styles from '../styles/emp.module.css';

const PerEmpDetails = (props) => {
  const { open, details } = props;

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Pertenece a:</h3>
            <p>{details.empresa.nombre_emp}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Doc. Identificación</h3>
            <p>{details.id_per}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Nombre</h3>
            <p>{details.nombre}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Teléfono</h3>
            <p>{details.telf1}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Telf. Secundario</h3>
            <p>{details.telf2}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Correo</h3>
            <p>{details.correo}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Cargo</h3>
            <p>{details.cargo}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Departamento</h3>
            <p>{details.depto}</p>
          </span>
        </div>
      )}
    </>
  );
};

export default PerEmpDetails;
