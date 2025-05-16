import React, { useState, useEffect } from 'react';
import { timeFormat } from '@/utils/helpers';
import CustomInput from './CustomInput';
import moment from 'moment';
import styles from '@/styles/forms.module.css';

const Timer = ({
  idTicket,
  idSolicitud,
  updateMtrTicket,
  updateSolicitud,
  postControl,
  getTicketSolic,
  showSolucion,
  modalSolution,
  setValueState,
  data,
  getDataTicket,
  getOnlySolicitud,
  payloadJwt,
  blockButton,
  setIsSaving,
}) => {
  // const [diff, setDiff] = useState(null);
  const [initial, setInitial] = useState(null);
  const [pause, setPause] = useState(true);
  // const [resume, setResume] = useState(true);
  const [showStart, setShowStart] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [dateStart, setDateStart] = useState(data.fecha_ini_solucion);
  const [datePaused, setDatePaused] = useState(null);
  const [valueStateControl, setValueStateControl] = useState({
    motivo_reasig_pausa: '',
  });
  const [showMotivo, setShowMotivo] = useState(false);
  const [saveFinal, setSaveFinal] = useState(false);
  const [finalTimeSolic, setFinalTimeSolic] = useState(0);

  // console.log(`props del Timer= idTicker: ${idTicket} - ${idSolicitud}`);

  useEffect(() => {
    let idFrame;

    const updateTimer = (timestamp) => {
      if (!pause) {
        const currentTime = timestamp - initial;
        setTimeElapsed(currentTime);
        idFrame = requestAnimationFrame(updateTimer);
      }
    };

    if (!pause) {
      idFrame = requestAnimationFrame(updateTimer);
    }

    return () => cancelAnimationFrame(idFrame);
  }, [pause, initial]);

  // const tick = () => {
  //   setDiff(new Date(+new Date() - initial));
  // };

  const handleChangeControl = (e) => {
    setValueStateControl({
      ...valueStateControl,
      [e.target.name]: e.target.value,
    });
    setIsSaving(true);
  };

  const start = () => {
    const dateBegin = Date.now(); //Captura la fecha actual en ms
    setInitial(performance.now() - timeElapsed);
    setPause(false);
    setShowStart(false);
    setDateStart(moment(new Date(dateBegin)).format('YYYY-MM-DDTkk:mm:ss')); //*creo la nueva Fecha a partir de los ms y transformo

    blockButton(true);
    setIsSaving(true); //*Para que permita o bloquee cerrar pestaña

    //TODO:|Si el ticket esta en estado "solicitado" significa que aun no se ha comenzado a procesar ninguna solicitud
    //TODO:|dentro del mismo. Por lo tanto al comenzar el contador en cualquier solicitud del ticket se cambiará su estado a proceso

    if (data.mtr_tickets.estatus === 'solicitado') {
      updateMtrTicket(idTicket, {
        estatus: 'proceso',
      });

      //TODO:|Si ya esta el ticket en proceso y no tiene una fecha de inicio registrada
      //TODO:|se asignará la fecha de inicio de todo el soporte para todo el ticket ya que se entiende que es la primera solicitud para ese ticket en ser atendida
      if (!data.mtr_tickets.fecha_ini_sop) {
        updateMtrTicket(idTicket, {
          fecha_ini_sop: moment(new Date(dateBegin)).format(
            'YYYY-MM-DDTkk:mm:ss'
          ),
        });
      }
    }

    //TODO:|Evaluo la primera vez que empieza la atención en la solicitud, es decir cuando la solicitud este como "asignado"
    //TODO:|Para cambiar su estatus y colocar la fecha de inicio de atención de la solución para la solicitud
    //*Adicional se utiliza el último parámetro de la función "updateSolicitud" para enviar los datos para el correo del cliente
    if (data.estatus === 'asignado') {
      updateSolicitud(
        idTicket,
        idSolicitud,
        {
          estatus: 'proceso',
          fecha_ini_solucion: moment(new Date(dateBegin)).format(
            'YYYY-MM-DDTkk:mm:ss'
          ),
        },
        false,
        false,
        {
          email: data.mtr_tickets.personal_emp.correo,
          nameAgente: payloadJwt.nameAgSop,
          estatus: 2,
          descripSolic: data.descripcion,
        }
      );
    }
  };

  const pauseTimer = async () => {
    const datePause = Date.now(); //*Captura la fecha al pausar en ms
    const fin = performance.now();

    setDatePaused(moment(new Date(datePause)).format('YYYY-MM-DDTkk:mm:ss'));
    console.log(datePaused);
    const tiempoTotal = fin - initial;
    console.log(`Tiempo total hasta la pausa: ${timeFormat(tiempoTotal)}`);

    const dataControl = {
      id_agente: data.agente_asig,
      fecha_ini_atencion: moment(dateStart).format('YYYY-MM-DD'),
      fecha_fin_atencion: moment(new Date(datePause)).format('YYYY-MM-DD'),
      hora_ini_atencion: moment(dateStart).format('kk:mm:ss'),
      hora_fin_atencion: moment(new Date(datePause)).format('kk:mm:ss'),
      tiempo_calc: Math.floor(tiempoTotal / 1000), //Tiempo en Segundos
      motivo_reasig_pausa: valueStateControl.motivo_reasig_pausa
        ? valueStateControl.motivo_reasig_pausa
        : '-',
    };

    setPause(true);
    setTimeElapsed(0);
    setIsSaving(false); //Para que permita o bloquee cerrar pestaña
    //*Inserto el registro de control al pausar la solicitud
    await postControl(dataControl, idTicket, idSolicitud);
    await updateSolicitud(idTicket, idSolicitud, {
      estatus: 'pausado',
    });
    getDataTicket();
    blockButton(false);
    setShowMotivo(false);
  };

  const resumeTimer = () => {
    const dateResume = Date.now(); //Captura la fecha al pausar en ms
    setInitial(performance.now() - timeElapsed);
    setPause(false);
    setDateStart(moment(new Date(dateResume)).format('YYYY-MM-DDTkk:mm:ss')); //creo la nueva Fecha a partir de los ms y transformo
    updateSolicitud(idTicket, idSolicitud, {
      estatus: 'proceso',
    });
    blockButton(true);
    setIsSaving(true); //Para que permita o bloquee cerrar pestaña
  };

  const finishTimer = async () => {
    setPause(true);
    blockButton(true);
    setIsSaving(false); //Para que permita o bloquee cerrar pestaña
    const dateFin = Date.now(); //Captura la fecha al Finalizar en ms
    // setDatePause(moment(new Date(dateFin)).format('YYYY-MM-DDTkk:mm:ss'));

    if (initial) {
      const fin = performance.now();
      const tiempoTotal = fin - initial;
      console.log(`Tiempo total transcurrido: ${timeFormat(tiempoTotal)}`);

      //*Al finalizar armo objeto para crear el control final del ticket
      const dataControl = {
        id_agente: data.agente_asig,
        fecha_ini_atencion: moment(dateStart).format('YYYY-MM-DD'),
        fecha_fin_atencion: moment(new Date(dateFin)).format('YYYY-MM-DD'),
        hora_ini_atencion: moment(dateStart).format('kk:mm:ss'),
        hora_fin_atencion: moment(new Date(dateFin)).format('kk:mm:ss'),
        tiempo_calc: Math.floor(tiempoTotal / 1000),
      };

      setTimeElapsed(0);
      //*Inserto el registro de control al finalizar la solicitud
      await postControl(dataControl, idTicket, idSolicitud);
      //*Actualizo estado y fecha de fin de solución de la solicitud
      await updateSolicitud(idTicket, idSolicitud, {
        estatus: 'finalizado',
        fecha_fin_solucion: moment(new Date(dateFin)).format(
          'YYYY-MM-DDTkk:mm:ss'
        ),
      });

      //TODO:|Una vez actualizado el estado de la solicitud, obtengo los datos de LA SOLICITUD anidado su TICKET
      //TODO:|y todos sus controles, para actualizar el tiempo total en el MTR_TICKET
      await getTicketSolic(idTicket, idSolicitud)
        .then((dataSolicTicket) => {
          console.log({ dataFinalTicketSolic: dataSolicTicket });
          //*Armo objeto para la tabla MTR_TICKETS y actualizar sus tiempo finales
          const mtrTickets = {
            descrip_tk: dataSolicTicket[0].mtr_tickets.descrip_tk,
            estatus: dataSolicTicket[0].mtr_tickets.estatus,
            fecha_fin_sop:
              dataSolicTicket[0].mtr_tickets.fecha_fin_sop === null
                ? undefined
                : dataSolicTicket[0].mtr_tickets.fecha_fin_sop,
            fecha_ini_sop: dataSolicTicket[0].mtr_tickets.fecha_ini_sop,
            fecha_reg: dataSolicTicket[0].mtr_tickets.fecha_reg,
            id_cliente: dataSolicTicket[0].mtr_tickets.id_cliente,
            id_emp: dataSolicTicket[0].mtr_tickets.id_emp,
            id_tipo:
              dataSolicTicket[0].mtr_tickets.id_tipo === null
                ? undefined
                : dataSolicTicket[0].mtr_tickets.id_tipo,
            prioridad: dataSolicTicket[0].mtr_tickets.prioridad,
            tiempo_calc_sop:
              dataSolicTicket[0].mtr_tickets.tiempo_calc_sop === null
                ? 0
                : Number(dataSolicTicket[0].mtr_tickets.tiempo_calc_sop),
            tiempo_diferencial:
              dataSolicTicket[0].mtr_tickets.tiempo_diferencial === null
                ? 0
                : Number(dataSolicTicket[0].mtr_tickets.tiempo_diferencial),
            tiempo_real_sop:
              dataSolicTicket[0].mtr_tickets.tiempo_real_sop === null
                ? 0
                : Number(dataSolicTicket[0].mtr_tickets.tiempo_real_sop),
          };

          console.log({ MTR_TICKET: mtrTickets });
          //*Realizo sumatoria de todos los tiempos para añadir el total al mtr_ticket
          const finalTimeControls = dataSolicTicket[0]?.control_tickets.reduce(
            (acumulador, control) => {
              return acumulador + Number(control.tiempo_calc);
            },
            0
          );
          console.log(`Tiempo final control: ${finalTimeControls}`);

          //*Actualizo tiempo final añadiendo al tiempo previo si existe de otras solicitudes finalizadas para ese ticket
          //*Se evalua si la solicitud fue marcada como error
          if (!data.isError) {
            updateMtrTicket(idTicket, {
              tiempo_calc_sop: Number(
                mtrTickets.tiempo_calc_sop + finalTimeControls
              ),
              tiempo_real_sop: Number(
                mtrTickets.tiempo_real_sop + finalTimeControls
              ),
            });
          } else {
            //!Si la solicitud es considerada error, se calcula el tiempo de soporte normal, pero se añade al tiempo del error en el campo
            //!tiempo diferencial, y no se aumenta al tiempo real de soporte.
            updateMtrTicket(idTicket, {
              tiempo_calc_sop: Number(
                mtrTickets.tiempo_calc_sop + finalTimeControls
              ),
              tiempo_diferencial: Number(
                mtrTickets.tiempo_diferencial + finalTimeControls
              ),
              tiempo_real_sop: Number(mtrTickets.tiempo_real_sop),
            });
          }

          setFinalTimeSolic(finalTimeControls);
        })
        .catch((error) => {
          console.log(error);
          alert(error);
        });

      //TODO:|A continuación realizo llamada de todas las solicitudes del ticket para determinar la última a finalizar y dar por terminado la fecha y estado final de todo el ticket
      const solicitudesTicket = getOnlySolicitud(idTicket);
      solicitudesTicket
        .then((data) => {
          //*Obtengo las solicitudes diferentes a la actual para extraer su estatus
          const estatusSolicitudes = data
            .filter((solicitud) => {
              return solicitud.id_solicitud !== Number(idSolicitud);
            })
            .map((solicitud) => {
              return solicitud.estatus;
            });
          //*Filtro los estatus que no esten finalizados
          const noFinalizadas = estatusSolicitudes.filter((estatus) => {
            return estatus !== 'finalizado';
          });
          //?| Si no obtengo un array con solicitudes (0) significa que ya no hay solicitudes Pendientes
          //?| de finalizar por lo tanto la actual es la última y está será la encargada
          //?| de actualizar el MTR_TICKETS (todo el ticket) la fecha de finalización de todo el soporte, asi como su estado a "finalizado"
          if (noFinalizadas.length === 0) {
            updateMtrTicket(idTicket, {
              fecha_fin_sop: moment(new Date(dateFin)).format(
                'YYYY-MM-DDTkk:mm:ss'
              ),
              estatus: 'finalizado',
            });
          }
        })
        .catch((error) => {
          console.log(error);
          alert(error);
        });
      // showSolucion(true);
      setSaveFinal(true);
    }
  };

  //TODO:|Esta función muestra el modal de la solución, pero mantiene por debajo el tiempo corriendo todavía
  //TODO:|Luego el modal de la solución contendrá el botón final para que finalice el cáculo del tiempo y el control final
  //TODO:|Es decir este botón dentro del modal es el que contiene la función "finishTimer()"
  const finishSolicitudButton = () => {
    if (initial) {
      showSolucion(true);
      blockButton(true);
      setIsSaving(false); //Para que permita o bloquee cerrar pestaña
    }
  };

  //TODO:|Se usa aquí el handle que a su vez modifica el estado del componente superiror [idSolicitud]
  //TODO:|Por lo que viene como props el setValueState y la data del state (valueState)
  const handleChange = (e) => {
    setValueState({ ...data, [e.target.name]: e.target.value });
    setIsSaving(true);
  };

  const handleCheck = () => {
    setValueState({ ...data, isError: !data.isError });
  };

  // const restartTimer = () => {
  //   setInitial(null);
  //   setPause(true);
  //   setTimeElapsed(0);
  // };

  /* console.log({
    inicial: initial,
    fechaInicial: dateStart,
    tiempotrans: timeElapsed,
    fechaPausa: datePause,
    fecha_ini_atencion: moment(dateStart).format('YYYY-MM-DD'),
    hora_ini_atencion: moment(dateStart).format('kk:mm:ss'),
  });*/

  //console.log(`Tiempo FINAL Solicitud en segundos: ${finalTimeSolic}`);

  return (
    <div className="timerContainer">
      <h1 className="timer">{timeFormat(timeElapsed)}</h1>
      {/* <h2>{timeElapsed}</h2> */}
      <span className="timerButtonContaniner">
        {!data.control_tickets && (
          <button onClick={start} disabled={!showStart && true} type="button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ color: '#1a73e8' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
              />
            </svg>
            Iniciar
          </button>
        )}
        {!pause ? (
          <button
            onClick={() => {
              setShowMotivo(true);
            }}
            disabled={pause && true}
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ color: 'rgb(66, 167, 96)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            Pausar
          </button>
        ) : (
          <button
            onClick={resumeTimer}
            disabled={!pause && true}
            type="button"
            style={
              !data.control_tickets
                ? { display: 'none' }
                : { display: 'inline' }
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              style={{ color: '#1a73e8' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z"
              />
            </svg>
            Reanudar
          </button>
        )}

        {/* <button onClick={finishTimer} type="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            style={{ color: 'rgb(155, 32, 32)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
            />
          </svg>
          Finalizar
        </button> */}
        <button
          onClick={() => {
            finishSolicitudButton();
          }}
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            style={{ color: 'rgb(155, 32, 32)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
            />
          </svg>
          Finalizar
        </button>
        {/* <button onClick={restartTimer}>Reiniciar</button> */}
        {showMotivo && (
          <div className={styles.modalSolucion}>
            <span className={styles['input-container']}>
              <textarea
                name="motivo_reasig_pausa"
                onChange={handleChangeControl}
                defaultValue={valueStateControl.motivo_reasig_pausa}
                cols="30"
                rows="5"
                className={styles.textArea}
                placeholder="Ingrese el motivo de la Pausa"
                maxLength="500"
              ></textarea>
              <label className={styles['activate-label-position']}>
                Motivo de la pausa
              </label>
            </span>
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
              Máx. {500 - valueStateControl.motivo_reasig_pausa.length}
            </span>
            <span
              className={styles.buttonContainer}
              id={styles.buttonSolicitud}
            >
              <button
                onClick={pauseTimer}
                disabled={pause && true}
                type="button"
                style={{ width: '100%', borderRadius: '8px', gap: '16px' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{ color: 'rgb(66, 167, 96)' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <b>Guardar Registro</b>
              </button>
            </span>
          </div>
        )}
      </span>
      {modalSolution && (
        <span
          className={`${styles.inputContainer1_1} ${styles.inputContainer1_1v}`}
        >
          <div className={styles.modalSolucion}>
            <span className={styles['input-container']}>
              <textarea
                name="solucion"
                onChange={handleChange}
                defaultValue={data.solucion}
                cols="30"
                rows="7"
                className={styles.textArea}
                placeholder="Ingrese la solución para esta solicitud"
              ></textarea>
              <label className={styles['activate-label-position']}>
                Detalle de la Solución
              </label>
            </span>
            <span style={{ borderRadius: '0' }}>
              <CustomInput
                typeInput="checkbox"
                nameInput="isError"
                valueInput={data.isError}
                onChange={handleCheck}
                nameLabel="NO es error del usuario, es error de la solución de software"
                customStyle={{
                  flexWrap: 'nowrap',
                  width: '15%',
                  margin: '4px auto',
                }}
              />
            </span>
            {data.isError && (
              <span className={styles['input-container']}>
                <textarea
                  name="detError"
                  onChange={handleChange}
                  defaultValue={data.detError}
                  cols="30"
                  rows="4"
                  className={styles.textArea}
                  placeholder="Ingrese el motivo del error para su seguimiento"
                  style={{
                    border: '2px solid #bf616a',
                    outlineColor: '#c92a2a',
                    background: '#e6616129',
                  }}
                ></textarea>
                {/* <label className={styles['activate-label-position']}>
                  Detalle del Error
                </label> */}
              </span>
            )}
            {!saveFinal && (
              <span
                className={styles.buttonContainer}
                id={styles.buttonSolicitud}
              >
                <button
                  onClick={finishTimer}
                  type="button"
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    gap: '8px',
                    padding: '4px',
                    cursor: 'pointer',
                    border: '1px solid #444a8d',
                    color: '#e43b3b',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ color: 'rgb(155, 32, 32)' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z"
                    />
                  </svg>
                  <b>Calcular Tiempo Final</b>
                </button>
              </span>
            )}
            {saveFinal && (
              <div style={{ width: '100%', background: 'white' }}>
                <span
                  style={{
                    color: '#1a73e8',
                    display: 'flex',
                    justifyContent: 'space-evenly',
                    alignItems: 'center',
                    borderBottom: '1px solid #1a73e8',
                    padding: '4px',
                    borderRadius: '0',
                    width: '100%',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  <h3>Tiempo final para esta solicitud:</h3>
                  <b>{timeFormat(finalTimeSolic * 1000)}</b>
                  <span
                    className={styles.buttonContainer}
                    id={styles.buttonSolicitud}
                    style={{
                      borderRadius: '8px',
                      gap: '8px',
                      cursor: 'pointer',
                      border: '1px solid #444a8d',
                      padding: '0',
                      margin: '0',
                    }}
                  >
                    <button
                      title="Guardar Solicitud Final"
                      className={styles['formButton']}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        gap: '16px',
                        color: '#42a760',
                        padding: '4px',
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ color: 'rgb(66, 167, 96)', scale: '1.1' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <b>Guardar Solicitud Final</b>
                    </button>
                  </span>
                </span>
              </div>
            )}
          </div>
        </span>
      )}
    </div>
  );
};

export default Timer;
