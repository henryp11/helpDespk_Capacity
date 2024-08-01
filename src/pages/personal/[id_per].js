'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '../../components/CustomInput';
import ErrorLayout from '../../components/ErrorLayout';
import useApiPersonal from '../../hooks/useApiPersonal';
import useApiEmpresas from '../../hooks/useApiEmpresas';
import { validateExpToken } from '../../utils/helpers';
import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const Newregister = () => {
  const {
    postPersonal,
    getPersonalById,
    updatePersonal,
    error,
    statusError,
    messageError,
  } = useApiPersonal();

  const { getEmpresaByRuc } = useApiEmpresas();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro)
  const idSearch = nextRouter.query.id_per; //Para verificar el string param de id_per y saber si estoy creando o editando un registro
  console.log(`id_per: ${idSearch}`);
  const ruta = usePathname();

  const initialState = {
    id_per: '',
    id_emp: '',
    nombre: '',
    telf1: '',
    telf2: undefined,
    cargo: undefined,
    depto: undefined,
    correo: undefined,
    estatus: true,
  };
  const [valueState, setValueState] = useState(initialState);
  //Para mostrar el ícono de buscar una empresa para vincular al personal
  const [showSelectEmpresa, setShowSelectEmpresa] = useState(false);
  //Controlar datos capturados si existe la empresa a buscar
  const [rucEmpresa, setRucEmpresa] = useState({
    rucSearch: '',
    nombre_emp: '',
    id_emp: '',
  });
  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });

  useEffect(() => {
    getDataPersonal();
    validateExpToken();
  }, [ruta]);

  const getDataPersonal = () => {
    //Verifico el perfil del usuario que está creando el personal
    const payloadLS = localStorage.getItem('payload');
    const payloadStorage = payloadLS && JSON.parse(payloadLS);
    //Valido si estoy crendo un nuevo registro o editando
    if (idSearch !== 'new') {
      setLoadCreate({ loading: true, error: null });
      const response = getPersonalById(idSearch); //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
      response
        .then((data) => {
          console.log({ dataGetApi: data });
          //Ya que la consulta a la API retorna los datos del personal con las FK que traen más datos de otras tablas,
          //solo extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
          //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de personal_emp, no envio el id_per e id_emp por ser las PK.
          const dataEdit = {
            // id_per: data.id_per,
            nombre: data.nombre,
            telf1: data.telf1,
            telf2: data.telf2 === null ? undefined : data.telf2,
            cargo: data.cargo === null ? undefined : data.cargo,
            depto: data.depto === null ? undefined : data.depto,
            correo: data.correo === null ? undefined : data.correo,
            estatus: data.estatus,
          };
          setValueState(dataEdit);
          setLoadCreate({ loading: false, error: null });
        })
        .catch((error) => {
          console.log(error);
          setLoadCreate({ loading: false, error: error });
        });
    } else {
      console.log(payloadStorage);
      //Si no es "admin" el id_emp será la empresa a la que pertenece el usuario,
      //en este caso solo un supervisor Puede crear personal para su propia empresa,
      //por eso el id_emp debe ser fijo para ese caso, enviandolo en el estado
      if (payloadStorage.perfil !== 'admin') {
        setValueState({ ...valueState, id_emp: payloadStorage.idEmp });
      } else {
        setShowSelectEmpresa(true); //Solo el Admin deberá poder seleccionar a que empresa asignar un usuario, mostrandose dicho input
      }
    }
  };

  const getDataEmpresaRuc = () => {
    //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
    const response = getEmpresaByRuc(rucEmpresa.rucSearch); //Envío el Ruc Capturado
    response
      .then((data) => {
        console.log({ dataEmpApi: data });
        if (data.length > 0) {
          setRucEmpresa({ ...rucEmpresa, ...data[0] });
          setValueState({ ...valueState, id_emp: data[0].id_emp });
        } else {
          setRucEmpresa({ ...rucEmpresa, nombre_emp: 'Empresa no Registrada' });
        }
      })
      .catch((error) => {
        console.log(error);
        setLoadCreate({ loading: false, error: error });
      });
  };

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  //Controlo el campo de RUC exclusivo para realizar busqueda de empresas a asignar
  const handleChangeRuc = (e) => {
    setRucEmpresa({ ...rucEmpresa, [e.target.name]: e.target.value });
  };

  const handleCheck = (fieldCheck) => {
    if (fieldCheck === 'est') {
      setValueState({ ...valueState, estatus: !valueState.estatus });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idSearch === 'new') {
      postPersonal(valueState);
    } else {
      updatePersonal(idSearch, valueState);
    }
  };

  console.log({ stateCompon: valueState });
  console.log({ stateRucCapture: rucEmpresa });

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
                typeInput="number"
                nameInput="id_per"
                valueInput={!idSearch ? valueState.id_per : idSearch}
                onChange={handleChange}
                nameLabel="Cédula"
                required={true}
                disabled={idSearch !== 'new' && true}
              />
              <CustomInput
                typeInput="text"
                nameInput="nombre"
                valueInput={valueState.nombre}
                onChange={handleChange}
                nameLabel="Nombre"
                required={true}
              />
            </span>
            {showSelectEmpresa && (
              <span className="gridAllColumn">
                <CustomInput
                  typeInput="number"
                  nameInput="rucSearch"
                  placeholder="Digite RUC de la Empresa a la que pertenece y de clic en BUSCAR ➡"
                  valueInput={rucEmpresa.rucSearch}
                  onChange={handleChangeRuc}
                  nameLabel={`Pertenece a: ${rucEmpresa.id_emp} | ${rucEmpresa.nombre_emp}`}
                  required={true}
                  buttonEsp={true}
                  onClickSearch={() => {
                    getDataEmpresaRuc();
                  }}
                />
              </span>
            )}
            <CustomInput
              typeInput="tel"
              nameInput="telf1"
              valueInput={valueState.telf1}
              onChange={handleChange}
              nameLabel="Teléfono"
              required={true}
            />
            <CustomInput
              typeInput="tel"
              nameInput="telf2"
              valueInput={valueState.telf2}
              onChange={handleChange}
              nameLabel="Telf. Secundario"
            />
            <CustomInput
              typeInput="email"
              nameInput="correo"
              valueInput={valueState.correo}
              onChange={handleChange}
              nameLabel="Correo"
            />
            <CustomInput
              typeInput="text"
              nameInput="cargo"
              valueInput={valueState.cargo}
              onChange={handleChange}
              nameLabel="Cargo"
            />
            <CustomInput
              typeInput="text"
              nameInput="depto"
              valueInput={valueState.depto}
              onChange={handleChange}
              nameLabel="Departamento"
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
                <Link href="/personalEmp" className={`${styles.cancelButton}`}>
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
