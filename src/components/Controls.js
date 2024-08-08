import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import moment from 'moment';
import CustomInput from './CustomInput';
import useApiControls from '@/hooks/useApiControls';
import { timeFormat } from '@/utils/helpers';
import styles from '../styles/forms.module.css';

const Controls = ({ id_ticket, id_solicitud, perfil }) => {
  const ruta = usePathname();
  const { getControlByTicketSolicitud } = useApiControls();

  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });
  const [valueState, setValueState] = useState([]);

  useEffect(() => {
    getDataControl();
  }, [ruta]);

  const getDataControl = () => {
    setLoadCreate({ loading: true, error: null });
    //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
    const response = getControlByTicketSolicitud(id_ticket, id_solicitud);
    response
      .then((data) => {
        console.log({ GetControlApi: data });
        console.log(
          timeFormat(
            data
              ?.map((control) => {
                return Number(control.tiempo_calc);
              })
              .reduce((acumulador, tiempo) => {
                return Number(acumulador + tiempo);
              }, 0) * 1000
          )
        );
        //Extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
        //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de COntroles, no envio el id_ticket ya que es la PK y está prohibido topar ese campo.
        // const dataEdit = {
        //   id_cliente: data.id_cliente,
        //   id_emp: data.id_emp,
        //   prioridad: data.prioridad,
        //   descrip_tk: data.descrip_tk,
        //   fecha_reg: data.fecha_reg,
        //   fecha_ini_sop: data.fecha_ini_sop,
        //   fecha_fin_sop:
        //     data.fecha_fin_sop === null ? undefined : data.fecha_fin_sop,
        //   tiempo_calc_sop:
        //     data.tiempo_calc_sop === null ? undefined : data.tiempo_calc_sop,
        //   tiempo_diferencial:
        //     data.tiempo_diferencial === null
        //       ? undefined
        //       : data.tiempo_diferencial,
        //   tiempo_real_sop:
        //     data.tiempo_real_sop === null ? undefined : data.tiempo_real_sop,
        //   estatus: data.estatus,
        //   personal_emp: data.personal_emp,
        //   det_tickets: data.det_tickets,
        // };
        setValueState(data);
        setLoadCreate({ loading: false, error: null });
      })
      .catch((error) => {
        console.log(error);
        setLoadCreate({ loading: false, error: error });
      });
  };

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  console.log({ stateControls: valueState });

  return (
    <span className={styles['input-container']} style={{ gridColumn: '1/-1' }}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          // margin: '2px',
          padding: '4px',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid #444a8d',
          fontSize: '1.1em',
        }}
      >
        <h5 style={{ color: '#1c4f92' }}>
          <i>Detalle control de tiempos | </i>
        </h5>
        <span
          style={{
            border: '1px solid #1c4f92',
            padding: '2px 4px',
            borderRadius: '8px',
          }}
        >
          <b style={{ color: '#444a8d' }}>Total Solicitud:</b>
          <b style={{ color: '#1a73e8' }}>
            {timeFormat(
              valueState
                ?.map((control) => {
                  return Number(control.tiempo_calc);
                })
                .reduce((acumulador, tiempo) => {
                  return Number(acumulador + tiempo);
                }, 0) * 1000
            )}
          </b>
        </span>
      </div>
      {!loadCreate.loading &&
        valueState?.map((dataControl) => {
          return (
            <form
              key={dataControl.id_control}
              className={styles['form-default']}
              id={styles.gridControles}
              onSubmit={handleSubmit}
              // style={{
              //   borderRadius: '1px',
              //   boxShadow: 'inset 2px -2px 0px #1a73e8',
              //   gridTemplateColumns: '37% 37% 15% 10%',
              //   alignItems: 'center',
              //   padding: '8px',
              // }}
            >
              <span
                className="gridAllColumn"
                style={{
                  marginBottom: '12px',
                  marginLeft: '4px',
                  paddingBottom: '8px',
                  color: '#1a73e8',
                  fontSize: '12px',
                }}
              >
                <b>
                  Control: {dataControl.id_control}-
                  {dataControl.nivel_complejidad}
                </b>
                | <i>Agente:</i> {dataControl.id_agente} -{' '}
                {dataControl.agentes_sop?.nombre}
                {dataControl.reasignado && (
                  <p>
                    <b>Motivo Reasignación:</b>
                    {dataControl.motivo_reasig}
                  </p>
                )}
              </span>
              <span className={styles.containerDates}>
                <CustomInput
                  typeInput="text"
                  nameInput="fecha_ini_atencion"
                  valueInput={moment(dataControl.fecha_ini_atencion).format(
                    'DD-MM-YYYY'
                  )}
                  onChange={handleChange}
                  nameLabel="Fecha Inicio"
                />
                <CustomInput
                  typeInput="text"
                  nameInput="hora_ini_atencion"
                  valueInput={dataControl.hora_ini_atencion}
                  onChange={handleChange}
                  nameLabel="Hora Inicio"
                />
              </span>
              <span className={styles.containerDates}>
                <CustomInput
                  typeInput="text"
                  nameInput="fecha_fin_atencion"
                  valueInput={moment(dataControl.fecha_fin_atencion).format(
                    'DD-MM-YYYY'
                  )}
                  onChange={handleChange}
                  nameLabel="Fecha Fin"
                />
                <CustomInput
                  typeInput="text"
                  nameInput="hora_fin_atencion"
                  valueInput={dataControl.hora_fin_atencion}
                  onChange={handleChange}
                  nameLabel="Hora Fin"
                />
              </span>
              <CustomInput
                typeInput="text"
                nameInput="tiempo_calc"
                valueInput={timeFormat(dataControl.tiempo_calc * 1000)}
                onChange={handleChange}
                nameLabel="Tiempo"
                disabled={true}
              />
              {perfil === 'admin' ||
                (perfil === 'agente' && (
                  <span
                    className={`${styles.buttonContainer} ${styles.buttonContainerInline}`}
                  >
                    <button
                      title="Guardar/actualizar Control"
                      className={styles['formButton']}
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
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    {/* <button
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
                        d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </Link>
                </button> */}
                  </span>
                ))}
            </form>
          );
        })}
    </span>
  );
};

export default Controls;
