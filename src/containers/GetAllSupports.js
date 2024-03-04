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
import { validateExpToken } from '@/utils/helpers';

const GetAllSupport = ({ headersTable, enviroment, agent }) => {
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
  console.log({ agenteOk: agent, iAgenteTkn: payloadJwt.agSop });

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
      getSolicitudes(true, false, agent); //Para ver solicitudes asginadas a un agente
    } else if (enviroment === 'tracking') {
      getSolicitudes(true, true); //Para ver solicitudes pendientes sin Agente
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
      {/* <MenuLateral /> */}
      <section className="generalContainer">
        <SectionSearch
          query={query}
          setQuery={setQuery}
          placeholder={
            'Buscar Solicitud por #Ticket / #Solicitud / Empresa / Solicitante / Descrip. General'
          }
        />
        <HeadersColumns
          classEsp={headersTable.classEspec}
          columnTitles={
            isMobile
              ? headersTable.columnTitles.map((column) => {
                  if (column.id !== 'col4') return column;
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
            {filteredRegs.map((register) => {
              return (
                <div
                  key={`${register.id_ticket}-${register.id_solicitud}`}
                  className={
                    register.estatus === 'anulado'
                      ? 'grid_solicitudes item_detail item_detail_nulled'
                      : 'grid_solicitudes item_detail'
                  }
                >
                  <span>
                    {register.id_ticket}-{register.id_solicitud}
                  </span>
                  <span>
                    {moment(register.mtr_tickets.fecha_reg).format(
                      'DD/MM/YYYY - kk:mm:ss'
                    )}
                  </span>
                  <span>
                    <i>
                      {register.mtr_tickets.personal_emp.empresa.nombre_emp}
                    </i>{' '}
                    <br />
                    <b>{register.mtr_tickets.personal_emp.nombre}</b>
                  </span>
                  <span>{register.mtr_tickets.prioridad}</span>
                  <span>{register.mtr_tickets.descrip_tk}</span>
                  <span>{register.agente_asig}</span>
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
                    {!agent && (
                      <button
                        title="Tomar Solicitud"
                        onClick={() => {
                          updateSolicitud(
                            register.id_ticket,
                            register.id_solicitud,
                            {
                              estatus: 'asignado',
                              agente_asig: payloadJwt.agSop,
                            },
                            true
                          );
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          dataSlot="icon"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002"
                          />
                        </svg>
                      </button>
                    )}
                    {agent && (
                      <Link
                        href={`/support/${register.id_ticket}/${register.id_solicitud}`}
                      >
                        <button title="Iniciar/Continuar Atención">
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
                              d="M21 7.5V18M15 7.5V18M3 16.811V8.69c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811Z"
                            />
                          </svg>
                        </button>
                      </Link>
                    )}

                    {payloadJwt.perfil === 'admin' && (
                      <button
                        title="Eliminación integra del Ticket"
                        onClick={() => {
                          deleteTicket(
                            register.id_ticket,
                            '¿Desea eliminar el registro seleccionado?'
                          );
                        }}
                        className="delete"
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
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    )}
                  </span>
                  {regCapture === register.id_solicitud && (
                    <SolicitudDetails open={open} details={dataRegCap} />
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

export default GetAllSupport;
