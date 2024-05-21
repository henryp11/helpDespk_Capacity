'use Client';
import React from 'react';
import CustomInput from '@/components/CustomInput';
import ErrorLayout from '@/components/ErrorLayout';
import useAuth from '@/hooks/useAuth';
import styles from '../../styles/forms.module.css';

const Changepass = () => {
  const {
    resData,
    dataUser,
    setDataUser,
    error,
    statusError,
    messageError,
    changePass,
  } = useAuth();

  const handleChange = (e) => {
    // const {name, value} = e.target; //Se puede desestructurar el evento como objeto
    setDataUser({ ...dataUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleRecovery = () => {
    changePass();
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
          Usuario registrado con el correo {dataUser.user} <br /> A continuación
          ingrese su nueva contraseña:
        </h4>
        <form onSubmit={handleSubmit} className={styles['form-default']}>
          <CustomInput
            typeInput="text"
            nameInput="pass"
            valueInput={dataUser.pass}
            onChange={handleChange}
            nameLabel="Nueva Contraseña"
            required={true}
          />

          <button onClick={handleRecovery} className={styles['formButton']}>
            Cambiar
          </button>
        </form>
      </div>
      {error && (
        <>
          <ErrorLayout
            messageError={messageError}
            statusCode={statusError}
            customMessage={statusError}
          />
        </>
      )}
    </>
  );
};

export default Changepass;
