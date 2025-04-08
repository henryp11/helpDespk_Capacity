'use client';
import React, { useState, useEffect } from 'react';
import ModuleCard from '../components/ModuleCard';
import EstatusAgente from '@/components/EstatusAgente';
import useApiTickets from '@/hooks/useApiTickets'; //Traere los tickets en atención para agentes
import styles from '../styles/modulGeneral.module.css';

//Opciones a mostrar para el modulo de Empresas por perfil
const modEmpresasAdmin = [
  {
    idOption: 1,
    descrip: 'Gestión de empresas/clientes',
    route: '/empresas',
  },
  {
    idOption: 2,
    descrip: 'Gestión Personal para Empresa',
    route: '/personalEmp',
  },
  {
    idOption: 3,
    descrip: 'Detalle soporte recibido',
    route: '/reports',
  },
];
const modEmpresasSup = [
  {
    idOption: 1,
    descrip: 'Gestión Personal para Empresa',
    route: '/personalEmp',
  },
  {
    idOption: 2,
    descrip: 'Detalle soporte recibido',
    route: '/reports',
  },
];
//Opciones a mostrar para el modulo de Tickets por perfil
const modTicketsClients = [
  {
    idOption: 1,
    descrip: 'Registrar tickets y solicitudes de soporte',
    route: '/tickets/new',
  },
  {
    idOption: 2,
    descrip: 'Seguimiento / edición de tickets y solicitudes',
    route: '/tracking/allTickets',
  },
  {
    idOption: 3,
    descrip: 'Consultar historial de tickets y solicitudes realizadas',
    route: '/tickets/allTickets',
  },
];
const modTicketsAdmin = [
  {
    idOption: 1,
    descrip: 'Registrar ticket de soporte (extemporaneo)',
    route: '/tickets/new',
  },
  {
    idOption: 2,
    descrip: 'Seguimiento de ticket en proceso',
    route: '/tracking/allTickets',
  },
  {
    idOption: 3,
    descrip: 'Consultar historial de tickets y solicitudes realizadas',
    route: '/tickets/allTickets',
  },
];
const modTicketsAgents = [
  {
    idOption: 1,
    descrip: 'Solicitudes Pendientes de Asignar un Agente',
    route: '/support/allTickets',
  },
  {
    idOption: 2,
    descrip: 'Solicitudes que se te han asignado',
    route: '/support/allTicketsAsign',
  },
  {
    idOption: 3,
    descrip: 'Ingresar Ticket Extemporaneo',
    route: '/tickets/ticketExt',
  },
  {
    idOption: 4,
    descrip: 'Historial de tickets atendidos del Agente',
    route: '/support/supportAgent',
  },
  {
    idOption: 5,
    descrip: 'Consultar historial de tickets y solicitudes realizadas',
    route: '/tickets/allTickets',
  },
];

