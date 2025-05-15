'use client';
import React from 'react';
import GetAllSupportsHistory from '@/containers/GetAllSupportsHistory';

const moduleHeaders = {
  classEspec: ['grid_solicitudes_historico'],
  columnTitles: [
    { id: 'col0', name: '#', show: true },
    { id: 'col1', name: 'id.Tkt | id.Sol', show: true },
    { id: 'col2', name: 'Empresa | Solicitante', show: true },
    { id: 'col3', name: 'F.Registro', show: true },
    { id: 'col4', name: 'F.Inicio Sop.', show: true },
    { id: 'col5', name: 'F.Fin Sop.', show: true },
    { id: 'col6', name: 'Categoría', show: true },
    { id: 'col7', name: 'Descrip. General Ticket', show: true },
    { id: 'col8', name: 'Agente Asig.', show: true },
    { id: 'col9', name: 'Tiempo Soporte', show: true },
    { id: 'col10', name: 'Estado', show: true },
  ],
};

const AllTickets = () => {
  return <GetAllSupportsHistory headersTable={moduleHeaders} agent={true} />;
};

export default AllTickets;
