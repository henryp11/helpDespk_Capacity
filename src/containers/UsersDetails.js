import React from 'react';
import styles from '../styles/emp.module.css';

const UsersDetails = (props) => {
  const { open, details } = props;

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Nombre de Usuario</h3>
            <p>{details.username}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Correo de Registro</h3>
            <p>{details.mail}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Rol / Perfil</h3>
            <p>{details.rol}</p>
          </span>

          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Vinculado con:</h3>
            <p>
              {details.personalEmp
                ? `${details.personalEmp.id_per} - ${details.personalEmp.nombre}`
                : 'NO ASIGNADO'}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Pertenece al cliente:</h3>

            <p>
              {details.personalEmp
                ? `${details.personalEmp.empresa.nombre_emp}`
                : 'NO ASIGNADO'}
            </p>
          </span>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Rec. Token</h3>
            <p>{details.recovery_token}</p>
          </span>
        </div>
      )}
    </>
  );
};

export default UsersDetails;
