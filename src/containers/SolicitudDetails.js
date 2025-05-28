import React from 'react';
import moment from 'moment';
import Controls from '@/components/Controls';
import styles from '../styles/emp.module.css';

const SolicitudDetails = (props) => {
  const { open, details, estatus } = props;

  const capturasArray = Object.values(details.capturas);
  const filesWithUrl = capturasArray.filter((file) => {
    return file.url !== '';
  });

  console.log(details);
  console.log(capturasArray);
  console.log(filesWithUrl);

  return (
    <>
      {open && (
        <div className={styles.wrapContainer}>
          <span className={styles.wrapFields}>
            <h3 className={styles.wrapTittles}>Fecha Inicio Solución</h3>
            <p>
              {details.fecha_ini_solucion !== null &&
                moment(details.fecha_ini_solucion).format(
                  'DD/MM/YYYY - kk:mm:ss'
                )}
            </p>
          </span>
          {estatus === 'finalizado' && (
            <span className={styles.wrapFields}>
              <h3 className={styles.wrapTittles}>Fecha Fin Solución</h3>
              <p>
                {details.fecha_ini_solucion !== null &&
                  moment(details.fecha_fin_solucion).format(
                    'DD/MM/YYYY - kk:mm:ss'
                  )}
              </p>
            </span>
          )}
          <span className={styles.wrapFields} style={{ gridColumn: '2 span' }}>
            <h3 className={styles.wrapTittles}>Correo Solicitante</h3>
            <p>{details.mtr_tickets.personal_emp.correo}</p>
          </span>
          <span className={styles.wrapFields} style={{ gridColumn: '3 span' }}>
            <h3 className={styles.wrapTittles}>Detalle Solicitud</h3>
            <p>{details.descripcion}</p>
          </span>
          <span className={styles.wrapFields}>
            <h3
              className={styles.wrapTittles}
            >{`Archivos Adjuntos: ${filesWithUrl.length}`}</h3>
            {filesWithUrl.map((file, index) => {
              return (
                <p style={{ margin: '4px' }} key={file.name}>
                  <b>
                    <i>Archivo {index + 1}: </i>
                  </b>
                  <a
                    href={file.url}
                    target="_blank"
                    style={{
                      textDecoration: 'underline',
                      color: 'blue',
                      margin: '4px',
                    }}
                  >
                    {file.name}
                  </a>
                </p>
              );
            })}
          </span>
          {estatus === 'finalizado' && (
            <span className={styles.wrapFields} style={{ gridColumn: '1/-1' }}>
              <h3 className={styles.wrapTittles}>Solución</h3>
              <p>{details.solucion}</p>
            </span>
          )}
          {details.isError && (
            <span className={styles.wrapFields} style={{ gridColumn: '1/-1' }}>
              <h3 className={styles.wrapTittles}>Detalle del Error:</h3>
              <p>{details.detError}</p>
            </span>
          )}
          {estatus === 'finalizado' && (
            <Controls
              id_ticket={details.id_ticket}
              id_solicitud={details.id_solicitud}
              // perfil={perfil}
            />
          )}
        </div>
      )}
    </>
  );
};

export default SolicitudDetails;
