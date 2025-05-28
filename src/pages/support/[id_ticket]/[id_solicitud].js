'use client';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '@/components/CustomInput';
import ErrorLayout from '@/components/ErrorLayout';
import Timer from '@/components/Timer';
import useApiTickets from '@/hooks/useApiTickets';
import FileDownload from '@/components/FileDownload';
import { validateExpToken } from '@/utils/helpers';
import { timeFormat } from '../../../utils/helpers';
import { toast } from 'react-hot-toast';
import styles from '@/styles/forms.module.css';
import stylesEmp from '@/styles/emp.module.css';

const Newregister = () => {
  const {
    updateTicket,
    getTicketSolic,
    updateSolicitud,
    postControl,
    getOnlySolicitud,
    error,
    statusError,
    messageError,
  } = useApiTickets();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro de firebase)
  const idTicketSearch = nextRouter.query.id_ticket; //Para verificar el string param de id_ticket y saber si estoy creando o editando un registro
  const idSolicSearch = nextRouter.query.id_solicitud; //Para verificar el string param de id_ticket y saber si estoy creando o editando un registro
  console.log(`id_ticket y solicitud: ${idTicketSearch} - ${idSolicSearch}`);
  const ruta = usePathname();

  const initialState = {
    descripcion: '',
    modulo: undefined,
    id_categ_supuesta: undefined,
    id_categ_final: undefined,
    capturas: {
      file1: { name: '', url: '', type: '', size: '' },
      file2: { name: '', url: '', type: '', size: '' },
      file3: { name: '', url: '', type: '', size: '' },
      file4: { name: '', url: '', type: '', size: '' },
    },
    agente_asig: '',
    fecha_ini_solucion: undefined,
    fecha_fin_solucion: undefined,
    solucion: '',
    estatus: '',
    isError: false,
    detError: '',
    mtr_tickets: { personal_emp: { empresa: {} } },
    control_tickets: [],
  };
  const [valueState, setValueState] = useState(initialState);

  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });
  const [showSolucion, setShowSolucion] = useState(false);
  const [payloadJWT, setPayloadJWT] = useState({});

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

  const [disableReturn, setDisableReturn] = useState(false); //Desahilita el botón de retorno/cancelar al momento de crear una solicitud
  const [isSaving, setIsSaving] = useState(false); // Estado para verificar si se está guardando
  const [blockSaveFormSolic, setBlockSaveFormSolic] = useState(false); //Desabilita el botón de "Guardar solicitud final" por si se demora el envío del correo y no se vuelva a dar clic

  useEffect(() => {
    getDataTicket();
    validateExpToken();
  }, [ruta]);

  //Este Effect controla la pestaña para no cerrarla directamente y muestre una advertencia si no se ha guardado la información
  useEffect(() => {
    // Definir la función de advertencia para el evento
    const handleBeforeUnload = (event) => {
      if (isSaving) {
        console.log(event);
        event.preventDefault();
        event.returnValue = ''; // Necesario para algunos navegadores
        toast.error(
          'DEBE PAUSAR O FINALIZAR LA ATENCIÓN PARA ESTA SOLICITUD ANTES DE CERRAR ESTA VENTANA',
          {
            duration: 10000,
            position: 'bottom-center',
            style: {
              borderRadius: '10px',
              background: '#333',
              color: '#fff',
            },
          }
        );
      }
    };

    // Agregar el evento cuando `isSaving` es true
    if (isSaving) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    // Eliminar el evento cuando `isSaving` es false o cuando el componente se desmonte
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSaving]); // Ejecutar este efecto cuando cambie `isSaving`

  const getDataTicket = () => {
    setLoadCreate({ loading: true, error: null });
    const payloadLS = localStorage.getItem('payload');
    setPayloadJWT(payloadLS && JSON.parse(payloadLS));
    //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
    const response = getTicketSolic(idTicketSearch, idSolicSearch);
    response
      .then((data) => {
        console.log({ dataGetApi: data });
        //solo extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
        //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de detalle de tickets, no envio las PK no se debe topar ese campo en update.
        const dataEdit = {
          descripcion: data[0].descripcion,
          modulo: data[0].modulo === null ? undefined : data[0].modulo,
          id_categ_supuesta:
            data[0].id_categ_supuesta === null
              ? undefined
              : data[0].id_categ_supuesta,
          id_categ_final:
            data[0].id_categ_final === null
              ? undefined
              : data[0].id_categ_final,
          capturas:
            data[0].capturas === null
              ? initialState.capturas
              : data[0].capturas,
          agente_asig: data[0].agente_asig,
          fecha_ini_solucion:
            data[0].fecha_ini_solucion === null
              ? undefined
              : moment(data[0].fecha_ini_solucion).format(
                  'YYYY-MM-DDTkk:mm:ss'
                ),
          fecha_fin_solucion:
            data[0].fecha_fin_solucion === null
              ? undefined
              : moment(data[0].fecha_fin_solucion).format(
                  'YYYY-MM-DDTkk:mm:ss'
                ),
          solucion: data[0].solucion === null ? undefined : data[0].solucion,
          isError: data[0].isError,
          detError: data[0].detError === null ? undefined : data[0].detError,
          estatus: data[0].estatus,
          mtr_tickets: data[0].mtr_tickets,
          control_tickets:
            data[0].control_tickets === null
              ? undefined
              : data[0].control_tickets,
        };
        setValueState(dataEdit);
        setLoadCreate({ loading: false, error: null });
      })
      .catch((error) => {
        console.log(error);
        setLoadCreate({ loading: false, error: error });
      });
  };

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
    setIsSaving(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setBlockSaveFormSolic(true); //Bloquea el botón que guadar la solicitud una vez se activo el submit
    //*El tercer parámetro (false) se usa en la pantalla de asignación de ticket a agente, por eso coloco en false (Porque aquí no estoy asignando agente, ya está asignado a la solicitud)
    //*El último parámetro (true) es para que se redireccione a la pantalla anterior una vez actualizado
    //*No son parámetros obligatorios, pero en este caso si requiero enviar el último parámetro para el redireccionamiento
    //*El último objeto es para enviar el correo de solicitud finalizada, ya que este submit solo se realizará al finalizar la atención de la solicitud
    updateSolicitud(
      idTicketSearch,
      idSolicSearch,
      {
        solucion: valueState.solucion,
        isError: valueState.isError,
        detError: valueState.detError,
      },
      false,
      true,
      {
        email: valueState.mtr_tickets.personal_emp.correo,
        nameAgente: payloadJWT.nameAgSop,
        estatus: 3,
        descripSolic: valueState.descripcion,
        detSolucion: valueState.solucion,
      }
    );
  };

  //TODO|Esta función bloqueará el botón para cerrar la ventana de atención mientras este en ejecución el Timer
  //*Se la envía como parametro del Timer
  const blockButton = (block) => {
    document.getElementById('returnButton').disabled = block;
    setDisableReturn(block);
  };

  console.log({ stateCompon: valueState });

  return (
    <>
      <div
        className={`${stylesEmp.crudEmpContainer} notranslate`}
        style={{ position: 'relative' }}
      >
        <h2>
          {`Ticket # ${idTicketSearch}-${idSolicSearch}`}
          <i> {`[Estado: ${valueState.estatus}]`}</i>
        </h2>
        {loadCreate.loading === false ? (
          <form
            id="form"
            onSubmit={handleSubmit}
            className={styles['form-default']}
          >
            <fieldset className={`${styles.fieldSetCustom}`}>
              <legend>Datos Ticket</legend>
              <CustomInput
                typeInput="text"
                nameInput="nombre_emp"
                valueInput={
                  valueState.mtr_tickets.personal_emp.empresa.nombre_emp
                }
                onChange={handleChange}
                nameLabel="Empresa"
                disabled={true}
              />
              <CustomInput
                typeInput="text"
                nameInput="nombre"
                valueInput={valueState.mtr_tickets.personal_emp.nombre}
                onChange={handleChange}
                nameLabel="Solicitante"
                disabled={true}
              />

              <CustomInput
                typeInput="text"
                nameInput="fecha_reg"
                valueInput={
                  valueState.mtr_tickets.fecha_reg &&
                  moment(valueState.mtr_tickets.fecha_reg).format(
                    'DD/MM/YYYY - kk:mm:ss'
                  )
                }
                onChange={handleChange}
                nameLabel="Fecha de Registro"
                disabled={true}
              />
              <span style={{ gridColumn: '1/-1' }}>
                <CustomInput
                  typeInput="text"
                  nameInput="descrip_tk"
                  valueInput={valueState.mtr_tickets.descrip_tk}
                  onChange={handleChange}
                  nameLabel="Descripción General de Ticket"
                  disabled={true}
                />
              </span>
            </fieldset>
            <fieldset className={`${styles.fieldSetCustom}`}>
              <legend>Datos Contacto</legend>
              <CustomInput
                typeInput="text"
                nameInput="correo"
                valueInput={valueState.mtr_tickets.personal_emp.correo}
                onChange={handleChange}
                nameLabel="Correo"
                disabled={true}
              />
              <CustomInput
                typeInput="text"
                nameInput="telf1"
                valueInput={valueState.mtr_tickets.personal_emp.telf1}
                onChange={handleChange}
                nameLabel="Teléfono 1"
                disabled={true}
              />
              {valueState.mtr_tickets.personal_emp.telf2 !== null && (
                <CustomInput
                  typeInput="text"
                  nameInput="telf2"
                  valueInput={valueState.mtr_tickets.personal_emp.telf2}
                  onChange={handleChange}
                  nameLabel="Teléfono 2"
                  disabled={true}
                />
              )}
            </fieldset>
            <fieldset className={`${styles.fieldSetCustom}`}>
              <legend>Atención / Soporte</legend>
              <span
                className={`${styles.inputContainer1_1} ${styles.inputContainer1_1v} ${styles.inputContainer1_1Atention}`}
              >
                <span className={styles['input-container']}>
                  <textarea
                    name="descripcion"
                    onChange={handleChange}
                    defaultValue={valueState.descripcion}
                    cols="30"
                    rows="6"
                    className={styles.textArea}
                    disabled={true}
                  ></textarea>
                  <label className={styles['activate-label-position']}>
                    Solicitud del Cliente
                  </label>
                </span>
                <span className={styles.inputContainer1_1AtentionDates}>
                  <CustomInput
                    typeInput="text"
                    nameInput="fecha_ini_solucion"
                    valueInput={
                      valueState.fecha_ini_solucion &&
                      moment(valueState.fecha_ini_solucion).format(
                        'DD/MM/YYYY - kk:mm:ss'
                      )
                    }
                    onChange={handleChange}
                    nameLabel="F. Inicio"
                    disabled={true}
                  />
                  <CustomInput
                    typeInput="text"
                    nameInput="fecha_fin_solucion"
                    valueInput={
                      valueState.fecha_fin_solucion &&
                      moment(valueState.fecha_fin_solucion).format(
                        'DD/MM/YYYY - kk:mm:ss'
                      )
                    }
                    onChange={handleChange}
                    nameLabel="F. Final"
                    disabled={true}
                  />
                </span>
              </span>
              <Timer
                idTicket={idTicketSearch}
                idSolicitud={idSolicSearch}
                updateMtrTicket={updateTicket} //*Actualiza estado del TICKET y fechas de inicio y fin en Timer
                updateSolicitud={updateSolicitud} //*Actualiza estado de la SOLICITUD y fechas de inicio y fin en Timer
                postControl={postControl}
                getDataTicket={getDataTicket}
                getTicketSolic={getTicketSolic}
                getOnlySolicitud={getOnlySolicitud}
                showSolucion={setShowSolucion} //*Cambio el state para mostar el modal de solución
                modalSolution={showSolucion} //*Muestra el modal de solución true/false
                setValueState={setValueState} //*Para poder usar el handleChance en el Timer que ahora tiene el ingreso de la solución
                data={valueState}
                payloadJwt={payloadJWT}
                blockButton={blockButton} //Función que bloquea el botón de cerrar pantalla mientras se ejecuta el Timer
                setIsSaving={setIsSaving} //Función que bloquea pestaña para que se cierre mientras esta el Timer ejecutandose
                blockSaveFormSolic={blockSaveFormSolic} //Bloquea el botón de guardar solicitud despues de que se pulse para guardar.
              />
              <span
                style={{
                  gridColumn: '2 span',
                  width: '90%',
                  margin: '0 auto',
                  display: 'grid',
                  gridTemplateColumns: '50% 50%',
                  alignSelf: 'flex-start',
                }}
              >
                <h5
                  style={{
                    gridColumn: '1/-1',
                    textAlign: 'center',
                    margin: '8px 0',
                    borderBottom: '#ffc870',
                  }}
                >
                  Capturas de pantalla / imágenes o archivos de la solicitud.
                </h5>
                {valueState.capturas.file1.url && (
                  <span
                    onClick={() => {
                      setShowModalFile1({
                        ...showModalFile1,
                        active: !showModalFile1.active,
                      });
                    }}
                    className={styles.addFiles}
                  >
                    {valueState.capturas.file1.url && (
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
                    <i>{`A1: ${valueState.capturas.file1.name}`}</i>
                  </span>
                )}
                {showModalFile1.active && (
                  <FileDownload
                    idFile="file1"
                    stateSolicitud={valueState}
                    idTicket={valueState.id_ticket}
                    showModal={showModalFile1}
                    setShowModalFile={setShowModalFile1}
                  />
                )}
                {valueState.capturas.file2.url && (
                  <span
                    onClick={() => {
                      setShowModalFile2({
                        ...showModalFile2,
                        active: !showModalFile2.active,
                      });
                    }}
                    className={styles.addFiles}
                  >
                    {valueState.capturas.file2.url && (
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
                    <i>{`A2: ${valueState.capturas.file2.name}`}</i>
                  </span>
                )}
                {showModalFile2.active && (
                  <FileDownload
                    idFile="file2"
                    stateSolicitud={valueState}
                    idTicket={valueState.id_ticket}
                    showModal={showModalFile2}
                    setShowModalFile={setShowModalFile2}
                  />
                )}
                {valueState.capturas.file3.url && (
                  <span
                    onClick={() => {
                      setShowModalFile3({
                        ...showModalFile3,
                        active: !showModalFile3.active,
                      });
                    }}
                    className={styles.addFiles}
                  >
                    {valueState.capturas.file3.url && (
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
                    {`A3: ${valueState.capturas.file3.name}`}
                  </span>
                )}
                {showModalFile3.active && (
                  <FileDownload
                    idFile="file3"
                    stateSolicitud={valueState}
                    idTicket={valueState.id_ticket}
                    showModal={showModalFile3}
                    setShowModalFile={setShowModalFile3}
                  />
                )}
                {valueState.capturas.file4.url && (
                  <span
                    onClick={() => {
                      setShowModalFile4({
                        ...showModalFile4,
                        active: !showModalFile4.active,
                      });
                    }}
                    className={styles.addFiles}
                  >
                    {valueState.capturas.file4.url && (
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
                    {`A4: ${valueState.capturas.file4.name}`}
                  </span>
                )}
                {showModalFile4.active && (
                  <FileDownload
                    idFile="file4"
                    stateSolicitud={valueState}
                    idTicket={valueState.id_ticket}
                    showModal={showModalFile4}
                    setShowModalFile={setShowModalFile4}
                  />
                )}
              </span>
            </fieldset>
            {valueState.control_tickets && (
              <fieldset
                className={`${styles.fieldSetCustom} ${styles.fieldSetControls}`}
                style={{ height: '40vh', overflow: 'auto' }}
              >
                <legend>
                  Historial de control de tiempos para la solicitud
                </legend>
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    margin: '8px',
                    padding: '4px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    border: '1px solid #444a8d',
                    fontSize: '1.2em',
                  }}
                >
                  <h4>Tiempo Total:</h4>
                  <b style={{ color: '#444a8d' }}>
                    {timeFormat(
                      valueState.control_tickets.reduce(
                        (acumulador, control) => {
                          return (
                            acumulador + Number(control.tiempo_calc * 1000)
                          );
                        },
                        0
                      )
                    )}
                  </b>
                </div>
                <table className={styles.controlsTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha / Hora Inicio</th>
                      <th>Fecha / Hora Fin</th>
                      <th>Tiempo transcurrido</th>
                      <th>Motivo Pausa/Reasig.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valueState.control_tickets.map((control, index) => {
                      return (
                        <tr key={control.id_control}>
                          <td>
                            <strong>{index + 1}</strong>
                          </td>
                          <td>{`${moment(control.fecha_ini_atencion).format(
                            'DD-MM-YYYY'
                          )} | ${control.hora_ini_atencion}`}</td>
                          <td>{`${moment(control.fecha_fin_atencion).format(
                            'DD-MM-YYYY'
                          )} | ${control.hora_fin_atencion}`}</td>
                          <td>{timeFormat(control.tiempo_calc * 1000)}</td>
                          <td>{control.motivo_reasig_pausa}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </fieldset>
            )}

            <span className={styles.buttonContainer}>
              <button
                title="Regresar"
                className={`${styles.formButton}`}
                id="returnButton"
              >
                {!disableReturn ? (
                  <Link
                    href="/support/allTicketsAsign"
                    className={`${styles.cancelButton}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </Link>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                )}
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
