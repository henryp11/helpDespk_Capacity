import React, { useState } from 'react';
import Link from 'next/link';
import CustomInput from '@/components/CustomInput';
import ErrorLayout from '@/components/ErrorLayout';
import useApiUsuarios from '@/hooks/useApiUsuarios';
import styles from '../styles/forms.module.css';
import stylesEmp from '../styles/emp.module.css';

const Account = () => {
  const { postUsuario, error, statusError, messageError } = useApiUsuarios();

  const initialState = {
    username: '',
    mail: '',
    password: '',
  };

  const [valueState, setValueState] = useState(initialState);

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    postUsuario(valueState);
  };

  console.log({ stateCompon: valueState });

  return (
    <div className={stylesEmp.crudEmpContainer}>
      <h4>Crea tu usuario con el cual iniciar sesión en el sistema</h4>
      <form
        id="form"
        onSubmit={handleSubmit}
        className={styles['form-default']}
      >
        <span className="gridAllColumn">
          <CustomInput
            typeInput="text"
            nameInput="username"
            placeholder="Nombre de usuario que se mostrará en la app"
            valueInput={valueState.username}
            onChange={handleChange}
            nameLabel={`Nombre de usuario`}
            required={true}
          />
          <CustomInput
            typeInput="email"
            nameInput="mail"
            placeholder="Correo que utilizaras para realizar el inicio de sesión a la App"
            valueInput={valueState.mail}
            onChange={handleChange}
            nameLabel="Correo"
            required={true}
          />
          <CustomInput
            typeInput="password"
            nameInput="password"
            placeholder="Tu contraseña debe tener un mínimo de 6 caracteres. Se permite cualquier combinación de caracteres"
            valueInput={valueState.password}
            onChange={handleChange}
            nameLabel="Contraseña"
            required={true}
          />
        </span>
        <span className={styles.buttonContainer}>
          <button title="Guardar" className={styles['formButton']}>
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
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            title="Cancelar"
            className={`${styles.formButton}`}
            id="cancelButton"
            onClick={() => {
              localStorage.clear();
            }}
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
        </span>
      </form>
      {error && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </div>
  );
};

export default Account;
