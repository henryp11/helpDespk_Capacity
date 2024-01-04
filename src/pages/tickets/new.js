'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import CustomInput from '../../components/CustomInput';
// import Appcontext from '../context/AppContext';
import Solicitud from '@/components/Solicitud';
import ErrorLayout from '../../components/ErrorLayout';
import useApiTickets from '../../hooks/useApiTickets';
import { validateExpToken } from '../../utils/helpers';
import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const newregister = () => {
  const router = useRouter();
  const {
    postTickets,
    postSolicitud,
    getOnlySolicitud,
    dataTicket,
    error,
    statusError,
    messageError,
  } = useApiTickets();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro de firebase)
  // const idSearch = nextRouter.query.id_ticket; //Para verificar el string param de id_ticket y saber si estoy creando o editando un registro
  // console.log(`id_ticket: ${idSearch}`);
  const ruta = usePathname();

  const initialState = {
    descrip_tk: '',
  };

  const initialStateSolic = {
    descripcion: '',
    // capturas: { img1: '', img2: '', img3: '', img4: '' },
    capturas: undefined,
  };
  const [valueState, setValueState] = useState(initialState);
  const [stateSolicitud, setStateSolicitud] = useState(initialStateSolic);
  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });
  const [ticketCreated, setTicketCreated] = useState({ isCreated: false });
  const [solicitudCreated, setSolicitudCreated] = useState({
    isCreated: false,
    cantidad: 1,
  });
  const [showButtonSol, setShowButtonSol] = useState(true);
  // const [regCapture, setRegCapture] = useState('');

  useEffect(() => {
    // getDataTicket();
    validateExpToken();
  }, [ruta]);

  // const getDataTicket = () => {
  //   //Valido si estoy crendo un nuevo registro o editando
  //   if (idSearch !== 'new') {
  //     setLoadCreate({ loading: true, error: null });
  //     //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
  //     const response = getTicketById(idSearch);
  //     response
  //       .then((data) => {
  //         console.log({ dataGetApi: data });
  //         //Ya que la consulta a la API retorna los datos de la empresa con las FK que traen más datos de otras tablas,
  //         //solo extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
  //         //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de Empresas, no envio el id_ticket ya que es la PK y está prohibido topar ese campo.
  //         const dataEdit = {
  //           id_cliente: data.id_cliente,
  //           id_emp: data.id_emp,
  //           prioridad: data.prioridad,
  //           descrip_tk: data.descrip_tk,
  //           fecha_reg: data.fecha_reg,
  //           fecha_ini_sop: data.fecha_ini_sop,
  //           fecha_fin_sop:
  //             data.fecha_fin_sop === null ? undefined : data.fecha_fin_sop,
  //           tiempo_calc_sop:
  //             data.tiempo_calc_sop === null ? undefined : data.tiempo_calc_sop,
  //           tiempo_diferencial:
  //             data.tiempo_diferencial === null
  //               ? undefined
  //               : data.tiempo_diferencial,
  //           tiempo_real_sop:
  //             data.tiempo_real_sop === null ? undefined : data.tiempo_real_sop,
  //           estatus: data.estatus,
  //           personal_emp: data.personal_emp,
  //           det_tickets: data.det_tickets,
  //         };
  //         setValueState(dataEdit);
  //         setLoadCreate({ loading: false, error: null });
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //         setLoadCreate({ loading: false, error: error });
  //       });
  //   }
  // };

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  const handleChangeSol = (e) => {
    setStateSolicitud({ ...stateSolicitud, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    postTickets(valueState)
      .then((response) => {
        console.log(response);
        setTicketCreated({ isCreated: true, response });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleSubmitSolic = (e) => {
    e.preventDefault();
    postSolicitud(stateSolicitud, ticketCreated.response.id_ticket)
      .then((response) => {
        console.log(response);
        setSolicitudCreated({
          ...solicitudCreated,
          isCreated: true,
          response,
        });
        setShowButtonSol(false);
        getOnlySolicitud(ticketCreated.response.id_ticket);
      })
      .catch((error) => {
        console.error(error);
      });

    if (solicitudCreated.cantidad === 3) {
      router.push('/home');
      toast.success(
        'Ha ingresado el máximo de solicitudes permitidas para este ticket, si desea ingresar más, por favor registrar un nuevo ticket, puede monitorear el proceso de atención ingresando a la opción de "Seguimiento"',
        { duration: 9000 }
      );
    }
  };

  const addSolicitud = () => {
    let formS = document.getElementById('formSolicitud');
    formS.reset();
    setSolicitudCreated({
      ...solicitudCreated,
      cantidad: solicitudCreated.cantidad + 1,
      isCreated: false,
    });
    setStateSolicitud(initialStateSolic);
    setShowButtonSol(true);
  };

  console.log({ stateTicket: valueState });
  console.log({ stateSolicitud: stateSolicitud });
  console.log(ticketCreated);
  console.log(solicitudCreated);

  return (
    <>
      <div className={stylesEmp.crudEmpContainer}>
        <h2>Ingresando Nuevo ticket</h2>
        {loadCreate.loading === false ? (
          <form
            id="form"
            onSubmit={handleSubmit}
            className={styles['form-default']}
          >
            <span style={{ gridColumn: '1/-1' }}>
              <CustomInput
                typeInput="text"
                nameInput="descrip_tk"
                valueInput={valueState.descrip_tk}
                onChange={handleChange}
                placeholder="Ingrese una descripción general del motivo por el que requiere soporte para que su ticket sea ingresado"
                nameLabel="Descripción General"
                required={true}
              />
            </span>

            {!ticketCreated.isCreated && (
              <span
                className={styles.buttonContainer}
                style={{ gap: '4px', width: '50%' }}
              >
                <button
                  title="Siguiente"
                  className={`${styles.formButton} ${styles.formButtonTicket}`}
                  id={styles.regTicket}
                >
                  Registrar Ticket
                </button>

                <button
                  tittle="Cancelar"
                  className={`${styles.formButton} ${styles.formButtonTicket}`}
                  id={styles.cancelButtonTicket}
                >
                  <Link href="/home" className={`${styles.cancelButton}`}>
                    Cancelar
                  </Link>
                </button>
              </span>
            )}
          </form>
        ) : (
          <h1>loading...</h1>
        )}
        {ticketCreated.isCreated && (
          <p style={{ textAlign: 'center' }}>
            Puede registrar hasta {4 - solicitudCreated.cantidad} solicitudes
            diferentes para el ticket <b>#{ticketCreated.response.id_ticket}</b>
            <br /> Si ya no desea añadir más, de clic en el botón de{' '}
            <b>CANCELAR</b> {`(❌)`}
          </p>
        )}
        {ticketCreated.isCreated && (
          <form
            id="formSolicitud"
            onSubmit={handleSubmitSolic}
            className={styles['form-default']}
          >
            <h2 className={styles.numberReg}>{solicitudCreated.cantidad}</h2>
            <span style={{ gridColumn: '1/-1' }}>
              {/* <CustomInput
                typeInput="text"
                nameInput="descripcion"
                valueInput={stateSolicitud.descripcion}
                onChange={handleChangeSol}
                nameLabel="Detalle su solicitud"
                required={true}
              /> */}
              <span className={styles['input-container']}>
                <textarea
                  name="descripcion"
                  onChange={handleChangeSol}
                  defaultValue={stateSolicitud.descripcion}
                  cols="30"
                  rows="4"
                  className={styles.textArea}
                  required
                  disabled={!showButtonSol ? true : false}
                ></textarea>
                <label className={styles['activate-label-position']}>
                  Detalle su Solicitud
                </label>
              </span>
            </span>
            <CustomInput
              typeInput="text"
              nameInput="capturas"
              valueInput={stateSolicitud.capturas}
              onChange={handleChangeSol}
              placeholder="Puede subir capturas de pantalla o imagenes para respaldar su explicación"
              nameLabel="Capturas"
              disabled={!showButtonSol ? true : false}
            />

            <span className={styles.buttonContainer}>
              {showButtonSol && (
                <button
                  title="Crear Solicitud"
                  className={styles['formButton']}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ scale: '0.6' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                    />
                  </svg>
                </button>
              )}

              <button
                title="Cancelar"
                className={`${styles.formButton}`}
                id="cancelButton"
              >
                <Link href="/home" className={`${styles.cancelButton}`}>
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
        )}
        {solicitudCreated.isCreated && (
          <button
            onClick={addSolicitud}
            className={`${styles.formButton} ${styles.formButtonShow} ${styles.formButtonAddSol}`}
          >
            Agregar solicitud adicional para este Ticket#
            {ticketCreated.response.id_ticket}
          </button>
        )}
        <div className={styles.resumenSolicitudes}>
          {dataTicket.length > 0 && <h4>Solicitudes Ingresadas</h4>}
          {dataTicket &&
            dataTicket.map((solicitud) => {
              return (
                <span>
                  <b>{solicitud.id_solicitud}</b>
                  <p>{solicitud.descripcion}</p>
                </span>
              );
            })}
        </div>
      </div>
      {error && statusError !== 400 && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </>
  );
};

export default newregister;
