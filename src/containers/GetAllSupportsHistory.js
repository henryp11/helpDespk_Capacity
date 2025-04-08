'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link.js';
import { usePathname } from 'next/navigation';
import moment from 'moment';
import ErrorLayout from '@/components/ErrorLayout';
import SolicitudDetails from './SolicitudDetails';
//Importo este componente con la función dynamic de Next para deshabilitar el SSR (Server side rendering)
//En este caso es necesario solo esa sección ya que requiero del objeto window para obtener el ancho de la
//pantalla del cliente y en base a ello aplicar cambios en el renderizado para mobile, tablet, laptop y desktop
const HeadersColumns = dynamic(() => import('@/components/HeadersColumns.js'), {
  ssr: false,
});
import useScreenSize from '@/hooks/useScreenSize';
import SectionSearch from '@/containers/SectionSearch';
import useSearchSimple from '@/hooks/useSearchSimple';
import useApiTickets from '@/hooks/useApiTickets';
import { validateExpToken, timeFormat } from '@/utils/helpers';

const GetAllSupportsHistory = ({ headersTable, enviroment, agent }) => {
  const {
    getSolicitudes,
    deleteTicket,
    updateSolicitud,
    dataTicket,
    payloadJwt,
    load,
    statusError,
    error,
    messageError,
  } = useApiTickets();
  const ruta = usePathname();

  console.log(payloadJwt);
  console.log({ entorno: enviroment });
  console.log({ agenteOk: agent, idAgenteTkn: payloadJwt.agSop });

  useEffect(() => {
    getDataSolicitudes();
    validateExpToken();
  }, [ruta]);

  // Funciones y objetos desde contexto inicial
  const isMobile = useScreenSize();

  const [open, setOpen] = useState(false);
  const [regCapture, setRegCapture] = useState('');
  const [dataRegCap, setDataRegCap] = useState({});
  const { query, setQuery, filteredRegs } = useSearchSimple(
    dataTicket,
    'solicitudes'
  );

  const getDataSolicitudes = () => {
    if (agent) {
      getSolicitudes(false, false, agent); //Para ver historial de solicitudes del agente
    } else {
      getSolicitudes();
    }
  };

  if (error) {
    console.log({ message: messageError, code: statusError });
    return (
      <div
        style={{
          display: 'flex',
          'flex-direction': 'column',
          'justify-content': 'center',
          'align-items': 'center',
        }}
      >
        <ErrorLayout messageError={messageError} statusCode={statusError} />
        <span className="icons-container">
          <button
            className="reloadButton"
            onClick={() => {
              window.location.reload();
            }}
          >
            Recargar
          </button>
        </span>
      </div>
    );
  }

  console.log({ userId: payloadJwt.sub, userRol: payloadJwt.perfil });
  console.log(dataTicket);

  return (
    <div className="mainContainer">
      <section className="generalContainer">
        <SectionSearch
          query={query}
          setQuery={setQuery}
          title={'Solicitudes Atendidas'}
          placeholder={
            !isMobile
              ? 'Buscar por: #Ticket / #Solicitud / Empresa / Solicitante / Descrip. General'
              : 'Buscar por: #Ticket / #Solicitud / Empresa / Solicitante'
          }
        />
        <HeadersColumns
          classEsp={headersTable.classEspec}
          columnTitles={
            isMobile
              ? headersTable.columnTitles.map((column) => {
                  if (
                    column.id !== 'col4' &&
                    column.id !== 'col5' &&
                    column.id !== 'col6' &&
                    column.id !== 'col7'
                  )
                    return column;
                  return { ...column, show: false };
                })
              : headersTable.columnTitles
          }
        />
        {load ? (
          <h1>loading...</h1>
        ) : (
          <div className="generalContainerDetails">
            {!load && filteredRegs.length <= 0 && <p>No Existen Registros</p>}
            {filteredRegs.map((register, index) => {
              return (
                <div
                  key={`${register.id_ticket}-${register.id_solicitud}`}
                  className={
                    register.estatus === 'anulado'
                      ? 'grid_solicitudes_historico item_detail item_detail_nulled'
                      : 'grid_solicitudes_historico item_detail'
                  }
                >
                  <span className="counter">{index + 1}</span>
                  <span>
                    {register.id_ticket}-{register.id_solicitud}
                  </span>
                  <span>
                    <i>
                      {register.mtr_tickets.personal_emp?.empresa.nombre_emp}
                    </i>{' '}
                    <br />
                    <b>{register.mtr_tickets.personal_emp?.nombre}</b>
                  </span>
                  <span>
                    {moment(register.mtr_tickets.fecha_reg).format(
                      'DD/MM/YYYY - kk:mm:ss'
                    )}
                  </span>
                  <span>
                    {moment(register.fecha_ini_solucion).format(
                      'DD/MM/YYYY - kk:mm:ss'
                    )}
                  </span>
                  <span>
                    {moment(register.fecha_fin_solucion).format(
                      'DD/MM/YYYY - kk:mm:ss'
                    )}
                  </span>

                  <span className="hideElement">
                    {register.mtr_tickets.categorias_sop
                      ? register.mtr_tickets.categorias_sop.descrip
                      : '-'}
                  </span>
                  <span className="hideElement">
                    {register.mtr_tickets.descrip_tk}
                  </span>
                  <span className="hideElement">
                    {register.agentes_sop?.nombre}
                  </span>
                  <span className="hideElement">
                    {timeFormat(
                      register.control_tickets
                        .filter((controlSolicitud) => {
                          return (
                            controlSolicitud.id_solicitud ===
                            register.id_solicitud
                          );
                        })
                        .reduce((acumulador, control) => {
                          return (
                            acumulador + Number(control.tiempo_calc * 1000)
                          );
                        }, 0)
                    )}
                  </span>
                  <span
                    style={{
                      border: '2px solid',
                      borderRadius: '8px',
                      fontWeight: '700',
                      color:
                        register.estatus === 'pendiente'
                          ? 'rgb(177, 55, 55)'
                          : register.estatus === 'asignado'
                          ? 'rgb(128, 196, 223)'
                          : register.estatus === 'proceso'
                          ? 'rgb(41 185 125)'
                          : register.estatus === 'pausado'
                          ? 'rgb(216, 163, 66)'
                          : register.estatus === 'reasignado'
                          ? 'rgb(42, 88, 238)'
                          : register.estatus === 'finalizado'
                          ? 'rgb(197, 78, 201)'
                          : 'rgb(179, 179, 179)',
                    }}
                  >
                    {register.estatus}
                  </span>
                  <span
                    className="icons-container"
                    style={{ justifyContent: 'center', gap: '0 15px' }}
                  >
                    <button
                      title="Ver resumen de la solicitud"
                      onClick={() => {
                        if (open) {
                          if (regCapture !== register.id_solicitud) {
                            setOpen(false);
                            setRegCapture(register.id_solicitud);
                            setDataRegCap({ ...register });
                            setOpen(true);
                          } else {
                            setOpen(false);
                          }
                        } else {
                          setOpen(!open);
                          setRegCapture(register.id_solicitud);
                          setDataRegCap({ ...register });
                        }
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
                          d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                        />
                      </svg>
                    </button>
                  </span>
                  {regCapture === register.id_solicitud && (
                    <SolicitudDetails
                      open={open}
                      details={dataRegCap}
                      estatus={register.estatus}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default GetAllSupportsHistory;
