import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link.js';
import moment from 'moment';
import ErrorLayout from '@/components/ErrorLayout';
import TicketsDetails from './TicketsDetails';
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

const GetAllTickets = ({ headersTable, enviroment }) => {
  const {
    getTickets,
    deleteTicket,
    dataTicket,
    payloadJwt,
    load,
    statusError,
    error,
    messageError,
  } = useApiTickets();

  console.log({ entorno: enviroment });

  useEffect(() => {
    if (enviroment === 'tracking') {
      getTickets(true);
    } else {
      //getTickets(false, 10, 1); //Para agregar paginación
      getTickets();
    }
    validateExpToken();
  }, []);

  // Funciones y objetos desde contexto inicial
  const isMobile = useScreenSize();

  const [open, setOpen] = useState(false);
  const [regCapture, setRegCapture] = useState('');
  const [dataRegCap, setDataRegCap] = useState({});
  const { query, setQuery, filteredRegs } = useSearchSimple(
    dataTicket,
    'tickets'
  );

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

  return (
    <div className="mainContainer">
      {/* <MenuLateral /> */}
      <section className="generalContainer">
        <SectionSearch
          query={query}
          setQuery={setQuery}
          placeholder={'Buscar Ticket por su #Ticket / Empresa / Solicitante'}
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
                  key={register.id_ticket}
                  className={
                    register.estatus === 'anulado'
                      ? 'grid_tickets item_detail item_detail_nulled'
                      : 'grid_tickets item_detail'
                  }
                >
                  <span>{register.id_ticket}</span>
                  <span>
                    {register.personal_emp.empresa.nombre_emp} <br />
                    <em>
                      <strong>{register.personal_emp.nombre}</strong>
                    </em>
                  </span>
                  <span>{register.descrip_tk}</span>
                  {register.det_tickets ? (
                    <span>{register.det_tickets.length}</span>
                  ) : (
                    <span>0</span>
                  )}
                  <span>
                    {moment(register.fecha_reg).format('DD/MM/YYYY - kk:mm:ss')}
                  </span>
                  <span>{timeFormat(register.tiempo_real_sop * 1000)}</span>
                  <span
                    style={{
                      border: '2px solid',
                      borderRadius: '8px',
                      fontWeight: '700',
                      color:
                        register.estatus === 'solicitado'
                          ? 'rgb(252, 192, 82)'
                          : register.estatus === 'proceso'
                          ? 'rgb(41 185 125)'
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
                      title="Ver Info adicional Ticket"
                      onClick={() => {
                        if (open) {
                          if (regCapture !== register.id_ticket) {
                            setOpen(false);
                            setRegCapture(register.id_ticket);
                            setDataRegCap({ ...register });
                            setOpen(true);
                          } else {
                            setOpen(false);
                          }
                        } else {
                          setOpen(!open);
                          setRegCapture(register.id_ticket);
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
                    <Link
                      href={`/tickets/${register.id_ticket}?entorno=${enviroment}`}
                      title="Ver detalle solicitudes"
                    >
                      <button title="Ver solicitudes del ticket">
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
                            d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                          />
                        </svg>
                      </button>
                    </Link>
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
                  {regCapture === register.id_ticket && (
                    <TicketsDetails open={open} details={dataRegCap} />
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

export default GetAllTickets;
