'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '../../components/CustomInput';
import ErrorLayout from '../../components/ErrorLayout';
import useApiUsuarios from '../../hooks/useApiUsuarios';
import { validateExpToken, addZero } from '../../utils/helpers';
import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const newregister = () => {
  const {
    postUsuario,
    getUsuarioById,
    updateUsuario,
    payloadJwt,
    error,
    statusError,
    messageError,
  } = useApiUsuarios();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro de firebase)
  const idSearch = nextRouter.query.id_user; //Para verificar el string param de id_emp y saber si estoy creando o editando un registro
  console.log(`id_user: ${idSearch}`);
  const ruta = usePathname();

  const initialState = {
    username: '',
    mail: '',
    password: '',
    rol: undefined,
    estatus: true,
  };

  const [valueState, setValueState] = useState(initialState);

  //Para usuario personal de empresa
  const [dataEmp, setDataEmp] = useState({
    id_per: '',
    nombre_per: '',
    empresa: '',
  });

  //Para usuario personal de soporte
  const [dataAgent, setDataAgent] = useState({
    id_agente: '',
    nombre: '',
    cargo: '',
  });

  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });

  useEffect(() => {
    getDataUsuario();
    validateExpToken();
  }, [ruta]);

  const getDataUsuario = () => {
    //Valido si estoy creando un nuevo registro o editando
    if (idSearch !== 'new') {
      setLoadCreate({ loading: true, error: null });
      //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
      const response = getUsuarioById(idSearch);
      response
        .then((data) => {
          console.log({ dataGetApi: data });
          //Ya que la consulta a la API retorna los datos de la empresa con las FK que traen más datos de otras tablas,
          //solo extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
          //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de Empresas, no envio el id_emp ya que es la PK y está prohibido topar ese campo.
          const dataEdit = {
            username: data.username,
            mail: data.mail,
            rol: data.rol === null ? undefined : data.rol,
            estatus: data.estatus,
          };

          const infoEmp = {
            id_per: data.personalEmp === null ? '-' : data.personalEmp.id_per,
            nombre_per:
              data.personalEmp === null ? '-' : data.personalEmp.nombre,
            empresa:
              data.personalEmp === null
                ? 'NO ASIGNADO'
                : data.personalEmp.empresa.nombre_emp,
          };

          const infoAgent = {
            id_agente:
              data.agentesSop === null ? '-' : data.agentesSop.id_agente,
            nombre: data.agentesSop === null ? '-' : data.agentesSop.nombre,
            cargo: data.agentesSop === null ? '-' : data.agentesSop.cargo,
          };

          setValueState(dataEdit);
          setDataEmp(infoEmp);
          setDataAgent(infoAgent);
          setLoadCreate({ loading: false, error: null });
        })
        .catch((error) => {
          console.log(error);
          setLoadCreate({ loading: false, error: error });
        });
    }
  };

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  const handleCheck = () => {
    setValueState({ ...valueState, estatus: !valueState.estatus });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idSearch === 'new') {
      postUsuario(valueState);
    } else {
      updateUsuario(idSearch, valueState);
    }
  };

  console.log({ stateCompon: valueState });

  return (
    <>
      <div className={stylesEmp.crudEmpContainer}>
        <h2>
          {idSearch !== 'new' ? 'Editando Registro' : 'Creando Nuevo Registro'}
        </h2>
        {loadCreate.loading === false ? (
          <form
            id="form"
            onSubmit={handleSubmit}
            className={styles['form-default']}
          >
            <CustomInput
              typeInput="text"
              nameInput="username"
              valueInput={valueState.username}
              onChange={handleChange}
              nameLabel="Nombre Usuario"
              required={true}
            />
            <CustomInput
              typeInput="email"
              nameInput="mail"
              valueInput={valueState.mail}
              onChange={handleChange}
              nameLabel="Correo de Registro"
              required={true}
            />
            {idSearch === 'new' && (
              <CustomInput
                typeInput="password"
                nameInput="password"
                valueInput={valueState.password}
                onChange={handleChange}
                nameLabel="Contraseña"
                required={true}
              />
            )}
            <span className={styles.selectContainer}>
              <b>* Rol / Perfil del usuario:</b>
              <select name="rol" onChange={handleChange} required>
                {valueState.rol ? (
                  <option value={valueState.rol}>{valueState.rol}</option>
                ) : (
                  <option value="" label="Elegir Rol:">
                    Elegir Rol
                  </option>
                )}
                <option value="cliente">cliente</option>
                <option value="supervisor">supervisor</option>
                <option value="agente">agente de soporte</option>
                <option value="admin">administrador</option>
              </select>
            </span>

            <CustomInput
              typeInput="checkbox"
              nameInput="estatus"
              isChecked={valueState.estatus}
              onChange={() => {
                handleCheck();
              }}
              nameLabel="Usuario Activo?"
              required={false}
            />
            {valueState.rol !== 'agente' ? (
              <span style={{ color: 'black' }}>
                <p>
                  <b>
                    <i>Pertenece a: </i>
                  </b>
                  {dataEmp.empresa}
                </p>
                <p>
                  <b>
                    <i>Vinculado con: </i>
                  </b>
                  {dataEmp.id_per} - {dataEmp.nombre_per}
                </p>
              </span>
            ) : (
              <span style={{ color: 'black' }}>
                <p>
                  <b>
                    <i>Vinculado con Agente de Soporte: </i>
                  </b>
                  {dataAgent.id_agente} - {dataAgent.nombre} <br />
                  {dataAgent.cargo}
                </p>
              </span>
            )}

            <span className={styles.buttonContainer}>
              <button title="Guardar" className={styles['formButton']}>
                {idSearch === 'new' ? (
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ scale: '0.7' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                )}
              </button>
              <button
                tittle="Cancelar"
                className={`${styles.formButton}`}
                id="cancelButton"
              >
                <Link href="/usuarios" className={`${styles.cancelButton}`}>
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
        ) : (
          <h1>loading...</h1>
        )}
      </div>
      {error && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </>
  );
};

export default newregister;
