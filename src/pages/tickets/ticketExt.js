'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import CustomInput from '../../components/CustomInput';
import ErrorLayout from '../../components/ErrorLayout';
import useApiTickets from '../../hooks/useApiTickets';
import useApiCategory from '../../hooks/useApiCategory';
import useApiEmpresas from '@/hooks/useApiEmpresas';
import { validateExpToken, timeFormat } from '../../utils/helpers';
import FileTickets from '@/components/FileTickets';

import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const Newregister = () => {
  const router = useRouter();
  const {
    postTickets,
    updateTicket,
    postSolicitud,
    getOnlySolicitud,
    postControl,
    dataTicket,
    error,
    statusError,
    messageError,
  } = useApiTickets();

  const { getCategory, dataCateg } = useApiCategory();
  const { getEmpresas, dataEmp } = useApiEmpresas();

  // const idSearch = nextRouter.query.id_ticket; //Para verificar el string param de id_ticket y saber si estoy creando o editando un registro
  const ruta = usePathname();

  //TODO: Estado inicial para el ticket en la tabla MTR_TICKETS
  const initialState = {
    id_emp: '',
    id_cliente: '',
    fecha_reg: '',
    descrip_tk: '',
    id_tipo: '',
  };
  //TODO: Estado inicial para la solicitud en la tabla DET_TICKETS, por defecto se crea con el estado "asignado"
  const initialStateSolic = {
    fecha_ini_solucion: null,
    fecha_fin_solucion: null,
    descripcion: '',
    estatus: 'asignado',
    agente_asig: '',
    solucion: undefined,
    capturas: {
      file1: { name: '', url: '', type: '', size: '' },
      file2: { name: '', url: '', type: '', size: '' },
      file3: { name: '', url: '', type: '', size: '' },
      file4: { name: '', url: '', type: '', size: '' },
    },
  };
  const [valueState, setValueState] = useState(initialState); //Estado final del Ticket
  const [stateSolicitud, setStateSolicitud] = useState(initialStateSolic); //Estado final de la Solicitud
  const [ticketCreated, setTicketCreated] = useState({ isCreated: false }); //*Verifica si se creo el ticket en la tabla
  const [solicitudCreated, setSolicitudCreated] = useState({
    isCreated: false,
    cantidad: 1,
  }); //*Verifica si ya se creo la solicitud y colocar la cantidad de solicitudes en el Ticket
  const [perfil, setPerfil] = useState('');
  const [personalEmp, setPersonalEmp] = useState([]); //*Almacenará el personal de la empresa al elegir una empresa
  const [showButtonSol, setShowButtonSol] = useState(true); //Para mostrar el botón de añadir solicitud
  //TODO:Estados para control de archivos e imágenes
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

  const [disableReturn, setDisableReturn] = useState(false); //*Desahilita el botón de retorno/cancelar al momento de crear una solicitud
  const [isSaving, setIsSaving] = useState(false); // Estado para verificar si se está guardando e impedir que cierren la pestaña
  const [showSolucion, setShowSolucion] = useState(false); //*Para mostrar si se finalizará la solicitud al momento de ingresarla
  const [dateTimeIniTicket, setDateTimeIniTicket] = useState(''); //*Para controlar la fecha min cuando se vaya a ingresar la fecha inicial de la solución
  const [dateTimeIniSol, setDateTimeIniSol] = useState(''); //*Para controlar la fecha min cuando se vaya a ingresar la fecha final de la solución
  const [errorDate, setErrorDate] = useState({
    errorInicio: false,
    errorFin: false,
  }); //*Controlará el error de fechas si no pasa la validación
  const [tiempoTotal, setTiempoTotal] = useState(0); //El tiempo del soporte en segundos cuando se ingresa una solicitud que se debe finalizar en ese momento.

  useEffect(() => {
    validateExpToken();
    getCategory();
    const payloadStorage =
      localStorage.getItem('payload') &&
      JSON.parse(localStorage.getItem('payload'));
    getEmpresas();
    setPerfil(payloadStorage.perfil);
    setStateSolicitud({ ...stateSolicitud, agente_asig: payloadStorage.agSop }); //?Al cargar el estado ya asigna el agente desde el token
  }, [ruta]);

  //TODO:Este Effect controla la pestaña para no cerrarla directamente y muestre una advertencia si no se ha guardado la información
  useEffect(() => {
    // Definir la función de advertencia para el evento
    const handleBeforeUnload = (event) => {
      if (isSaving) {
        console.log(event);
        event.preventDefault();
        event.returnValue = ''; // Necesario para algunos navegadores
        toast.error(
          'DEBE INGRESAR LA SOLICITUD PENDIENTE DANDO CLIC EN EL BOTÓN DE "CREAR SOLICITUD", (Si abandona la página sin subir la solicitud su ticket NO será atendido)',
          {
            duration: 9500,
            position: 'bottom-center',
          }
        );
      }
    };

    //*Agregar el evento cuando `isSaving` es true
    if (isSaving) {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    //*Eliminar el evento cuando `isSaving` es false o cuando el componente se desmonte
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isSaving]); //?Ejecutar este efecto cuando cambie `isSaving`

  //Controla el listado de selección de empresas.
  const handleChangeEmp = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
    //*Al elegir la empresa, se almacena el personal de la empresa elegida en este estado, para optimizar la busqueda
    setPersonalEmp(() => {
      return dataEmp.filter((empresa) => empresa.id_emp === e.target.value)[0]
        .personal_emp;
    });
    //*Cuando cambia de una empresa a otra despues de seleccionar un empleado, se vacia ese empleado seleccionado anteriormente
    //*Para evitar que se quede guardado el empleado de la empresa incorrecta.
    if (valueState.id_cliente) {
      setValueState({ ...valueState, id_cliente: '' });
    }
  };

  //Controla el listado de selección de personal despues de elegir una empresa.
  const handleChangePersonal = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

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
    setIsSaving(true);
  };

  //TODO:Submit para crear el ticket en MTR_TICKETS
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

  //TODO:Submit para crear la(s) solicitud en DET_TICKETS para el ticket previamente creado.
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
        //?Sí existe una fecha de finalización, despues de que se cree la solicitud, se crea el control respectivo
        //?Asi como el update para finalizar el ticket.
        if (stateSolicitud.fecha_fin_solucion) {
          const dataControl = {
            id_agente: response.agente_asig,
            fecha_ini_atencion: moment(
              new Date(response.fecha_ini_solucion)
            ).format('YYYY-MM-DD'),
            fecha_fin_atencion: moment(
              new Date(response.fecha_fin_solucion)
            ).format('YYYY-MM-DD'),
            hora_ini_atencion: moment(
              new Date(response.fecha_ini_solucion)
            ).format('kk:mm:ss'),
            hora_fin_atencion: moment(
              new Date(response.fecha_fin_solucion)
            ).format('kk:mm:ss'),
            tiempo_calc: Math.floor(tiempoTotal), //Tiempo en Segundos
            motivo_reasig_pausa: 'TK-EXTEMP', //Mensaje en el campo de motivo del control que indica que es un ticket extemporaneo
          };
          postControl(dataControl, response.id_ticket, response.id_solicitud)
            .then((response) => {
              console.log({ COntrolCreado: response });
              updateTicket(response.id_ticket, {
                fecha_ini_sop: stateSolicitud.fecha_ini_solucion,
                fecha_fin_sop: stateSolicitud.fecha_fin_solucion,
                tiempo_calc_sop: tiempoTotal,
                tiempo_real_sop: tiempoTotal,
                estatus: 'finalizado',
              });
            })
            .catch((error) => {
              console.error(error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
      });

    if (solicitudCreated.cantidad === 1) {
      router.push('/home');
      toast.success(
        'Ha ingresado el máximo de solicitudes para este ticket extemporaneo, para ingresar más, por favor registrar un nuevo ticket"',
        { duration: 5000 }
      );
    }
  };

  //TODO:Función que controla cuando se quiera añadir una solicitud adicional despues de guardar la anterior
  const addSolicitud = () => {
    let formS = document.getElementById('formSolicitud');
    formS.reset(); //Resetea el formulario con la info de la solicitud anterior
    setSolicitudCreated({
      ...solicitudCreated,
      cantidad: solicitudCreated.cantidad + 1,
      isCreated: false,
    });
    setStateSolicitud({
      ...initialStateSolic,
      agente_asig: solicitudCreated.response.agente_asig,
    });
    setResetUpFiles(true);
    setShowButtonSol(true);
    setIsSaving(true);
  };

  //Para controlar el input select de categorías
  const handleChangeSelect = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  //TODO:Función que controla cuando se quiera añadir la solución en la solicitud al momento de crearla
  const addSolucion = () => {
    setShowSolucion(!showSolucion);
    setDateTimeIniTicket(new Date(valueState.fecha_reg)); //Apenas se ejecuta la función se almacena la fecha de registro del ticket
    if (!showSolucion) {
      //*Cuando se despliega sección de solución, se coloca por defecto la fecha de inicio solución = a fecha registro ticket y estado de solicitud "finalizado"
      setStateSolicitud({
        ...stateSolicitud,
        fecha_ini_solucion: valueState.fecha_reg,
        estatus: 'finalizado',
      });
    } else {
      //*Si se quita la sección se coloca en nulo las fechas de la solicitud y el estado vuelve a "asignado"
      setStateSolicitud({
        ...stateSolicitud,
        fecha_ini_solucion: null,
        fecha_fin_solucion: null,
        estatus: 'asignado',
      });
      setDateTimeIniSol(''); //*Así como quitar nuevamente la fecha de inicio de solución, usada posteriormente para validación
    }
  };

  //TODO:Controla el change de la fecha de inicio de la solución de la solicitud
  const handleChangeDateBegin = (e) => {
    setStateSolicitud({ ...stateSolicitud, [e.target.name]: e.target.value });
    setIsSaving(true);

    const selectedDate = new Date(e.target.value);
    //?Se verifica la fecha/hora que se cambie que no sea anterior a la fecha de registro del ticket
    if (selectedDate < dateTimeIniTicket) {
      toast.error(
        `La fecha y hora deben ser posteriores a la fecha del registro del ticket: ${moment(
          dateTimeIniTicket
        ).format('DD/MM/YYYY - kk:mm:ss')}`,
        {
          duration: 5500,
          position: 'bottom-center',
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
            border: '1px solid #c92a2a',
          },
        }
      );
      //!Si da error se vuelve la fecha de inicio de solución a la fecha del ticket
      setStateSolicitud({
        ...stateSolicitud,
        [e.target.name]: valueState.fecha_reg,
      });
      setTiempoTotal(0); //Se resetea el tiempo total de soporte
      setErrorDate({ ...errorDate, errorInicio: true }); //Se activa el error de fecha de inicio
    } else {
      //*Si se corrige se desactiva el error y se guarda la fecha de inicio de solución para validar la fecha de fin posteriormente
      setErrorDate({ ...errorDate, errorInicio: false });
      setDateTimeIniSol(selectedDate);
      //?Si la fecha de fin existe y está OK, se realiza el calculo del tiempo de la solicitud,
      //?restando el valor registrado en el state de fecha_fin, menos la fecha de inicio digitada en el input
      if (stateSolicitud.fecha_fin_solucion) {
        setTiempoTotal(
          (new Date(stateSolicitud.fecha_fin_solucion) -
            new Date(e.target.value)) /
            1000
        );
        //!Si al existir una fecha de fin y digitar la fecha de inicio, esta es negativa, saldrá error
        //Significa que la fecha de inicio es anterior a la fecha de fin.
        if (
          new Date(stateSolicitud.fecha_fin_solucion) -
            new Date(e.target.value) <
          0
        ) {
          toast.error(
            'La fecha de inicio NO puede ser posterior a la fecha de finalización!!',
            {
              duration: 5500,
              position: 'bottom-center',
              style: {
                borderRadius: '8px',
                background: '#333',
                color: '#fff',
                border: '1px solid #c92a2a',
              },
            }
          );
          setTiempoTotal(0);
          setErrorDate({ ...errorDate, errorInicio: true });
        }
      }
    }
  };
  //TODO:Controla el change de la fecha de Fin de la solución de la solicitud
  const handleChangeDateEnd = (e) => {
    setStateSolicitud({ ...stateSolicitud, [e.target.name]: e.target.value });
    setIsSaving(true);

    const selectedDate = new Date(e.target.value);

    //?En el caso de que no se cambie la fecha de inicio de solución, se entiende que se quiere trabajar con la fecha de inicio del ticket
    //?Como fecha de inicio de solución, por ende esta fecha se coloca como estado de fecha de inicio de solución para la validación
    if (!dateTimeIniSol) {
      setDateTimeIniSol(new Date(valueState.fecha_reg));
    }

    if (selectedDate <= dateTimeIniSol) {
      toast.error(
        `La fecha y hora deben ser posteriores a la fecha de inicio de la solución: ${moment(
          dateTimeIniSol
        ).format('DD/MM/YYYY - kk:mm:ss')}`,
        {
          duration: 5500,
          position: 'bottom-center',
          style: {
            borderRadius: '8px',
            background: '#333',
            color: '#fff',
            border: '1px solid #c92a2a',
          },
        }
      );
      //!Si da error la fecha colocada como fecha de finalización, se colocará nula en el estado de la solicitud.
      setStateSolicitud({
        ...stateSolicitud,
        [e.target.name]: null,
      });
      setTiempoTotal(0); //Se resetea el tiempo total de soporte
      setErrorDate({ ...errorDate, errorFin: true });
    } else {
      setErrorDate({ ...errorDate, errorFin: false });
      //*Si la fecha de fin está OK, se realiza el calculo del tiempo de la solicitud, restando el valor ingresado en
      //*el input de la fecha_fin, menos la fecha de inicio registrada en el state de la solicitud
      setTiempoTotal(
        (new Date(e.target.value) -
          new Date(stateSolicitud.fecha_ini_solucion)) /
          1000
      );
    }
  };

  console.log({ stateTicket: valueState });
  console.log({ stateSolicitud: stateSolicitud });
  console.log(ticketCreated);
  console.log(solicitudCreated);
  console.log(perfil);

  return (
    <>
      <div className={`${stylesEmp.crudEmpContainer} notranslate`}>
        <h2>Ingresando Nuevo ticket</h2>
        <form
          id="form"
          onSubmit={handleSubmit}
          className={styles['form-default']}
        >
          <span
            className={stylesEmp.gridMtrTicket}
            style={{ gridTemplateColumns: '30% 70%' }}
          >
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
            <fieldset
              className={styles.fieldSetCustom}
              style={{ gridTemplateColumns: '1fr 1fr', gridColumn: '1 span' }}
            >
              <legend>Seleccionar cliente</legend>
              <span className={styles.selectContainer}>
                <strong>Empresa:</strong>
                <select name="id_emp" onChange={handleChangeEmp}>
                  {!valueState.id_emp && (
                    <option defaultValue="" label="Elegir Empresa:" selected>
                      Elegir Empresa
                    </option>
                  )}
                  {dataEmp.map((empresa) => {
                    if (empresa.estatus) {
                      return (
                        <option key={empresa.id_emp} value={empresa.id_emp}>
                          {empresa.nombre_emp}
                        </option>
                      );
                    }
                  })}
                </select>
              </span>

              <span className={styles.selectContainer}>
                <strong>Solicitante:</strong>
                <select name="id_cliente" onChange={handleChangePersonal}>
                  {!valueState.id_per && (
                    <option defaultValue="" label="Elegir Personal:" selected>
                      Elegir Personal
                    </option>
                  )}
                  {personalEmp.map((personal) => {
                    return (
                      <option key={personal.id_per} value={personal.id_per}>
                        {personal.nombre}
                      </option>
                    );
                  })}
                </select>
              </span>
            </fieldset>
            <CustomInput
              typeInput="datetime-local"
              nameInput="fecha_reg"
              placeholder="Fecha registro Ticket"
              valueInput={valueState.fecha_reg}
              onChange={handleChange}
              nameLabel="Fecha registro Ticket"
              required={true}
            />
            <CustomInput
              typeInput="text"
              nameInput="descrip_tk"
              valueInput={valueState.descrip_tk}
              onChange={handleChange}
              placeholder="Ingrese una BREVE descripción del motivo que requiere soporte para este ticket"
              nameLabel="Descripción General"
              maxlength="250"
              required={true}
            />
            <span
              style={{
                gridColumn: '1/-1',
                textAlign: 'right',
                color: '#9b2020',
                fontSize: '0.6em',
                fontWeight: 'bold',
                padding: '0 14px',
              }}
            >
              Máx. {250 - valueState.descrip_tk.length} <br />
              {valueState.descrip_tk.length >= 200 && (
                <span style={{ fontSize: '1.3em' }}>
                  El número máximo de caracteres para este campo es de 250,
                  recuerde que este campo solo es una descripción BREVE y
                  GENERAL para el ticket de soporte que está solicitando.
                  Despues de dar clic en el botón &quot;Registrar ticket&quot;
                  podrá detallar su solicitud o solicitudes para el ticket.{' '}
                  <br />
                  En estas solicitudes usted podrá detallar todo lo que desee
                  con la mayor explicación posible, donde incluso podrá cargar
                  archivos para respaldar su explicación.
                </span>
              )}
            </span>
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
                onClick={() => {
                  setIsSaving(true);
                }}
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
            {`Al tratarse de un ticket Extemporaneo, debe registrar 1 solicitud para el ticket`}{' '}
            <b>#{ticketCreated.response.id_ticket}</b>
            <br />
            {`Si desea que el ticket se finalice, debe ingresar las fechas y el motivo de la solución dando clic en el botón de "Ingresar solución para esta solicitud".
              Caso contrario, si crea la solicitud solo registrando su detalle, se le asignará el ticket de forma normal, para que después lo procese desde la opción "Solicitudes que se le han asignado" en la pantalla principal.`}
            {/* <b>Cancelar</b> {`(❌)`}  */}
            <br />
            <b
              style={{
                color: '#ffc870',
                borderBottom: '1px dotted #ffc870',
                padding: '2px',
              }}
            >
              NO OLVIDE SUBIR SU SOLICITUD DANDO CLIC EN EL BOTON DE &quot;⬆
              CREAR SOLICITUD&quot;
            </b>
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
              style={{ gridRow: '2 span', gridColumn: '1 span', width: '95%' }}
            >
              {showButtonSol &&
                !errorDate.errorInicio &&
                !errorDate.errorFin && (
                  <button
                    title="Crear Solicitud"
                    className={`${styles.formButton} ${styles.buttonCreateSolic}`}
                    onClick={() => {
                      setIsSaving(false);
                    }}
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
                    Crear Solicitud
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
                  Detalle de la Solicitud
                </label>
              </span>
              {showButtonSol && (
                <button
                  onClick={addSolucion}
                  type="button"
                  className={`${styles.formButton} ${styles.formButtonShow} ${styles.formButtonshowSolucion}`}
                  title="Ingresar datos para finalizar solicitud, fechas de inicio/final y solución"
                >
                  Ingresar solución para esta solicitud
                </button>
              )}
            </span>
            {showSolucion && (
              <span
                style={{
                  gridColumn: '3 span',
                  display: 'grid',
                  gridTemplateColumns: '30% 70%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <span>
                  <CustomInput
                    typeInput="datetime-local"
                    nameInput="fecha_ini_solucion"
                    placeholder="Fecha/hora Inicio Solución"
                    valueInput={
                      stateSolicitud.fecha_ini_solucion === null
                        ? ''
                        : stateSolicitud.fecha_ini_solucion
                    }
                    // onChange={handleChangeSol}
                    onChange={handleChangeDateBegin}
                    nameLabel="Fecha/hora Inicio Solución"
                    min={valueState.fecha_reg && valueState.fecha_reg}
                    required={showSolucion}
                    errorValidate={errorDate.errorInicio}
                  />
                  <CustomInput
                    typeInput="datetime-local"
                    nameInput="fecha_fin_solucion"
                    placeholder="Fecha/hora Final Solución"
                    valueInput={
                      stateSolicitud.fecha_fin_solucion === null
                        ? ''
                        : stateSolicitud.fecha_fin_solucion
                    }
                    onChange={handleChangeDateEnd}
                    nameLabel="Fecha/hora Final Solución"
                    min={
                      stateSolicitud.fecha_ini_solucion &&
                      stateSolicitud.fecha_ini_solucion
                    }
                    required={showSolucion}
                    errorValidate={errorDate.errorFin}
                  />
                  <span
                    style={{
                      textAlign: 'center',
                      color: '#444a8d',
                      margin: '0 10px',
                      width: '100%',
                    }}
                  >
                    <b>Tiempo Total: {timeFormat(tiempoTotal * 1000)}</b>
                  </span>
                </span>
                <span className={styles['input-container']}>
                  <textarea
                    name="solucion"
                    onChange={handleChangeSol}
                    defaultValue={stateSolicitud.solucion}
                    cols="30"
                    rows="7"
                    className={styles.textArea}
                    placeholder="Ingrese la solución para esta solicitud"
                    required={showSolucion}
                  ></textarea>
                  <label className={styles['activate-label-position']}>
                    Detalle de la Solución
                  </label>
                </span>
              </span>
            )}
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
