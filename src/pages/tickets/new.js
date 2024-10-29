'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import CustomInput from '../../components/CustomInput';
import ErrorLayout from '../../components/ErrorLayout';
import useApiTickets from '../../hooks/useApiTickets';
import useApiCategory from '../../hooks/useApiCategory';
import { validateExpToken } from '../../utils/helpers';
import FileTickets from '@/components/FileTickets';

import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const Newregister = () => {
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

  const { getCategory, dataCateg } = useApiCategory();

  // const idSearch = nextRouter.query.id_ticket; //Para verificar el string param de id_ticket y saber si estoy creando o editando un registro
  const ruta = usePathname();

  const initialState = {
    descrip_tk: '',
    id_tipo: '',
  };

  const initialStateSolic = {
    descripcion: '',
    capturas: {
      file1: { name: '', url: '', type: '', size: '' },
      file2: { name: '', url: '', type: '', size: '' },
      file3: { name: '', url: '', type: '', size: '' },
      file4: { name: '', url: '', type: '', size: '' },
    },
  };
  const [valueState, setValueState] = useState(initialState);
  const [stateSolicitud, setStateSolicitud] = useState(initialStateSolic);
  const [ticketCreated, setTicketCreated] = useState({ isCreated: false });
  const [solicitudCreated, setSolicitudCreated] = useState({
    isCreated: false,
    cantidad: 1,
  });
  const [showButtonSol, setShowButtonSol] = useState(true);
  //Estados para control de archivos e imágenes
  const [resetUpFiles, setResetUpFiles] = useState(false);
  //Para control de módales para cada archivo (máximo 4)
  const [showModalFile1, setShowModalFile1] = useState({
    name: 'file1',
    active: false,
  });
  const [showModalFile2, setShowModalFile2] = useState({
    name: 'file2',
    active: false,
  });
  const [showModalFile3, setShowModalFile3] = useState({
    name: 'file3',
    active: false,
  });
  const [showModalFile4, setShowModalFile4] = useState({
    name: 'file4',
    active: false,
  });

  const [disableReturn, setDisableReturn] = useState(false);

  useEffect(() => {
    // getDataTicket();
    validateExpToken();
    getCategory();
  }, [ruta]);

  console.log({ dataCateg });

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

  //Controla el change para la infomación principal del ticket
  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };
  //Controla el change para la información de la solicitud
  const handleChangeSol = (e) => {
    setStateSolicitud({ ...stateSolicitud, [e.target.name]: e.target.value });
  };

  //Submit para crear el ticket en MTR_TICKETS
  const handleSubmit = (e) => {
    e.preventDefault();
    postTickets(valueState)
      .then((response) => {
        console.log(response);
        setTicketCreated({ isCreated: true, response });
        setDisableReturn(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  //Submit para crear la(s) solicitud en DET_TICKETS para cada ticket
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
        setDisableReturn(false);
      })
      .catch((error) => {
        console.error(error);
      });

    if (solicitudCreated.cantidad === 3) {
      router.push('/home');
      toast.success(
        'Ha ingresado el máximo de solicitudes para este ticket, para ingresar más, por favor registrar un nuevo ticket. Puede monitorear el proceso de atención ingresando a la opción de "Seguimiento"',
        { duration: 7000 }
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
    setResetUpFiles(true);
    setShowButtonSol(true);
  };

  //Para controlar el input select de categorías
  const handleChangeSelect = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  console.log({ stateTicket: valueState });
  console.log({ stateSolicitud: stateSolicitud });
  console.log(ticketCreated);
  console.log(solicitudCreated);

  return (
    <>
      <div className={stylesEmp.crudEmpContainer}>
        <h2>Ingresando Nuevo ticket</h2>
        <form
          id="form"
          onSubmit={handleSubmit}
          className={styles['form-default']}
        >
          <span className={stylesEmp.gridMtrTicket}>
            <span className={styles.selectContainer}>
              {/* <b>* Categoría Soporte:</b> */}
              <select name="id_tipo" onChange={handleChangeSelect} required>
                {valueState.id_tipo ? (
                  <option value={valueState.id_tipo}>
                    {dataCateg
                      .filter(
                        (catSelect) => catSelect.id_cat === valueState.id_tipo
                      )
                      .map((category) => category.descrip)}
                  </option>
                ) : (
                  <option value="" label="Categoría Soporte">
                    Categ. Soporte
                  </option>
                )}
                {dataCateg.map((category) => {
                  if (category.estatus) {
                    return (
                      <option key={category.id_cat} value={category.id_cat}>
                        {category.descrip}
                      </option>
                    );
                  }
                })}
              </select>
            </span>
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
              style={{ gap: '4px', width: '80%' }}
            >
              <button
                title="Registrar"
                className={`${styles.formButton} ${styles.formButtonTicket}`}
                id={styles.regTicket}
              >
                Registrar Ticket
              </button>

              <button
                tittle="Cancelar"
                type="button"
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

        {ticketCreated.isCreated && (
          <p style={{ textAlign: 'center', fontSize: '13px' }}>
            {`Puede registrar hasta ${
              4 - solicitudCreated.cantidad
            } solicitud(es)
            diferente(s) para el ticket`}{' '}
            <b>#{ticketCreated.response.id_ticket}</b>
            <br /> Si ya no desea añadir más, de clic en el botón de{' '}
            <b>CANCELAR</b> {`(❌)`}
          </p>
        )}
        {solicitudCreated.isCreated && (
          <button
            onClick={addSolicitud}
            className={`${styles.formButton} ${styles.formButtonShow} ${styles.formButtonAddSol}`}
          >
            Agregar solicitud adicional para este Ticket #
            {ticketCreated.response.id_ticket}
          </button>
        )}
        {ticketCreated.isCreated && (
          <form
            id="formSolicitud"
            onSubmit={handleSubmitSolic}
            className={styles['form-default']}
            style={{ gridTemplateColumns: '5% 1fr 10%' }}
          >
            <h2 className={styles.numberReg}>{solicitudCreated.cantidad}</h2>
            <span
              className={styles.buttonContainer}
              style={{ gridRow: '2 span', gridColumn: '1 span' }}
            >
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

              {!disableReturn && (
                <button
                  title="Cancelar"
                  className={`${styles.formButton}`}
                  id="cancelButton"
                  style={{ background: 'white' }}
                >
                  <Link href="/home" className={`${styles.cancelButton}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      style={{ color: '#e43b3b' }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </Link>
                </button>
              )}
            </span>
            <span style={{ gridColumn: '2 span' }}>
              <span className={styles['input-container']}>
                <textarea
                  name="descripcion"
                  onChange={handleChangeSol}
                  defaultValue={stateSolicitud.descripcion}
                  cols="30"
                  rows="5"
                  className={styles.textArea}
                  required
                  disabled={!showButtonSol ? true : false}
                ></textarea>
                <label className={styles['activate-label-position']}>
                  Detalle su Solicitud
                </label>
              </span>
            </span>
            <span
              style={{
                gridColumn: '1/-1',
                display: 'grid',
                gridTemplateColumns: '50% 50%',
              }}
            >
              <h5
                style={{
                  gridColumn: '1/-1',
                  textAlign: 'center',
                  margin: '4px 0',
                  borderBottom: '#ffc870',
                }}
              >
                Puede subir capturas de pantalla / imágenes o archivos para
                respaldar su explicación.
              </h5>
              <span
                onClick={() => {
                  setShowModalFile1({
                    ...showModalFile1,
                    active: !showModalFile1.active,
                  });
                }}
                className={styles.addFiles}
              >
                {stateSolicitud.capturas.file1.url && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                    style={{ color: 'rgb(66, 167, 96)' }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                    />
                  </svg>
                )}
                {`Archivo 1: ${stateSolicitud.capturas.file1.name}`}
              </span>
              {showModalFile1.active && (
                <FileTickets
                  setStateSolicitud={setStateSolicitud}
                  stateSolicitud={stateSolicitud}
                  idFile="file1"
                  idTicket={ticketCreated.response.id_ticket}
                  reset={resetUpFiles}
                  setReset={setResetUpFiles}
                  showModal={showModalFile1}
                  setShowModalFile={setShowModalFile1}
                />
              )}
              <span
                onClick={() => {
                  setShowModalFile2({
                    ...showModalFile2,
                    active: !showModalFile2.active,
                  });
                }}
                className={styles.addFiles}
              >
                {stateSolicitud.capturas.file2.url && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                    style={{ color: 'rgb(66, 167, 96)' }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                    />
                  </svg>
                )}
                {`Archivo 2: ${stateSolicitud.capturas.file2.name}`}
              </span>
              {showModalFile2.active && (
                <FileTickets
                  setStateSolicitud={setStateSolicitud}
                  stateSolicitud={stateSolicitud}
                  idFile="file2"
                  idTicket={ticketCreated.response.id_ticket}
                  reset={resetUpFiles}
                  setReset={setResetUpFiles}
                  showModal={showModalFile2}
                  setShowModalFile={setShowModalFile2}
                />
              )}
              <span
                onClick={() => {
                  setShowModalFile3({
                    ...showModalFile3,
                    active: !showModalFile3.active,
                  });
                }}
                className={styles.addFiles}
              >
                {stateSolicitud.capturas.file3.url && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                    style={{ color: 'rgb(66, 167, 96)' }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                    />
                  </svg>
                )}
                {`Archivo 3: ${stateSolicitud.capturas.file3.name}`}
              </span>
              {showModalFile3.active && (
                <FileTickets
                  setStateSolicitud={setStateSolicitud}
                  stateSolicitud={stateSolicitud}
                  idFile="file3"
                  idTicket={ticketCreated.response.id_ticket}
                  reset={resetUpFiles}
                  setReset={setResetUpFiles}
                  showModal={showModalFile3}
                  setShowModalFile={setShowModalFile3}
                />
              )}
              <span
                onClick={() => {
                  setShowModalFile4({
                    ...showModalFile4,
                    active: !showModalFile4.active,
                  });
                }}
                className={styles.addFiles}
              >
                {stateSolicitud.capturas.file4.url && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                    style={{ color: 'rgb(66, 167, 96)' }}
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12"
                    />
                  </svg>
                )}
                {`Archivo 4: ${stateSolicitud.capturas.file4.name}`}
              </span>
              {showModalFile4.active && (
                <FileTickets
                  setStateSolicitud={setStateSolicitud}
                  stateSolicitud={stateSolicitud}
                  idFile="file4"
                  idTicket={ticketCreated.response.id_ticket}
                  reset={resetUpFiles}
                  setReset={setResetUpFiles}
                  showModal={showModalFile4}
                  setShowModalFile={setShowModalFile4}
                />
              )}
            </span>
          </form>
        )}
        <div className={styles.resumenSolicitudes}>
          {dataTicket.length > 0 && <h4>Solicitudes Ingresadas</h4>}
          {dataTicket &&
            dataTicket.map((solicitud) => {
              return (
                <span key={solicitud.id_solicitud}>
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

export default Newregister;
