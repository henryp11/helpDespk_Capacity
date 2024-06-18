'use Client';
import React from 'react';
import Link from 'next/link';
import CustomInput from '@/components/CustomInput';
import ErrorLayout from '@/components/ErrorLayout';
import useAuth from '@/hooks/useAuth';
import styles from '../../styles/forms.module.css';

const Recoverypass = () => {
  const {
    resData,
    dataUser,
    setDataUser,
    error,
    statusError,
    messageError,
    recoveryPass,
  } = useAuth();

  const handleChange = (e) => {
    // const {name, value} = e.target; //Se puede desestructurar el evento como objeto
    setDataUser({ ...dataUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleRecovery = () => {
    recoveryPass();
  };

  console.log({
    userData: dataUser,
    data: resData,
    isError: error,
    code: statusError,
    errorM: messageError,
  });

  return (
    <>
      <div className={styles['loginContainer']}>
        <h4 style={{ textAlign: 'center', margin: '8px' }}>
          Digite el correo con el que se registro para recuperar su contraseña y
          siga los pasos indicados en el mail que le llegará:
        </h4>
        <form onSubmit={handleSubmit} className={styles['form-default']}>
          <CustomInput
            typeInput="email"
            nameInput="user"
            valueInput={dataUser.user}
            onChange={handleChange}
            nameLabel="Correo"
            required={true}
          />

          <button onClick={handleRecovery} className={styles['formButton']}>
            Enviar Correo
          </button>
          <h5 style={{ textAlign: 'center', margin: '8px', color: 'red' }}>
            <i>
              * Tiene 15 minutos para recuperar su contraseña, caso contrario
              deberá realizar el proceso de envío del correo de recuperación
              nuevamente.
            </i>
          </h5>
          <button
            title="Regresar"
            className={`${styles.formButton}`}
            id="cancelButton"
            onClick={() => {
              localStorage.clear();
            }}
            style={{ background: 'transparent' }}
          >
            <Link href="/" className={`${styles.cancelButton}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Link>
          </button>
        </form>
      </div>
      {error && (
        <>
          <ErrorLayout
            messageError={messageError}
            statusCode={statusError}
            customMessage={statusError === 401 && 'NO Registrado'}
          />
        </>
      )}
    </>
  );
};

export default Recoverypass;
