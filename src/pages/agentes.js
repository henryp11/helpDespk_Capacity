import React, { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link.js';
import AgentesDetails from '@/containers/AgentesDetails';
import ErrorLayout from '../components/ErrorLayout';
//Importo este componente con la función dynamic de Next para deshabilitar el SSR (Server side rendering)
//En este caso es necesario solo esa sección ya que requiero del objeto window para obtener el ancho de la
//pantalla del cliente y en base a ello aplicar cambios en el renderizado para mobile, tablet, laptop y desktop
const HeadersColumns = dynamic(
  () => import('../components/HeadersColumns.js'),
  { ssr: false }
);
import useScreenSize from '../hooks/useScreenSize';
import SectionSearch from '../containers/SectionSearch';
import useSearchSimple from '../hooks/useSearchSimple';
import useApiAgentes from '../hooks/useApiAgentes';
import { validateExpToken } from '../utils/helpers';

const moduleHeaders = {
  classEspec: ['item_grid'],
  columnTitles: [
    { id: 'col1', name: 'Id.Agente', show: true },
    { id: 'col2', name: 'Nombre', show: true },
    { id: 'col3', name: 'Cargo', show: true },
    { id: 'col4', name: 'Nivel', show: true },
    { id: 'col5', name: 'Fecha Ingreso', show: true },
  ],
};

const Agentes = () => {
  const {
    getAgentes,
    deleteAgente,
    dataAgt,
    payloadJwt,
    load,
    statusError,
    error,
    messageError,
  } = useApiAgentes();

  useEffect(() => {
    getAgentes();
    validateExpToken();
  }, []);

  // Funciones y objetos desde contexto inicial
  const isMobile = useScreenSize();

  const [open, setOpen] = useState(false);
  const [regCapture, setRegCapture] = useState('');
  const [dataRegCap, setDataRegCap] = useState({});
  const { query, setQuery, filteredRegs } = useSearchSimple(dataAgt, 'agentes');

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
  console.log(dataAgt);

  return (
    <div className="mainContainer">
      {/* <MenuLateral /> */}
      <section className="generalContainer">
        <SectionSearch
          query={query}
          setQuery={setQuery}
          placeholder={'Buscar Agente por Id / Nombre / Cargo / Nivel'}
        />
        <HeadersColumns
          classEsp={moduleHeaders.classEspec}
          columnTitles={
            isMobile
              ? moduleHeaders.columnTitles.map((column) => {
                  if (column.id !== 'col5') return column;
                  return { ...column, show: false };
                })
              : moduleHeaders.columnTitles
          }
        />
        {load ? (
          <h1>loading...</h1>
        ) : (
          <div className="generalContainerDetails">
            <Link href="/agentes/new">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                id="iconAdd"
                tittle="Crear Nuevo"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </Link>
            {!load && filteredRegs.length <= 0 && <p>No Existen Registros</p>}
            {filteredRegs.map((register) => {
              return (
                <div
                  key={register.id_agente}
                  className={
                    !register.estatus
                      ? 'item_grid item_detail item_detail_nulled'
                      : 'item_grid item_detail'
                  }
                >
                  <span>{register.id_agente}</span>
                  <span>{register.nombre}</span>
                  <span>{register.cargo}</span>
                  <span>{register.nivel_atencion}</span>
                  <span>{register.fecha_ingreso}</span>
                  <span className="icons-container">
                    <button
                      title="Ver Detalles"
                      onClick={() => {
                        if (open) {
                          if (regCapture !== register.id_agente) {
                            setOpen(false);
                            setRegCapture(register.id_agente);
                            setDataRegCap({ ...register });
                            setOpen(true);
                          } else {
                            setOpen(false);
                          }
                        } else {
                          setOpen(!open);
                          setRegCapture(register.id_agente);
                          setDataRegCap({ ...register });
                        }
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                        <path
                          fillRule="evenodd"
                          d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <Link href={`/agentes/${register.id_agente}?edit=true`}>
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
                          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                        />
                      </svg>
                    </Link>
                    <button
                      title="Eliminar"
                      onClick={() => {
                        deleteAgente(
                          register.id_agente,
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
                  </span>
                  {regCapture === register.id_agente && (
                    <AgentesDetails open={open} details={dataRegCap} />
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

export default Agentes;
