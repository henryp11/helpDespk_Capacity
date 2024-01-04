'use client';
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '@/components/CustomInput';
// import Appcontext from '../context/AppContext';
import ErrorLayout from '@/components/ErrorLayout';
import Timer from '@/components/Timer';
import useApiTickets from '@/hooks/useApiTickets';
import { validateExpToken } from '@/utils/helpers';
import { timeFormat } from '../../../utils/helpers';
import styles from '@/styles/forms.module.css';
import stylesEmp from '@/styles/emp.module.css';

const newregister = () => {
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
    capturas: undefined,
    agente_asig: '',
    fecha_ini_solucion: undefined,
    fecha_fin_solucion: undefined,
    solucion: '',
    estatus: '',
    mtr_tickets: { personal_emp: { empresa: {} } },
    control_tickets: [],
  };
  const [valueState, setValueState] = useState(initialState);
  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });
  const [showSolucion, setShowSolucion] = useState(false);
  const [regCapture, setRegCapture] = useState('');

  useEffect(() => {
    getDataTicket();
    validateExpToken();
  }, [ruta]);

  const getDataTicket = () => {
    setLoadCreate({ loading: true, error: null });
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
          capturas: data[0].capturas === null ? undefined : data[0].capturas,
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
  };

  const handleCheck = (fieldCheck) => {
    if (fieldCheck === 'plan') {
      setValueState({ ...valueState, planMant: !valueState.planMant });
    } else if (fieldCheck === 'est') {
      setValueState({ ...valueState, estatus: !valueState.estatus });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //El último parámetro (true) es para que sed redireccione a la pantalla anterior una vez actualizado
    //El tercer parámetro (false) se usa en la pantalla de asignación de ticket a agente, por eso coloco en false
    //No es obligatorio pero en este caso si requiero enviar el último parámetro para el redireccionamiento
    updateSolicitud(
      idTicketSearch,
      idSolicSearch,
      {
        solucion: valueState.solucion,
      },
      false,
      true
    );
  };

  // const timeFormat = (ms) => {
  //   if (!ms) return '00:00:00';
  //   let ss = Math.floor(ms / 1000);
  //   let mm = Math.floor(ss / 60);
  //   let hh = Math.floor(mm / 60);

  //   hh = hh < 10 ? '0' + hh : hh;
  //   mm = mm < 10 ? '0' + mm : mm;
  //   ss = ss < 10 ? '0' + ss : ss;

  //   return `${hh}:${mm % 60 < 10 ? '0' : ''}${mm % 60}:${
  //     ss % 60 < 10 ? '0' : ''
  //   }${ss % 60}`;
  // };

  console.log({ stateCompon: valueState });

  return (
    <>
      <div
        className={stylesEmp.crudEmpContainer}
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
                required={true}
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
                className={`${styles.inputContainer1_1} ${styles.inputContainer1_1v}`}
              >
                <span className={styles['input-container']}>
                  <textarea
                    name="descripcion"
                    onChange={handleChange}
                    defaultValue={valueState.descripcion}
                    cols="30"
                    rows="4"
                    className={styles.textArea}
                    disabled={true}
                  ></textarea>
                  <label className={styles['activate-label-position']}>
                    Solicitud de Cliente
                  </label>
                </span>
              </span>
              <Timer
                idTicket={idTicketSearch}
                idSolicitud={idSolicSearch}
                updateMtrTicket={updateTicket}
                updateSolicitud={updateSolicitud}
                postControl={postControl}
                getDataTicket={getDataTicket}
                getTicketSolic={getTicketSolic}
                getOnlySolicitud={getOnlySolicitud}
                showSolucion={setShowSolucion}
                data={valueState}
              />
              <span
                style={{ gridColumn: '2 span', width: '70%', margin: '0 auto' }}
              >
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
                  nameLabel="Fecha Inicio Atención"
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
                  nameLabel="Fecha Final Atención"
                  disabled={true}
                />
              </span>
            </fieldset>
            <span
              className={`${styles.inputContainer1_1} ${styles.inputContainer1_1v}`}
            >
              {showSolucion && (
                <div className={styles.modalSolucion}>
                  <span className={styles['input-container']}>
                    <textarea
                      name="solucion"
                      onChange={handleChange}
                      defaultValue={valueState.solucion}
                      cols="30"
                      rows="7"
                      className={styles.textArea}
                      placeholder="Ingrese la solución para esta solicitud"
                    ></textarea>
                    <label className={styles['activate-label-position']}>
                      Detalle de la Solución
                    </label>
                  </span>
                  <span
                    className={styles.buttonContainer}
                    id={styles.buttonSolicitud}
                  >
                    <button
                      title="Guardar Solicitud"
                      className={styles['formButton']}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        style={{ color: 'rgb(66, 167, 96)', scale: '1.3' }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                    {/* <button
                      title="Cerrar"
                      className={`${styles.formButton}`}
                      // className={`${styles.cancelButton}`}
                      id="cancelButton"
                      type="button"
                      onClick={() => {
                        setShowSolucion(false);
                      }}
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
                          d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5"
                        />
                      </svg>
                    </button> */}
                  </span>
                </div>
              )}
            </span>
            {valueState.control_tickets && (
              <fieldset
                className={`${styles.fieldSetCustom} ${styles.fieldSetControls}`}
              >
                <legend>
                  Historial de control de tiempos para la solicitud
                </legend>

                <table className={styles.controlsTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha / Hora Inicio</th>
                      <th>Fecha / Hora Fin</th>
                      <th>Tiempo transcurrido</th>
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
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div
                  style={{
                    display: 'flex',
                    width: '100%',
                    margin: '8px',
                    padding: '4px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    borderTop: '1px solid #444a8d',
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
              </fieldset>
            )}

            <span className={styles.buttonContainer}>
              {/* <button title="Guardar" className={styles['formButton']}>
                {idTicketSearch === 'new' ? (
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
              </button> */}
              <button
                tittle="Regresar"
                className={`${styles.formButton}`}
                id="returnButton"
              >
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

export default newregister;
