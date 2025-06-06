'use client';
import React from 'react';
import GetAllSupports from '@/containers/GetAllSupports';

const moduleHeaders = {
  classEspec: ['grid_solicitudes'],
  columnTitles: [
    { id: 'col0', name: '#', show: true },
    { id: 'col1', name: 'id.Tkt | id.Sol', show: true },
    { id: 'col2', name: 'F.Registro', show: true },
    { id: 'col3', name: 'Empresa | Solicitante', show: true },
    { id: 'col4', name: 'Categoría', show: true },
    { id: 'col5', name: 'Prioridad', show: true },
    { id: 'col6', name: 'Descrip. General Ticket', show: true },
    { id: 'col7', name: 'Ult. Agente Asig.', show: true },
    { id: 'col8', name: 'Estado', show: true },
  ],
};

const AllTickets = () => {
  return <GetAllSupports headersTable={moduleHeaders} enviroment="tracking" />;
};

export default AllTickets;
