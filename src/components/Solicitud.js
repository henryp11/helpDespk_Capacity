import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { usePathname } from 'next/navigation';
import ErrorLayout from './ErrorLayout';
import useApiTickets from '@/hooks/useApiTickets';
import CustomInput from './CustomInput';
import Controls from './Controls';
import styles from '../styles/forms.module.css';

const Solicitud = ({
  dataSolicitud,
  showSolicitud,
  setShowSolicitud,
  showControl,
  showButtons,
  perfil,
}) => {
  const { updateSolicitud, error, statusError, messageError } = useApiTickets();

  // const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro de firebase)
  // const idSearch = nextRouter.query.id_ticket; //Para verificar el string param de id_ticket y saber si estoy creando o editando un registro
  const ruta = usePathname();

  const stateSolicitud = {
    agente_asig: '',
    capturas: '',
    descripcion: '',
    estatus: '',
    fecha_ini_solucion: '',
    fecha_fin_solucion: '',
    id_categ_final: undefined,
    id_categ_supuesta: undefined,
    modulo: undefined,
    solucion: '',
  };

  const [valueState, setValueState] = useState(stateSolicitud);

  useEffect(() => {
    setValueState(dataSolicitud);
  }, []);

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataUpdate = {
      agente_asig:
        valueState.agente_asig === null ? undefined : valueState.agente_asig,
      capturas: valueState.capturas === null ? undefined : valueState.capturas,
      descripcion: valueState.descripcion,
      estatus: valueState.estatus,
      fecha_ini_solucion:
        valueState.fecha_ini_solucion === null
          ? undefined
          : moment(valueState.fecha_ini_solucion).format('YYYY-MM-DDTkk:mm:ss'),
      fecha_fin_solucion:
        valueState.fecha_fin_solucion === null
          ? undefined
          : moment(valueState.fecha_fin_solucion).format('YYYY-MM-DDTkk:mm:ss'),
      id_categ_final:
        valueState.id_categ_final === null
          ? undefined
          : valueState.id_categ_final,
      id_categ_supuesta:
        valueState.id_categ_supuesta === null
          ? undefined
          : valueState.id_categ_supuesta,
      modulo: valueState.modulo === null ? undefined : valueState.modulo,
      solucion: valueState.solucion === null ? undefined : valueState.solucion,
    };
    updateSolicitud(
      dataSolicitud.id_ticket,
      dataSolicitud.id_solicitud,
      dataUpdate
    );
  };

  console.log({ stateSolicitud: valueState });

  return (
    <>
      {showSolicitud && (
        <form
          className={styles['form-default']}
          onSubmit={handleSubmit}
          style={{
            borderBottom: '1px solid black',
            borderRadius: '1px',
            boxShadow: 'inset 6px -6px 0px #444a8d',
            gridTemplateColumns: '33% 33% 33%',
          }}
        >
          <span className={styles.inputContainer1_3}>
            <CustomInput
              typeInput="text"
              nameInput="id_solicitud"
              valueInput={`${dataSolicitud.id_ticket}-${dataSolicitud.id_solicitud}`}
              onChange={handleChange}
              nameLabel="id.Solicitud"
              disabled={true}
            />
            <CustomInput
              typeInput="text"
              nameInput="agente_asig"
              valueInput={valueState.agente_asig}
              onChange={handleChange}
              nameLabel="Agente Encargado"
              disabled={true}
            />
            <CustomInput
              typeInput="text"
              nameInput="fecha_ini_solucion"
              valueInput={moment(valueState.fecha_ini_solucion).format(
                'DD/MM/YYYY - kk:mm:ss'
              )}
              onChange={handleChange}
              nameLabel="Fecha Inicio Atención"
              disabled={true}
            />
            <CustomInput
              typeInput="text"
              nameInput="fecha_fin_solucion"
              valueInput={moment(valueState.fecha_fin_solucion).format(
                'DD/MM/YYYY - kk:mm:ss'
              )}
              onChange={handleChange}
              nameLabel="Fecha Final Atención"
              disabled={true}
            />
          </span>
          <CustomInput
            typeInput="text"
            nameInput="descripcion"
            valueInput={valueState.descripcion}
            onChange={handleChange}
            nameLabel="Detalle Solicitud"
            required={true}
            disabled={true}
          />
          <span
            className={`${styles.inputContainer1_1} ${styles.inputContainer1_1v}`}
          >
            <span className={styles['input-container']}>
              <textarea
                name="solucion"
                onChange={handleChange}
                defaultValue={valueState.solucion}
                cols="30"
                rows="4"
                className={styles.textArea}
                disabled={perfil === 'admin' ? false : true}
              ></textarea>
              <label className={styles['activate-label-position']}>
                Observaciones solución
              </label>
            </span>
            <span
              className={styles.buttonContainer}
              id={styles.buttonSolicitud}
            >
              {showButtons && perfil !== 'admin' && (
                <button title="Guardar" className={styles['formButton']}>
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
              )}

              <button
                title="Cerrar"
                className={`${styles.formButton}`}
                // className={`${styles.cancelButton}`}
                id="cancelButton"
                type="button"
                onClick={() => {
                  setShowSolicitud(false);
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
              </button>
            </span>
          </span>
        </form>
      )}
      {showSolicitud && showControl && (
        <Controls
          id_ticket={dataSolicitud.id_ticket}
          id_solicitud={dataSolicitud.id_solicitud}
        />
      )}
    </>
  );
};

export default Solicitud;
