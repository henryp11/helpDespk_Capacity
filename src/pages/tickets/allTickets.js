import React from 'react';
import GetAllTickets from '@/containers/GetAllTickets';

const moduleHeaders = {
  classEspec: ['grid_tickets'],
  columnTitles: [
    { id: 'col1', name: 'Id.ticket', show: true },
    { id: 'col2', name: 'Empresa', show: true },
    { id: 'col3', name: 'Prioridad', show: true },
    { id: 'col4', name: 'Descrip. General Ticket', show: true },
    { id: 'col5', name: 'Cant. Solic.', show: true },
    { id: 'col6', name: 'F.Registro', show: true },
    { id: 'col7', name: 'Estado', show: true },
  ],
};

const AllTickets = () => {
  return <GetAllTickets headersTable={moduleHeaders} enviroment="history" />;
};

export default AllTickets;
