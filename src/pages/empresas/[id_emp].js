'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '../../components/CustomInput';
// import Appcontext from '../context/AppContext';
import ErrorLayout from '../../components/ErrorLayout';
import useApiEmpresas from '../../hooks/useApiEmpresas';
import { validateExpToken } from '../../utils/helpers';
import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const Newregister = () => {
  const {
    postEmpresas,
    getEmpresaById,
    updateEmpresa,
    error,
    statusError,
    messageError,
  } = useApiEmpresas();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro de firebase)
  const idSearch = nextRouter.query.id_emp; //Para verificar el string param de id_emp y saber si estoy creando o editando un registro
  console.log(`id_emp: ${idSearch}`);
  const ruta = usePathname();

  const initialState = {
    id_emp: '',
    nombre_emp: '',
    ruc: '',
    direccion: '',
    telefono: '',
    correo: '',
    correo_secund: undefined,
    ciudad: '',
    planMant: false,
    estatus: true,
  };
  const [valueState, setValueState] = useState(initialState);
  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });

  useEffect(() => {
    getDataEmpresa();
    validateExpToken();
  }, [ruta]);

  const getDataEmpresa = () => {
    //Valido si estoy crendo un nuevo registro o editando
    if (idSearch !== 'new') {
      setLoadCreate({ loading: true, error: null });
      //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
      const response = getEmpresaById(idSearch);
      response
        .then((data) => {
          console.log({ dataGetApi: data });
          //Ya que la consulta a la API retorna los datos de la empresa con las FK que traen más datos de otras tablas,
          //solo extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
          //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de Empresas, no envio el id_emp ya que es la PK y está prohibido topar ese campo.
          const dataEdit = {
            nombre_emp: data.nombre_emp,
            ruc: data.ruc,
            direccion: data.direccion,
            telefono: data.telefono,
            correo: data.correo,
            correo_secund:
              data.correo_secund === null ? undefined : data.correo_secund,
            ciudad: data.ciudad,
            planMant: data.planMant,
            estatus: data.estatus,
          };
          setValueState(dataEdit);
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

  const handleCheck = (fieldCheck) => {
    if (fieldCheck === 'plan') {
      setValueState({ ...valueState, planMant: !valueState.planMant });
    } else if (fieldCheck === 'est') {
      setValueState({ ...valueState, estatus: !valueState.estatus });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idSearch === 'new') {
      postEmpresas(valueState);
    } else {
      updateEmpresa(idSearch, valueState);
    }
    // Resetea campos llenos y estado para seguir creando registros
    // !error &&
    //   setTimeout(() => {
    //     setValueState(initialState);
    //     let form = document.getElementById('form');
    //     form.reset();
    //   }, 1000);
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
            <span className={styles.idField}>
              <CustomInput
                typeInput="text"
                nameInput="id_emp"
                valueInput={!idSearch ? valueState.id_emp : idSearch}
                onChange={handleChange}
                nameLabel="Id.Empresa"
                required={true}
                disabled={idSearch !== 'new' && true}
              />

              <CustomInput
                typeInput="text"
                nameInput="nombre_emp"
                valueInput={valueState.nombre_emp}
                onChange={handleChange}
                nameLabel="Nombre / Razón Social"
                required={true}
              />
            </span>
            <CustomInput
              typeInput="number"
              nameInput="ruc"
              valueInput={valueState.ruc}
              onChange={handleChange}
              nameLabel="RUC"
              required={true}
            />
            <CustomInput
              typeInput="text"
              nameInput="direccion"
              valueInput={valueState.direccion}
              onChange={handleChange}
              nameLabel="Dirección"
              required={true}
            />
            <CustomInput
              typeInput="tel"
              nameInput="telefono"
              valueInput={valueState.telefono}
              onChange={handleChange}
              nameLabel="Teléfono"
              required={true}
            />
            <CustomInput
              typeInput="email"
              nameInput="correo"
              valueInput={valueState.correo}
              onChange={handleChange}
              nameLabel="Correo"
              required={true}
            />
            <CustomInput
              typeInput="email"
              nameInput="correo_secund"
              valueInput={valueState.correo_secund}
              onChange={handleChange}
              nameLabel="Correo Alterno"
              required={false}
            />
            <CustomInput
              typeInput="text"
              nameInput="ciudad"
              valueInput={valueState.ciudad}
              onChange={handleChange}
              nameLabel="Ciudad"
              required={true}
            />
            <CustomInput
              typeInput="checkbox"
              nameInput="planMant"
              isChecked={valueState.planMant}
              onChange={() => {
                handleCheck('plan');
              }}
              nameLabel="Posee Plan de Mantenimiento?"
              required={false}
            />
            <CustomInput
              typeInput="checkbox"
              nameInput="estatus"
              isChecked={valueState.estatus}
              onChange={() => {
                handleCheck('est');
              }}
              nameLabel="Activo?"
              required={false}
            />
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
                <Link href="/empresas" className={`${styles.cancelButton}`}>
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

export default Newregister;
