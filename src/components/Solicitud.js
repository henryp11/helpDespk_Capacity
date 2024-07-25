import React, { useState, useEffect } from 'react';
import moment from 'moment';
import FileTickets from './FileTickets';
import useApiTickets from '@/hooks/useApiTickets';
import CustomInput from './CustomInput';
import Controls from './Controls';
import styles from '../styles/forms.module.css';

const Solicitud = ({
  dataSolicitud,
  showSolicitud,
  setShowSolicitud,
  showControl,
  perfil,
  enviroment,
  statusTicket,
}) => {
  const { updateSolicitud } = useApiTickets();

  const stateSolicitud = {
    agente_asig: '',
    agentes_sop: '', //Datos del agente si ya fue asignado, vendrá como objeto
    capturas: {
      file1: { name: '', url: '', type: '', size: '' },
      file2: { name: '', url: '', type: '', size: '' },
      file3: { name: '', url: '', type: '', size: '' },
      file4: { name: '', url: '', type: '', size: '' },
    },
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
              valueInput={
                valueState.agentes_sop &&
                `${valueState.agente_asig} - ${valueState.agentes_sop.nombre}`
              }
              onChange={handleChange}
              nameLabel="Agente Encargado"
              disabled={true}
            />
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
                disabled={
                  perfil !== 'admin' &&
                  enviroment === 'tracking' &&
                  statusTicket === 'solicitado'
                    ? false
                    : true
                }
              ></textarea>
              <label className={styles['activate-label-position']}>
                Detalle Solicitud
              </label>
            </span>
            <span
              className={styles.buttonContainer}
              id={styles.buttonSolicitud}
            >
              {perfil !== 'admin' &&
                enviroment === 'tracking' &&
                statusTicket === 'solicitado' && (
                  <button
                    title="Actualizar Solicitud"
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
                )}

              <button
                title="Ocultar Solic."
                className={`${styles.formButton}`}
                // id="cancelButton"
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
          <div
            style={{
              gridColumn: '1/-1',
              display: 'flex',
              width: '100%',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              onClick={() => {
                setShowModalFile1({
                  ...showModalFile1,
                  active: !showModalFile1.active,
                });
              }}
              className={styles.addFiles}
            >
              {valueState.capturas?.file1.url && (
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
              {`Archivo 1: ${valueState.capturas?.file1.name}`}
            </span>
            {showModalFile1.active && (
              <FileTickets
                setStateSolicitud={setValueState}
                stateSolicitud={valueState}
                idFile="file1"
                idTicket={valueState.id_ticket}
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
              {valueState.capturas?.file2.url && (
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
              {`Archivo 2: ${valueState.capturas?.file2.name}`}
            </span>
            {showModalFile2.active && (
              <FileTickets
                setStateSolicitud={setValueState}
                stateSolicitud={valueState}
                idFile="file2"
                idTicket={valueState.id_ticket}
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
              {valueState.capturas?.file3.url && (
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
              {`Archivo 3: ${valueState.capturas?.file3.name}`}
            </span>
            {showModalFile3.active && (
              <FileTickets
                setStateSolicitud={setValueState}
                stateSolicitud={valueState}
                idFile="file3"
                idTicket={valueState.id_ticket}
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
              {valueState.capturas?.file4.url && (
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
              {`Archivo 4: ${valueState.capturas?.file4.name}`}
            </span>
            {showModalFile4.active && (
              <FileTickets
                setStateSolicitud={setValueState}
                stateSolicitud={valueState}
                idFile="file4"
                idTicket={valueState.id_ticket}
                reset={resetUpFiles}
                setReset={setResetUpFiles}
                showModal={showModalFile4}
                setShowModalFile={setShowModalFile4}
              />
            )}
          </div>
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
                disabled={
                  perfil === 'admin' || perfil === 'agente' ? false : true
                }
              ></textarea>
              <label className={styles['activate-label-position']}>
                Observaciones solución
              </label>
            </span>
          </span>
        </form>
      )}
      {showSolicitud && showControl && (
        <Controls
          id_ticket={dataSolicitud.id_ticket}
          id_solicitud={dataSolicitud.id_solicitud}
          perfil={perfil}
        />
      )}
    </>
  );
};

export default Solicitud;
