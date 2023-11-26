'use Client';
import React from 'react';
import CustomInput from '@/components/CustomInput';
import ErrorLayout from '@/components/ErrorLayout';
import useAuth from '@/hooks/useAuth';
import styles from '../../styles/forms.module.css';

const recoverypass = () => {
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

export default recoverypass;
