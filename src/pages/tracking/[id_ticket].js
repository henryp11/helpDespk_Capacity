'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '../../components/CustomInput';
// import Appcontext from '../context/AppContext';
import Solicitud from '@/components/Solicitud';
import ErrorLayout from '../../components/ErrorLayout';
import useApiTickets from '../../hooks/useApiTickets';
import { validateExpToken } from '../../utils/helpers';
import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const Newregister = () => {
  const { getTicketById, updateTicket, error, statusError, messageError } =
    useApiTickets();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro de firebase)
  const idSearch = nextRouter.query.id_ticket; //Para verificar el string param de id_ticket y saber si estoy creando o editando un registro
  console.log(`id_ticket: ${idSearch}`);
  const ruta = usePathname();

  const initialState = {
    id_cliente: '',
    id_emp: '',
    descrip_tk: '',
    personal_emp: { empresa: {} },
    det_tickets: [],
  };
  const [valueState, setValueState] = useState(initialState);
  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });
  const [showSolicitud, setShowSolicitud] = useState(false);
  const [regCapture, setRegCapture] = useState('');

  useEffect(() => {
    getDataTicket();
    validateExpToken();
  }, [ruta]);

  const getDataTicket = () => {
    //Valido si estoy crendo un nuevo registro o editando
    if (idSearch !== 'new') {
      setLoadCreate({ loading: true, error: null });
      //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
      const response = getTicketById(idSearch);
      response
        .then((data) => {
          console.log({ dataGetApi: data });
          //Ya que la consulta a la API retorna los datos de la empresa con las FK que traen más datos de otras tablas,
          //solo extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
          //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de Empresas, no envio el id_ticket ya que es la PK y está prohibido topar ese campo.
          const dataEdit = {
            id_cliente: data.id_cliente,
            id_emp: data.id_emp,
            prioridad: data.prioridad,
            descrip_tk: data.descrip_tk,
            fecha_reg: data.fecha_reg,
            fecha_ini_sop: data.fecha_ini_sop,
            fecha_fin_sop:
              data.fecha_fin_sop === null ? undefined : data.fecha_fin_sop,
            tiempo_calc_sop:
              data.tiempo_calc_sop === null ? undefined : data.tiempo_calc_sop,
            tiempo_diferencial:
              data.tiempo_diferencial === null
                ? undefined
                : data.tiempo_diferencial,
            tiempo_real_sop:
              data.tiempo_real_sop === null ? undefined : data.tiempo_real_sop,
            estatus: data.estatus,
            personal_emp: data.personal_emp,
            det_tickets: data.det_tickets,
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

  // const handleCheck = (fieldCheck) => {
  //   if (fieldCheck === 'plan') {
  //     setValueState({ ...valueState, planMant: !valueState.planMant });
  //   } else if (fieldCheck === 'est') {
  //     setValueState({ ...valueState, estatus: !valueState.estatus });
  //   }
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idSearch === 'new') {
      // postEmpresas(valueState);
    } else {
      updateTicket(idSearch, valueState);
    }
  };

  console.log({ stateCompon: valueState });

  return (
    <>
      <div className={stylesEmp.crudEmpContainer}>
        <h2>
          {idSearch !== 'new'
            ? `Ticket # ${idSearch} `
            : 'Creando Nuevo Registro '}
          - <i>Estado: {valueState.estatus}</i>
        </h2>
        {loadCreate.loading === false ? (
          <form
            id="form"
            onSubmit={handleSubmit}
            className={styles['form-default']}
          >
            <CustomInput
              typeInput="text"
              nameInput="nombre_emp"
              valueInput={valueState.personal_emp.empresa.nombre_emp}
              onChange={handleChange}
              nameLabel="Empresa"
              required={true}
              disabled={idSearch !== 'new' && true}
            />
            <CustomInput
              typeInput="text"
              nameInput="nombre"
              valueInput={valueState.personal_emp.nombre}
              onChange={handleChange}
              nameLabel="Solicitante"
              required={true}
              disabled={idSearch !== 'new' && true}
            />
            <CustomInput
              typeInput="text"
              nameInput="prioridad"
              valueInput={valueState.prioridad}
              onChange={handleChange}
              nameLabel="Prioridad"
              required={true}
              disabled={idSearch !== 'new' && true}
            />
            <CustomInput
              typeInput="text"
              nameInput="descrip_tk"
              valueInput={valueState.descrip_tk}
              onChange={handleChange}
              nameLabel="Descripción General de Ticket"
              required={true}
            />
            <CustomInput
              typeInput="text"
              nameInput="fecha_reg"
              valueInput={valueState.fecha_reg}
              onChange={handleChange}
              nameLabel="Fecha de Registro"
              required={true}
              disabled={idSearch !== 'new' && true}
            />
            <CustomInput
              typeInput="text"
              nameInput="fecha_ini_sop"
              valueInput={valueState.fecha_ini_sop}
              onChange={handleChange}
              nameLabel="F. inició el soporte"
              required={true}
              disabled={idSearch !== 'new' && true}
            />
            <CustomInput
              typeInput="text"
              nameInput="fecha_fin_sop"
              valueInput={valueState.fecha_fin_sop}
              onChange={handleChange}
              nameLabel="F. finalizó soporte para todas las solicitudes"
              required={true}
              disabled={idSearch !== 'new' && true}
            />

            <CustomInput
              typeInput="text"
              nameInput="tiempo_real_sop"
              valueInput={valueState.tiempo_real_sop}
              onChange={handleChange}
              nameLabel="Tiempo Final de soporte"
              required={true}
              disabled={idSearch !== 'new' && true}
            />
            {valueState.det_tickets &&
              valueState.det_tickets.map((solicitud, index) => {
                return (
                  <div
                    key={solicitud.id_solicitud}
                    style={{ gridColumn: '1/-1' }}
                  >
                    <h4
                      style={{
                        display: 'flex',
                        margin: '5px 10px',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      Solicitud # {index + 1}
                      <button
                        className={`${styles['formButton']} ${styles['formButtonShow']}`}
                        onClick={() => {
                          setShowSolicitud(!showSolicitud);

                          if (showSolicitud) {
                            if (regCapture !== solicitud.id_solicitud) {
                              setShowSolicitud(false);
                              setRegCapture(solicitud.id_solicitud);
                              // setDataRegCap({ ...register });
                              setShowSolicitud(true);
                            } else {
                              setShowSolicitud(false);
                            }
                          } else {
                            setShowSolicitud(!showSolicitud);
                            setRegCapture(solicitud.id_solicitud);
                            // setDataRegCap({ ...register });
                          }
                        }}
                        type="button"
                      >
                        Mostrar
                        {regCapture === solicitud.id_solicitud &&
                        showSolicitud ? (
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
                              d="M4.5 15.75l7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        ) : (
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
                              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        )}
                      </button>
                    </h4>
                    {regCapture === solicitud.id_solicitud && (
                      <Solicitud
                        showSolicitud={showSolicitud}
                        dataSolicitud={solicitud}
                      />
                    )}
                  </div>
                );
              })}

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
                <Link
                  href="/tickets/allTickets"
                  className={`${styles.cancelButton}`}
                >
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
      {error && statusError !== 400 && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </>
  );
};

export default Newregister;
