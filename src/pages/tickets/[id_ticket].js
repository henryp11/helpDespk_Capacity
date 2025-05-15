'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '../../components/CustomInput';
// import Appcontext from '../context/AppContext';
import Solicitud from '@/components/Solicitud';
import ErrorLayout from '../../components/ErrorLayout';
import useApiTickets from '../../hooks/useApiTickets';
import { validateExpToken, timeFormat } from '../../utils/helpers';
import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const Newregister = () => {
  const {
    getTicketById,
    updateTicket,
    payloadJwt,
    error,
    statusError,
    messageError,
  } = useApiTickets();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro)
  const idSearch = nextRouter.query.id_ticket; //Para verificar el string param de id_ticket y saber si estoy creando o editando un registro
  const ruta = usePathname();
  const searchParams = useSearchParams();
  //Depende del entorno, evaluo si la invocación viene de la pantalla de histórico o desde el tracking
  const enviroment = searchParams.get('entorno');

  const initialState = {
    id_cliente: '',
    id_emp: '',
    descrip_tk: '',
    id_tipo: '',
    nombre_categ: '',
    personal_emp: { empresa: {} },
    det_tickets: [],
    estatus: '',
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
            id_tipo: data.id_tipo === null ? undefined : data.id_tipo,
            fecha_reg: moment(data.fecha_reg).format('YYYY-MM-DDTkk:mm:ss'),
            fecha_ini_sop:
              data.fecha_ini_sop === null
                ? undefined
                : moment(data.fecha_ini_sop).format('YYYY-MM-DDTkk:mm:ss'),
            fecha_fin_sop:
              data.fecha_fin_sop === null
                ? undefined
                : moment(data.fecha_fin_sop).format('YYYY-MM-DDTkk:mm:ss'),
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
            nombre_categ:
              data.categorias_sop === null
                ? 'Sin Categ.'
                : data.categorias_sop.descrip,
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
      const dataUpdate = {
        id_cliente: valueState.id_cliente,
        id_emp: valueState.id_emp,
        prioridad: valueState.prioridad,
        descrip_tk: valueState.descrip_tk,
        fecha_reg: valueState.fecha_reg,
        fecha_ini_sop: valueState.fecha_ini_sop,
        fecha_fin_sop: valueState.fecha_fin_sop,
        tiempo_calc_sop: valueState.tiempo_calc_sop,
        tiempo_diferencial: valueState.tiempo_diferencial,
        tiempo_real_sop: valueState.tiempo_real_sop,
        estatus: valueState.estatus,
      };
      updateTicket(idSearch, dataUpdate);
    }
  };

  console.log({ stateMtrTicket: valueState });

  return (
    <>
      <div className={`${stylesEmp.crudEmpContainer} notranslate`}>
        <h2>
          {idSearch !== 'new'
            ? `Ticket ${valueState.nombre_categ} # ${idSearch} `
            : 'Creando Nuevo Registro '}
          - <em>Estado: {valueState.estatus}</em>
        </h2>
        <h3>
          <em>
            Si el estado del ticket es &quot;Solicitado&quot; aún puede editar
            su información
          </em>
        </h3>
        {loadCreate.loading === false ? (
          <form
            id="form"
            onSubmit={handleSubmit}
            className={styles['form-default']}
          >
            <span className={styles.inputContainer2_1}>
              <CustomInput
                typeInput="text"
                nameInput="nombre_emp"
                valueInput={valueState.personal_emp.empresa.nombre_emp}
                onChange={handleChange}
                nameLabel="Empresa"
                disabled={idSearch !== 'new' && true}
              />
              <CustomInput
                typeInput="text"
                nameInput="nombre"
                valueInput={valueState.personal_emp.nombre}
                onChange={handleChange}
                nameLabel="Solicitante"
                disabled={idSearch !== 'new' && true}
              />
              <CustomInput
                typeInput="text"
                nameInput="prioridad"
                valueInput={valueState.prioridad}
                onChange={handleChange}
                nameLabel="Prioridad"
                disabled={idSearch !== 'new' && true}
              />
            </span>
            <span className={styles.inputContainer3_1}>
              <CustomInput
                typeInput="datetime-local"
                nameInput="fecha_reg"
                valueInput={valueState.fecha_reg}
                onChange={handleChange}
                nameLabel="Fecha de Registro"
                disabled={true}
              />
              <CustomInput
                typeInput="datetime-local"
                nameInput="fecha_ini_sop"
                valueInput={valueState.fecha_ini_sop}
                onChange={handleChange}
                nameLabel="F. inició el soporte"
                disabled={true}
              />
              <CustomInput
                typeInput="datetime-local"
                nameInput="fecha_fin_sop"
                valueInput={valueState.fecha_fin_sop}
                onChange={handleChange}
                nameLabel="F. fin todo soporte"
                disabled={true}
              />
              <CustomInput
                typeInput="text"
                nameInput="tiempo_calc_sop"
                valueInput={timeFormat(
                  Number(valueState.tiempo_calc_sop) * 1000
                )}
                onChange={handleChange}
                nameLabel="T. Soporte"
                disabled={true}
              />
              <CustomInput
                typeInput="text"
                nameInput="tiempo_diferencial"
                valueInput={timeFormat(
                  Number(valueState.tiempo_diferencial) * 1000
                )}
                onChange={handleChange}
                nameLabel="(-)T. Incidencias"
                disabled={true}
              />
              <CustomInput
                typeInput="text"
                nameInput="tiempo_real_sop"
                valueInput={timeFormat(
                  Number(valueState.tiempo_real_sop) * 1000
                )}
                onChange={handleChange}
                nameLabel="T. Final"
                disabled={true}
              />
            </span>
            <span
              style={{
                position: 'relative',
                gridTemplateColumns: '95%',
              }}
              className={styles.inputContainer1_1}
            >
              <CustomInput
                typeInput="text"
                nameInput="descrip_tk"
                valueInput={valueState.descrip_tk}
                onChange={handleChange}
                nameLabel="Descripción General de Ticket"
                disabled={
                  payloadJwt.perfil === 'admin'
                    ? false
                    : payloadJwt.perfil !== 'admin' && enviroment === 'history'
                    ? true
                    : false
                }
              />
              {!showSolicitud && payloadJwt.perfil === 'admin' ? (
                <button
                  title="Actualizar Descripción General del Ticket"
                  className={styles['formButton']}
                  id="updateMtrTK"
                >
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
              ) : !showSolicitud &&
                payloadJwt.perfil !== 'admin' &&
                enviroment === 'tracking' &&
                valueState.estatus === 'solicitado' ? (
                <button
                  title="Actualizar Descripción General del Ticket"
                  className={styles['formButton']}
                  id="updateMtrTK"
                >
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
              ) : (
                ''
              )}
            </span>
            <span className={styles.buttonContainer} id={styles.buttonTicket}>
              <Link
                href={
                  enviroment === 'tracking'
                    ? '/tracking/allTickets'
                    : '/tickets/allTickets'
                }
                className={`${styles.cancelButton}`}
                title="regresar"
              >
                <button
                  className={`${styles.formButton}`}
                  id="cancelButtonEditTicket"
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
                </button>
              </Link>
            </span>
          </form>
        ) : (
          <h1>loading...</h1>
        )}
        {valueState.det_tickets &&
          valueState.det_tickets.map((solicitud, index) => {
            return (
              <div
                key={solicitud.id_solicitud}
                style={{
                  gridColumn: '1/-1',
                  width: '100%',
                  background: 'white',
                }}
              >
                <h4
                  style={
                    !solicitud.isError
                      ? {
                          display: 'flex',
                          margin: '5px 10px',
                          justifyContent: 'space-evenly',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#444a8d',
                        }
                      : {
                          display: 'flex',
                          margin: '5px 10px',
                          justifyContent: 'space-evenly',
                          alignItems: 'center',
                          gap: '2px',
                          color: '#9b2020',
                        }
                  }
                >
                  Solicitud # {index + 1} | <em>Estado: {solicitud.estatus}</em>
                  {solicitud.isError && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                      title="La solicitud ha sido marcada como error, el tiempo de este soporte no se considerará en el soporte total del cliente"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                        style={{ color: '#9b2020' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                        />
                      </svg>
                    </span>
                  )}
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
                    title="Muestra el detalle completo de la solicitud"
                  >
                    Mostrar
                    {regCapture === solicitud.id_solicitud && showSolicitud ? (
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
                    setShowSolicitud={setShowSolicitud}
                    dataSolicitud={solicitud}
                    showControl={true}
                    perfil={payloadJwt.perfil}
                    enviroment={enviroment}
                    statusTicket={valueState.estatus}
                  />
                )}
              </div>
            );
          })}
      </div>
      {error && statusError !== 400 && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </>
  );
};

export default Newregister;
