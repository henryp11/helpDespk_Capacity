import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link.js';
import ErrorLayout from '../components/ErrorLayout';
//Importo este componente con la función dynamic de Next para deshabilitar el SSR (Server side rendering)
//En este caso es necesario solo esa sección ya que requiero del objeto window para obtener el ancho de la
//pantalla del cliente y en base a ello aplicar cambios en el renderizado para mobile, tablet, laptop y desktop
const HeadersColumns = dynamic(
  () => import('../components/HeadersColumns.js'),
  { ssr: false }
);
import useScreenSize from '../hooks/useScreenSize';
//import MenuLateral from "../components/MenuLateral";
import SectionSearch from '../containers/SectionSearch';
import useSearchSimple from '../hooks/useSearchSimple';
import useApiPlanesMant from '../hooks/useApiPlanesMant';
import { validateExpToken } from '../utils/helpers';

//import styles from "../styles/products.module.css";

const moduleHeaders = {
  classEspec: ['grid-plan'],
  columnTitles: [
    { id: 'col1', name: 'Id.Plan', show: true },
    { id: 'col2', name: 'Descripción', show: true },
    { id: 'col3', name: 'Días Vigencia', show: true },
    { id: 'col4', name: 'Horas Soporte', show: true },
  ],
};

const Planes = () => {
  const {
    getPlanes,
    deletePlan,
    dataPlan,
    payloadJwt,
    load,
    statusError,
    error,
    messageError,
  } = useApiPlanesMant();

  useEffect(() => {
    getPlanes();
    validateExpToken();
  }, []);

  const isMobile = useScreenSize();
  const { query, setQuery, filteredRegs } = useSearchSimple(dataPlan, 'planes');

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
          placeholder={'Buscar Plan por Nombre / Id / Días vigencia'}
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
            <Link href="/planes/new">
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
                  key={register.id_plan}
                  className={
                    !register.estatus
                      ? 'item_grid item_detail grid-plan item_detail_nulled'
                      : 'item_grid item_detail grid-plan'
                  }
                >
                  <span>{register.id_plan}</span>
                  <span>{`${register.nombre_plan} [${register.abrev}]`}</span>
                  <span>{register.dias_vigencia}</span>
                  <span>{register.horas_sop}</span>
                  <span className="icons-container">
                    <Link href={`/planes/${register.id_plan}?edit=true`}>
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
                        deletePlan(
                          register.id_plan,
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
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Planes;
