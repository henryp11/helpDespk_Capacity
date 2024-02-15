// En este componente separo la lógica de llamado a la API usando custom hook
// donde se envía el dato de la API como parametro
//y mediante el hook de useEffect retorno el valor del estado que deseo utilizar

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
const API = 'http://localhost:3000/api/v1/reports';

const useApiReports = () => {
  const router = useRouter();
  const [dataTicket, setDataTicket] = useState([]);
  const [token, setToken] = useState('');
  const [payloadJwt, setPayloadJwt] = useState({});
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(true);
  const [messageError, setMessageError] = useState({});
  const [statusError, setStatusError] = useState('');

  //Controla los errores a mostrar para todo tipo de petición, invocandolo en el catch
  const showError = (error) => {
    console.error(error);
    setError(true);
    if (typeof error.response.data === 'object') {
      setMessageError([error.response.data.error, error.response.data.message]);
      setStatusError(error.response.data.statusCode);
    } else {
      setMessageError([error.response.data]);
      setStatusError(error.response.status);
    }
  };

  //Consulta todos los tickets para mostrar reportes, se considera filtros
  //de fechas, operadores, empresa y cliente, depende de lo que se envie en sus parámetros
  //el API realizará las respectivas consultas
  const getTickets = async (idemp, idclient, filter, dateini, datefin) => {
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    const payloadLS = localStorage.getItem('payload');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    const payloadStorage = payloadLS && JSON.parse(payloadLS);
    try {
      console.log({
        paramsClient: { idemp, idclient, filter, dateini, datefin },
      });
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
        params: {},
      };
      if (idemp && idemp !== '') {
        axiosConfig.params.idemp = idemp;
      }
      if (idclient && idclient !== '') {
        axiosConfig.params.idclient = idclient;
      }
      if (dateini && dateini !== '') {
        axiosConfig.params.dateini = dateini;
      }
      if (datefin && datefin !== '') {
        axiosConfig.params.datefin = datefin;
      }
      if (filter && filter !== '') {
        axiosConfig.params.filter = filter;
      }
      setLoad(true);
      const response = await axios.get(API, axiosConfig);
      if (response) {
        setToken(tokenStorage);
        setPayloadJwt(payloadStorage);
        console.log(response);
        setDataTicket(response.data);
        setLoad(false);
      }
    } catch (error) {
      setLoad(false);
      showError(error);
    }
  };

  const getSolicitudes = async (tracking, assigment, agent) => {
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    const payloadLS = localStorage.getItem('payload');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    const payloadStorage = payloadLS && JSON.parse(payloadLS);
    try {
      console.log({
        rastreoActivo: tracking,
        assign: assigment,
        agente: agent,
      });
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
        params: {
          tracking: tracking || false, //Se usa el estatus cuando quiero quitar los tickets finalizados y anulados caso de tracking
          assigment: assigment ? true : false,
          agent: agent ? payloadStorage.agSop : '',
        },
      };
      setLoad(true);
      const response = await axios.get(API_DET, axiosConfig);
      if (response) {
        setToken(tokenStorage);
        setPayloadJwt(payloadStorage);
        console.log(response);
        setDataTicket(response.data);
        setLoad(false);
      }
    } catch (error) {
      setLoad(false);
      showError(error);
    }
  };

  //para usar la API que detecte el id_ticket, al usar el método get de la api se debe
  //Cambiar la URL inicial mandando el id_ticket como queryParam de la ruta, por eso al iniciar la función se arma la URL con la API, añadiendo el id_ticket
  //De está forma el API utilizará el método GET especifico para obtener solo el dato del registro a buscar
  const getTicketById = async (id_ticket) => {
    const API_PARAMS = `${API}/${id_ticket}`;
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    const payloadLS = localStorage.getItem('payload');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    const payloadStorage = payloadLS && JSON.parse(payloadLS);

    try {
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
      };
      const response = await axios.get(API_PARAMS, axiosConfig);
      if (response) {
        setPayloadJwt(payloadStorage);
        return response.data;
      }
    } catch (error) {
      showError(error);
    }
  };

  //Trae todas las solicitudes de un ticket
  // const getOnlySolicitud = async (id_ticket) => {
  //   const API_PARAMS = `${API_DET}/${id_ticket}`;
  //   //Obtengo las variables del LocalStorage
  //   const tokenLS = localStorage.getItem('jwt');
  //   //Si existen las variables, se las transforma en JSON para su uso
  //   const tokenStorage = tokenLS && JSON.parse(tokenLS);
  //   try {
  //     let axiosConfig = {
  //       headers: {
  //         Authorization: `Bearer ${tokenStorage}`,
  //       },
  //     };
  //     const response = await axios.get(API_PARAMS, axiosConfig);
  //     if (response) {
  //       console.log(response.data);
  //       setDataTicket(response.data);
  //       return response.data;
  //     }
  //   } catch (error) {
  //     showError(error);
  //   }
  // };

  //Obtiene la solicitud especifica del ticket para ser atendida
  // const getTicketSolic = async (id_ticket, id_solicitud) => {
  //   const API_PARAMS = `${API_DET}/${id_ticket}/${id_solicitud}`;
  //   //Obtengo las variables del LocalStorage
  //   const tokenLS = localStorage.getItem('jwt');
  //   //Si existen las variables, se las transforma en JSON para su uso
  //   const tokenStorage = tokenLS && JSON.parse(tokenLS);
  //   try {
  //     let axiosConfig = {
  //       headers: {
  //         Authorization: `Bearer ${tokenStorage}`,
  //       },
  //     };
  //     const response = await axios.get(API_PARAMS, axiosConfig);
  //     if (response) {
  //       return response.data;
  //     }
  //   } catch (error) {
  //     showError(error);
  //   }
  // };

  return {
    getTickets,
    getTicketById,
    getSolicitudes,
    dataTicket,
    payloadJwt,
    load,
    error,
    statusError,
    messageError,
  };
};

export default useApiReports;
