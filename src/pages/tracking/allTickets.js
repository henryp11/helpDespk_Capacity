import React from 'react';
import GetAllTickets from '@/containers/GetAllTickets';

const moduleHeaders = {
  classEspec: ['grid_tickets'],
  columnTitles: [
    { id: 'col0', name: '#', show: true },
    { id: 'col1', name: 'Id. ticket', show: true },
    { id: 'col2', name: 'Empresa', show: true },
    { id: 'col3', name: 'Descrip. General Ticket', show: true },
    { id: 'col4', name: 'Categoría', show: true },
    { id: 'col5', name: '# Solic.', show: true },
    { id: 'col6', name: 'F. Registro', show: true },
    { id: 'col7', name: 'Tiempo', show: true },
    { id: 'col8', name: 'Estado', show: true },
  ],
};

const AllTickets = () => {
  return <GetAllTickets headersTable={moduleHeaders} enviroment="tracking" />;
};

export default AllTickets;
