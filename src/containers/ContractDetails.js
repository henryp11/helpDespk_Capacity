import React from 'react';
import styles from '../styles/emp.module.css';

const ContractDetails = (props) => {
  const { open, details } = props;

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Cliente / Empresa</h3>
            <p>{details.empresa.nombre_emp}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Plan Adquirido</h3>
            <p>
              {details.id_plan} - {details.planes_mant.nombre_plan}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Inicio Contrato</h3>
            <p>{details.fecha_inicio}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Finalización Contrato</h3>
            <p>{details.fecha_fin}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>
              Fecha Finalización Personalizada
            </h3>
            <p>{details.fecha_extendida}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Observaciones</h3>
            <p>{details.observac}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Factura Asignada</h3>
            <p>{details.factura}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Plan vigente?</h3>
            <p>{details.flag_vigente}</p>
          </span>
        </div>
      )}
    </>
  );
};

export default ContractDetails;
