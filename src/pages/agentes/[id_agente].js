'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '../../components/CustomInput';
import ErrorLayout from '../../components/ErrorLayout';
import useApiAgentes from '../../hooks/useApiAgentes';
import { validateExpToken, addZero } from '../../utils/helpers';
import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const newregister = () => {
  const {
    postAgente,
    getAgenteById,
    updateAgente,
    payloadJwt,
    error,
    statusError,
    messageError,
  } = useApiAgentes();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro de firebase)
  const idSearch = nextRouter.query.id_agente; //Para verificar el string param de id_emp y saber si estoy creando o editando un registro
  console.log(`id_agente: ${idSearch}`);
  const ruta = usePathname();

  const initialState = {
    id_agente: '',
    cedula: '',
    nombre: '',
    fecha_ingreso: '',
    fecha_nacimiento: undefined,
    fecha_salida: undefined,
    sexo: undefined,
    cargo: undefined,
    horario: undefined,
    nivel_atencion: undefined,
    estatus: true,
  };
  const [valueState, setValueState] = useState(initialState);
  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });

  useEffect(() => {
    getDataAgente();
    validateExpToken();
  }, [ruta]);

  const getDataAgente = () => {
    //Valido si estoy creando un nuevo registro o editando
    if (idSearch !== 'new') {
      setLoadCreate({ loading: true, error: null });
      //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
      const response = getAgenteById(idSearch);
      response
        .then((data) => {
          console.log({ dataGetApi: data });
          //Ya que la consulta a la API retorna los datos de la empresa con las FK que traen más datos de otras tablas,
          //solo extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
          //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de Empresas, no envio el id_emp ya que es la PK y está prohibido topar ese campo.
          const dataEdit = {
            cedula: data.cedula,
            nombre: data.nombre,
            fecha_ingreso: data.fecha_ingreso,
            fecha_nacimiento:
              data.fecha_nacimiento === null
                ? undefined
                : data.fecha_nacimiento,
            fecha_salida:
              data.fecha_salida === null ? undefined : data.fecha_salida,
            sexo: data.sexo === null ? undefined : data.sexo,
            cargo: data.cargo === null ? undefined : data.cargo,
            horario: data.horario === null ? undefined : data.horario,
            nivel_atencion:
              data.nivel_atencion === null ? undefined : data.nivel_atencion,
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

  const handleCheck = () => {
    setValueState({ ...valueState, estatus: !valueState.estatus });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idSearch === 'new') {
      postAgente(valueState);
    } else {
      updateAgente(idSearch, valueState);
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
            <span className={styles.idField}>
              <CustomInput
                typeInput="text"
                nameInput="id_agente"
                valueInput={!idSearch ? valueState.id_agente : idSearch}
                onChange={handleChange}
                nameLabel="Id.Agente"
                required={true}
                disabled={idSearch !== 'new' && true}
              />
              <CustomInput
                typeInput="text"
                nameInput="nombre"
                valueInput={valueState.nombre}
                onChange={handleChange}
                nameLabel="Nombre Agente"
                required={true}
              />
            </span>
            <CustomInput
              typeInput="text"
              nameInput="cedula"
              valueInput={valueState.cedula}
              onChange={handleChange}
              nameLabel="Nombre Cédula"
              required={true}
            />
            <CustomInput
              typeInput="date"
              nameInput="fecha_ingreso"
              placeholder="Fecha inicio actividades en la empresa"
              valueInput={valueState.fecha_ingreso}
              onChange={handleChange}
              nameLabel="Fecha Ingreso"
              required={true}
            />
            <CustomInput
              typeInput="date"
              nameInput="fecha_nacimiento"
              placeholder="Fecha nacimiento"
              valueInput={valueState.fecha_nacimiento}
              onChange={handleChange}
              nameLabel="Fecha Nacimiento"
            />
            <CustomInput
              typeInput="date"
              nameInput="fecha_salida"
              placeholder="Fecha finaliza actividades en la empresa"
              valueInput={valueState.fecha_salida}
              onChange={handleChange}
              nameLabel="Fecha Salida"
            />

            <CustomInput
              typeInput="text"
              nameInput="cargo"
              valueInput={valueState.cargo}
              onChange={handleChange}
              nameLabel="Cargo"
            />
            <span className={styles.selectContainer}>
              <b>* Nivel de Atención:</b>
              <select name="nivel_atencion" onChange={handleChange} required>
                {valueState.nivel_atencion ? (
                  <option value={valueState.nivel_atencion}>
                    {valueState.nivel_atencion}
                  </option>
                ) : (
                  <option value="" label="Elegir Nivel:">
                    Elegir nivel
                  </option>
                )}
                <option value="N1">N1-Estándar: manejo en general</option>
                <option value="N2">N2-Básica: procesos técnicos</option>
                <option value="N3">N3-Moderada: gestión errores</option>
                <option value="N4">N4-Avanzada: gestión por DB</option>
                <option value="N5">
                  N5-Desarrollo: manipulación código software
                </option>
              </select>
            </span>
            <CustomInput
              typeInput="checkbox"
              nameInput="estatus"
              isChecked={valueState.estatus}
              onChange={() => {
                handleCheck();
              }}
              nameLabel="Agente Activo?"
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
                <Link href="/agentes" className={`${styles.cancelButton}`}>
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