const ModulesMain = ({ userName }) => {
  const {
    getSolicitudEstatus,
    dataSolicEstatus,
    load,
    statusError,
    error,
    messageError,
  } = useApiTickets();

  const [payloadJwt, setPayloadJwt] = useState({});

  useEffect(() => {
    //Obtengo las variables del LocalStorage
    const payloadLS = localStorage.getItem('payload');
    //Si existen las variables, se las transforma en JSON para su uso
    const payloadStorage = payloadLS && JSON.parse(payloadLS);
    payloadLS && setPayloadJwt(payloadStorage);

    if (payloadStorage.perfil === 'agente') {
      getSolicitudEstatus();
    }
  }, []);

  return (
    <section className={styles.containerModGeneral}>
      <h4 style={{ width: '100%', textAlign: 'center' }}>
        Saludos {userName} - Da clic en un módulo para usar sus opciones.
      </h4>
      {payloadJwt.perfil !== 'cliente' && payloadJwt.perfil !== 'agente' && (
        <ModuleCard
          name="Gestión Empresas"
          moduleDescrip="Gestión de empresas/clientes que solicitarán soporte"
          icon={
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
                d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
              />
            </svg>
          }
          optionLinks={
            payloadJwt.perfil === 'admin' ? modEmpresasAdmin : modEmpresasSup
          }
        />
      )}

      {payloadJwt.perfil === 'admin' && (
        <ModuleCard
          name="Gestión Comercial"
          moduleDescrip="Gestión de políticas del negocio, planes de mantenimiento y contratos"
          icon={
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
                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75"
              />
            </svg>
          }
          optionLinks={[
            {
              idOption: 1,
              descrip: 'Gestión Planes Mantenimiento',
              route: '/planes',
            },
            {
              idOption: 2,
              descrip: 'Gestión Contratos',
              route: '/contratos',
            },
            {
              idOption: 3,
              descrip: 'Detalle Soporte de todas las empresas',
              route: '/reports',
            },
          ]}
        />
      )}

      {payloadJwt.perfil === 'admin' && (
        <ModuleCard
          name="Agentes de Soporte"
          moduleDescrip="Gestión de personal/agentes que brindarán atención a los clientes, manejo de horarios y control del personal"
          icon={
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
                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              />
            </svg>
          }
          optionLinks={[
            {
              idOption: 1,
              descrip: 'Gestión Agentes de Soporte',
              route: '/agentes',
            },
            {
              idOption: 2,
              descrip: 'Gestión Horarios',
              route: '/horarios',
            },
            {
              idOption: 3,
              descrip: 'Control Soporte por Agente',
              route: '/reports',
            },
          ]}
        />
      )}
      <ModuleCard
        name="Gestión de Tickets"
        moduleDescrip="Control / seguimineto y atención a tickets y solicitudes de soporte "
        icon={
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
              d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
            />
          </svg>
        }
        optionLinks={
          payloadJwt.perfil === 'admin'
            ? modTicketsAdmin
            : payloadJwt.perfil === 'agente'
            ? modTicketsAgents
            : modTicketsClients
        }
      />
      {payloadJwt.perfil === 'admin' && (
        <ModuleCard
          name="Módulo Administración"
          moduleDescrip="Gestión de usuario, permisos, definición de categorias de soporte, tipos de soporte y gestión de reportes"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M17.004 10.407c.138.435-.216.842-.672.842h-3.465a.75.75 0 01-.65-.375l-1.732-3c-.229-.396-.053-.907.393-1.004a5.252 5.252 0 016.126 3.537zM8.12 8.464c.307-.338.838-.235 1.066.16l1.732 3a.75.75 0 010 .75l-1.732 3.001c-.229.396-.76.498-1.067.16A5.231 5.231 0 016.75 12c0-1.362.519-2.603 1.37-3.536zM10.878 17.13c-.447-.097-.623-.608-.394-1.003l1.733-3.003a.75.75 0 01.65-.375h3.465c.457 0 .81.408.672.843a5.252 5.252 0 01-6.126 3.538z" />
              <path
                fillRule="evenodd"
                d="M21 12.75a.75.75 0 000-1.5h-.783a8.22 8.22 0 00-.237-1.357l.734-.267a.75.75 0 10-.513-1.41l-.735.268a8.24 8.24 0 00-.689-1.191l.6-.504a.75.75 0 10-.964-1.149l-.6.504a8.3 8.3 0 00-1.054-.885l.391-.678a.75.75 0 10-1.299-.75l-.39.677a8.188 8.188 0 00-1.295-.471l.136-.77a.75.75 0 00-1.477-.26l-.136.77a8.364 8.364 0 00-1.377 0l-.136-.77a.75.75 0 10-1.477.26l.136.77c-.448.121-.88.28-1.294.47l-.39-.676a.75.75 0 00-1.3.75l.392.678a8.29 8.29 0 00-1.054.885l-.6-.504a.75.75 0 00-.965 1.149l.6.503a8.243 8.243 0 00-.689 1.192L3.8 8.217a.75.75 0 10-.513 1.41l.735.267a8.222 8.222 0 00-.238 1.355h-.783a.75.75 0 000 1.5h.783c.042.464.122.917.238 1.356l-.735.268a.75.75 0 10.513 1.41l.735-.268c.197.417.428.816.69 1.192l-.6.504a.75.75 0 10.963 1.149l.601-.505c.326.323.679.62 1.054.885l-.392.68a.75.75 0 101.3.75l.39-.679c.414.192.847.35 1.294.471l-.136.771a.75.75 0 101.477.26l.137-.772a8.376 8.376 0 001.376 0l.136.773a.75.75 0 101.477-.26l-.136-.772a8.19 8.19 0 001.294-.47l.391.677a.75.75 0 101.3-.75l-.393-.679a8.282 8.282 0 001.054-.885l.601.504a.75.75 0 10.964-1.15l-.6-.503a8.24 8.24 0 00.69-1.191l.735.268a.75.75 0 10.512-1.41l-.734-.268c.115-.438.195-.892.237-1.356h.784zm-2.657-3.06a6.744 6.744 0 00-1.19-2.053 6.784 6.784 0 00-1.82-1.51A6.704 6.704 0 0012 5.25a6.801 6.801 0 00-1.225.111 6.7 6.7 0 00-2.15.792 6.784 6.784 0 00-2.952 3.489.758.758 0 01-.036.099A6.74 6.74 0 005.251 12a6.739 6.739 0 003.355 5.835l.01.006.01.005a6.706 6.706 0 002.203.802c.007 0 .014.002.021.004a6.792 6.792 0 002.301 0l.022-.004a6.707 6.707 0 002.228-.816 6.781 6.781 0 001.762-1.483l.009-.01.009-.012a6.744 6.744 0 001.18-2.064c.253-.708.39-1.47.39-2.264a6.74 6.74 0 00-.408-2.308z"
                clipRule="evenodd"
              />
            </svg>
          }
          optionLinks={[
            {
              idOption: 1,
              descrip: 'Gestión de usuario',
              route: '/usuarios',
            },
            {
              idOption: 2,
              descrip: 'Gestión categorias/tipos de soporte',
              route: '/categorys',
            },
            {
              idOption: 3,
              descrip: 'Reportes',
              route: '/reports',
            },
          ]}
        />
      )}

      {payloadJwt.perfil === 'agente' &&
        (load ? (
          '...loading'
        ) : (
          <EstatusAgente solicByAgente={dataSolicEstatus} />
        ))}
    </section>
  );
};

export default ModulesMain;
