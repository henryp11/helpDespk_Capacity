import React, { useRef, useState, useEffect } from 'react';
import { useDownloadExcel } from 'react-export-table-to-excel';
import moment from 'moment';
import { timeFormat } from '@/utils/helpers';
import useScreenSize from '@/hooks/useScreenSize';
import styles from '@/styles/forms.module.css';

const TableReport = ({ dataTicket, typeReport, loadData }) => {
  const isMobile = useScreenSize();
  const tableRefResumen = useRef();
  const tableRefDetalle = useRef();
  const { onDownload } = useDownloadExcel({
    // currentTableRef: tableRefResumen.current,
    currentTableRef:
      typeReport === 'resumen'
        ? tableRefResumen.current
        : tableRefDetalle.current,
    filename:
      typeReport === 'resumen'
        ? `Resumen tiempos soporte x Ticket`
        : `Detalle tiempos soporte x Solicitud`,
    sheet: 'Detalle',
  });

  //TODO:|Este estado sirve para extraer los tickets unicos cuando se genere reporte por detalle, ya que en ese caso
  //TODO:|Se tiene cada solicitud y dentro de ella se repite el MTR_TICKET por lo que para tener la sumatoria total de tiempo
  //TODO:|Se duplicaria si existiera varias solicitudes en un solo ticket, por ende se extrae los tickets únicos para ese caso
  //TODO:|Y usar el nuevo array para que este realiza la sumatoria en el caso de reporte detallado por solicitud.
  const [ticketsUnique, setTicketsUnique] = useState([]);
  const [showColumn, setShowColumn] = useState(true);

  useEffect(() => {
    if (typeReport === 'detalle') {
      const ids = new Set(); //*Clase de Javascript encargada de excluir valores duplicados
      const unique = [];
      //*Se itera sobre cada solicitud, con la función has() de Set se verifica si existe el id_ticket
      //*Si no existe, con la función add() se añade al listado del Set y se agrega el objeto al nuevo array
      dataTicket.forEach((ticket) => {
        if (!ids.has(ticket.id_ticket)) {
          ids.add(ticket.id_ticket);
          unique.push(ticket);
        }
      });
      setTicketsUnique(unique);
    }
    if (isMobile) {
      setShowColumn(false);
    }
  }, [typeReport, isMobile]);

  console.log(typeReport);
  console.log(loadData);
  console.log(ticketsUnique);
  console.log(showColumn);
  return (
    <div className={styles.previewReports}>
      <div
        style={{
          display: 'flex',
          width: '100%',
          padding: '4px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid #444a8d',
          fontSize: '1.2em',
        }}
      >
        <button
          onClick={onDownload}
          className={styles.formButton}
          id={styles.excelExport}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="100"
            height="100"
            viewBox="0 0 48 48"
          >
            <path
              fill="#169154"
              d="M29,6H15.744C14.781,6,14,6.781,14,7.744v7.259h15V6z"
            ></path>
            <path
              fill="#18482a"
              d="M14,33.054v7.202C14,41.219,14.781,42,15.743,42H29v-8.946H14z"
            ></path>
            <path
              fill="#0c8045"
              d="M14 15.003H29V24.005000000000003H14z"
            ></path>
            <path fill="#17472a" d="M14 24.005H29V33.055H14z"></path>
            <g>
              <path
                fill="#29c27f"
                d="M42.256,6H29v9.003h15V7.744C44,6.781,43.219,6,42.256,6z"
              ></path>
              <path
                fill="#27663f"
                d="M29,33.054V42h13.257C43.219,42,44,41.219,44,40.257v-7.202H29z"
              ></path>
              <path
                fill="#19ac65"
                d="M29 15.003H44V24.005000000000003H29z"
              ></path>
              <path fill="#129652" d="M29 24.005H44V33.055H29z"></path>
            </g>
            <path
              fill="#0c7238"
              d="M22.319,34H5.681C4.753,34,4,33.247,4,32.319V15.681C4,14.753,4.753,14,5.681,14h16.638 C23.247,14,24,14.753,24,15.681v16.638C24,33.247,23.247,34,22.319,34z"
            ></path>
            <path
              fill="#fff"
              d="M9.807 19L12.193 19 14.129 22.754 16.175 19 18.404 19 15.333 24 18.474 29 16.123 29 14.013 25.07 11.912 29 9.526 29 12.719 23.982z"
            ></path>
          </svg>
          Exportar
        </button>
        <h4>
          Tiempo Total:{' '}
          <b style={{ color: '#444a8d' }}>
            {typeReport === 'resumen' &&
              timeFormat(
                dataTicket.reduce((acumulador, ticket) => {
                  return acumulador + Number(ticket.tiempo_real_sop * 1000);
                }, 0)
              )}
            {typeReport === 'detalle' &&
              timeFormat(
                ticketsUnique.reduce((acumulador, ticket) => {
                  return (
                    acumulador +
                    Number(ticket.mtr_tickets.tiempo_real_sop * 1000)
                  );
                }, 0)
              )}
          </b>
        </h4>
      </div>
      {typeReport === 'resumen' && !loadData && (
        <table ref={tableRefResumen}>
          <thead>
            <tr>
              <th>#</th>
              <th>Empresa</th>
              <th>Solicitante</th>
              <th className={!showColumn && 'hideElement'}>ID.Ticket</th>
              <th className={!showColumn && 'hideElement'}>
                Fecha Reg. Ticket
              </th>
              <th>Descripción General Ticket</th>
              <th>F. Inicio Atención</th>
              <th>F. Fin Atención</th>
              <th>Tiempo Real Soporte</th>
              <th>(-) Tiempo Incidencias</th>
              <th>Tiempo Final</th>
              <th className={!showColumn && 'hideElement'}>Cant. Solic</th>
            </tr>
          </thead>
          <tbody>
            {dataTicket.map((register, index) => {
              return (
                <tr key={register.id_ticket}>
                  <td>{index + 1}</td>
                  <td>{register.personal_emp?.empresa.nombre_emp}</td>
                  <td>{register.personal_emp?.nombre}</td>
                  <td className={!showColumn && 'hideElement'}>
                    {register.id_ticket}
                  </td>
                  <td className={!showColumn && 'hideElement'}>
                    {moment(register.fecha_reg).format('DD/MM/YYYY')}
                  </td>
                  <td>{register.descrip_tk}</td>
                  <td>
                    {moment(register.fecha_ini_sop).format(
                      'DD/MM/YYYY - kk:mm:ss'
                    )}
                  </td>
                  <td>
                    {moment(register.fecha_fin_sop).format(
                      'DD/MM/YYYY - kk:mm:ss'
                    )}
                  </td>
                  <td>{timeFormat(register.tiempo_calc_sop * 1000)}</td>
                  <td>
                    {register.tiempo_diferencial
                      ? timeFormat(register.tiempo_diferencial * 1000)
                      : 0}
                  </td>
                  <td>{timeFormat(register.tiempo_real_sop * 1000)}</td>
                  <td className={!showColumn && 'hideElement'}>
                    {register.det_tickets ? register.det_tickets.length : 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr align="center" bgcolor="#d0cfd2">
              <td colSpan="5">
                <strong>Tiempo Total:</strong>
              </td>
              <td colSpan="1">
                <strong>
                  {typeReport === 'resumen' &&
                    timeFormat(
                      dataTicket.reduce((acumulador, ticket) => {
                        return (
                          acumulador + Number(ticket.tiempo_real_sop * 1000)
                        );
                      }, 0)
                    )}
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      {typeReport === 'detalle' && !loadData && (
        <table ref={tableRefDetalle}>
          <thead>
            <tr>
              <th>#</th>
              <th className={!showColumn && 'hideElement'}>Empresa</th>
              <th>Solicitante</th>
              <th className={!showColumn && 'hideElement'}>
                Id.Ticket | Id.solic.
              </th>
              <th className={!showColumn && 'hideElement'}>
                Fecha Reg. Ticket
              </th>
              <th className={!showColumn && 'hideElement'}>
                Descripción General Ticket
              </th>
              <th>F. Inicio Atención Ticket</th>
              <th>F. Fin Atención Ticket</th>
              <th>Detalle Solicitud</th>
              <th className={!showColumn && 'hideElement'}>Agente Asignado</th>
              <th>Tiempo Solicitud</th>
              <th>Detalle Solución</th>
              <th>No Considerar al Total?</th>
            </tr>
          </thead>
          <tbody>
            {dataTicket.map((register, index) => {
              return (
                <tr
                  key={register.id_solicitud}
                  style={register.isError ? { color: 'red' } : {}}
                >
                  <td>{index + 1}</td>
                  <td className={!showColumn && 'hideElement'}>
                    {register.mtr_tickets?.personal_emp.empresa.nombre_emp}
                  </td>
                  <td>{register.mtr_tickets?.personal_emp.nombre}</td>
                  <td
                    className={!showColumn && 'hideElement'}
                  >{`${register.id_ticket} | ${register.id_solicitud}`}</td>
                  <td className={!showColumn && 'hideElement'}>
                    {moment(register.mtr_tickets?.fecha_reg).format(
                      'DD/MM/YYYY'
                    )}
                  </td>
                  <td className={!showColumn && 'hideElement'}>
                    {register.mtr_tickets?.descrip_tk}
                  </td>
                  <td>
                    {moment(register.mtr_tickets?.fecha_ini_sop).format(
                      'DD/MM/YYYY - kk:mm:ss'
                    )}
                  </td>
                  <td>
                    {moment(register.mtr_tickets?.fecha_fin_sop).format(
                      'DD/MM/YYYY - kk:mm:ss'
                    )}
                  </td>
                  <td>{register.descripcion}</td>
                  <td className={!showColumn && 'hideElement'}>
                    {register.agentes_sop?.nombre}
                  </td>
                  <td>
                    {timeFormat(
                      register.control_tickets
                        ?.filter((control) => {
                          return (
                            control.id_solicitud === register.id_solicitud &&
                            control.id_ticket === register.id_ticket
                          );
                        })
                        .reduce((acumulador, control) => {
                          return (
                            acumulador + Number(control.tiempo_calc * 1000)
                          );
                        }, 0)
                    )}
                  </td>
                  <td>{register.solucion}</td>
                  <td>{register.isError ? 'X' : ''}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr align="center" bgcolor="#d0cfd2">
              <td colSpan="6">
                <strong>Tiempo Total:</strong>
              </td>
              <td colSpan="1">
                <strong>
                  {typeReport === 'detalle' &&
                    timeFormat(
                      ticketsUnique.reduce((acumulador, ticket) => {
                        return (
                          acumulador +
                          Number(ticket.mtr_tickets.tiempo_real_sop * 1000)
                        );
                      }, 0)
                    )}
                </strong>
              </td>
            </tr>
          </tfoot>
        </table>
      )}
    </div>
  );
};

export default TableReport;
