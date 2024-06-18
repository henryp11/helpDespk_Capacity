'use Client';
import React from 'react';
import Link from 'next/link';
import CustomInput from '../components/CustomInput';
import ErrorLayout from '../components/ErrorLayout';
import useAuth from '../hooks/useAuth';
import styles from '../styles/forms.module.css';

const Login = () => {
  const {
    resData,
    token,
    payloadJwt,
    dataUser,
    setDataUser,
    error,
    statusError,
    messageError,
    signIn,
  } = useAuth();

  const handleChange = (e) => {
    // const {name, value} = e.target; //Se puede desestructurar el evento como objeto
    setDataUser({ ...dataUser, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleSignIn = () => {
    signIn();
  };

  console.log({
    userData: dataUser,
    data: resData,
    isError: error,
    codeStatus: statusError,
    errorM: messageError,
    token: token,
    payloadJWT: payloadJwt,
  });

  return (
    <>
      <div className={styles['loginContainer']}>
        <form onSubmit={handleSubmit} className={styles['form-default']}>
          <CustomInput
            typeInput="text"
            nameInput="user"
            valueInput={dataUser.user}
            onChange={handleChange}
            nameLabel="Correo"
            required={true}
          />
          <CustomInput
            typeInput="password"
            nameInput="pass"
            valueInput={dataUser.pass}
            onChange={handleChange}
            nameLabel="Contraseña"
            required={true}
          />
          <button onClick={handleSignIn} className={styles['formButton']}>
            Acceder
          </button>
          <Link href="/recovery/recoverypass" className={styles['recovery']}>
            Reestablecer Contraseña
          </Link>
          <Link href="/account" className={styles['recovery']}>
            Crear Cuenta
          </Link>
        </form>
      </div>
      {error && (
        <>
          <ErrorLayout
            messageError={messageError}
            statusCode={statusError}
            customMessage={
              statusError === 401
                ? `Usuario o contraseña invalido. Si no está registrado proceda a "crear su cuenta" o reestablecer su contraseña si la olvidó`
                : statusError === 400
                ? 'Debe Ingresar su correo y contraseña para poder ingresar, por favor intentelo nuevamente'
                : ''
            }
            account={true}
          />
        </>
      )}
    </>
  );
};

export default Login;
