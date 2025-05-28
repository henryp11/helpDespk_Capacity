// En este componente separo la lógica de llamado a la API usando custom hook
// donde se envía el dato de la API como parametro
//y mediante el hook de useEffect retorno el valor del estado que deseo utilizar

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
const API = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/v1/tickets`;
const API_DET = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/v1/detalle-tickets`;
const API_CTR = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/v1/control-tickets`;
const API_AGE = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/v1/agentes`;
// const API_CAT = 'http://localhost:3000/api/v1/category';

const useApiTickets = () => {
  const router = useRouter();
  const [dataTicket, setDataTicket] = useState([]);
  const [amountTickets, setAmountTickets] = useState(0);
  const [token, setToken] = useState('');
  const [payloadJwt, setPayloadJwt] = useState({});
  const [error, setError] = useState(false);
  const [load, setLoad] = useState(true);
  const [messageError, setMessageError] = useState({});
  const [statusError, setStatusError] = useState('');
  const [pagesTotal, setPagesTotal] = useState([]);
  const [dataSolicEstatus, setDataSolicEstatus] = useState([]);

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

  //Obtiene todos los tickets, usa como parámetro "tracking" el cual
  //si es true quita los tickets finalizados y anulados (para ver tickets en proceso), si es false muestra todos (para historial).
  const getTickets = async (tracking, limit, offset) => {
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    const payloadLS = localStorage.getItem('payload');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    const payloadStorage = payloadLS && JSON.parse(payloadLS);
    try {
      console.log({ rastreoActivo: tracking });
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
        params: {
          rol: payloadStorage.perfil,
          idemp: payloadStorage.idEmp,
          idclient: payloadStorage.idClient,
          tracking: tracking || false, //Se usa el estatus (de la BD) cuando quiero quitar los tickets finalizados y anulados caso de tracking
        },
      };
      //Para Paginación
      if (limit) {
        axiosConfig.params.limit = limit;
        axiosConfig.params.offset = offset;
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

  //Trae el número total de registros en la tabla ticket, se verifica si es historico o tracking,
  //la cantOffset es el número de registros a mostrar en cada página para calcular el total de páginas y cuantos registros por offsets para el array de páginas
  const getcountTickets = async (tracking, cantOffset) => {
    const API_COUNT = `${API}/count`;
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
        params: {
          rol: payloadStorage.perfil,
          idemp: payloadStorage.idEmp,
          idclient: payloadStorage.idClient,
          tracking: tracking || false, //Se usa el estatus (de la BD) cuando quiero quitar los tickets finalizados y anulados caso de tracking
        },
      };
      const response = await axios.get(API_COUNT, axiosConfig);
      if (response) {
        console.log(response);
        setAmountTickets(response.data); //Se obtiene el total de tickets
        const totPag = Math.ceil(response.data / cantOffset); //Se obtiene el total de páginas
        let arrayPag = [];
        //Se crea un array con el número de páginas para posterior selección
        for (let index = 0; index < totPag; index++) {
          arrayPag[index] = { pag: index, offset: cantOffset * index };
        }
        setPagesTotal(arrayPag);
      }
    } catch (error) {
      showError(error);
    }
  };

  //Obtiene todas los solicitudes, usa como parámetro:
  //"tracking": si es true quita los tickets finalizados y anulados (para ver tickets en proceso), si es false muestra todos (para historial).
  //"assigment": muestra las solicitudes asignadas a un agente, si es false muestra las solicitudes pendientes de asignar
  //"agent": obtiene del Storage el id del agente para su filtro
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

  //Obtiene las solicitudes filtrado por estatus de agentes para mostrar la cantidad de solicitudes con sus estatus
  //A cada agente para que se pueda ver quien esta atendiendo y cuantas solicitudes atiende.
  const getSolicitudEstatus = async () => {
    const API_PARAMS = `${API_AGE}/solicAgentes`;
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
      setLoad(true);
      const response = await axios.get(API_PARAMS, axiosConfig);
      if (response) {
        // setPayloadJwt(payloadStorage);
        setDataSolicEstatus(response.data);
        setLoad(false);
      }
    } catch (error) {
      setLoad(false);
      showError(error);
    }
  };

  // const getTicketByRuc = async (ruc) => {
  //   const API_PARAMS = `${API}/ruc`;
  //   //Obtengo las variables del LocalStorage
  //   const tokenLS = localStorage.getItem('jwt');
  //   //Si existen las variables, se las transforma en JSON para su uso
  //   const tokenStorage = tokenLS && JSON.parse(tokenLS);
  //   try {
  //     let axiosConfig = {
  //       headers: {
  //         Authorization: `Bearer ${tokenStorage}`,
  //       },
  //       params: { ruc: ruc },
  //     };
  //     const response = await axios.get(API_PARAMS, axiosConfig);
  //     if (response) {
  //       // setToken(tokenStorage);
  //       //En este caso retorno la promesa de la respuesta a la API la cual me entrega los datos de la consulta
  //       return response.data;
  //     }
  //   } catch (error) {
  //     showError(error);
  //   }
  // };

  //Crear nueva Ticket
  const postTickets = async (data) => {
    const tokenLS = localStorage.getItem('jwt');
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    try {
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
      };
      const response = await axios.post(API, data, axiosConfig);
      if (response) {
        //Muestro el mensaje de retorno de la API
        console.log(response);
        setToken(tokenStorage);
        toast.success(response.data.message, { duration: 5000 });
        console.log(response.data.newRegister);
        localStorage.setItem(
          'ticket',
          JSON.stringify(response.data.newRegister)
        ); //Una vez se crea el ticket, lo guardo en  el localStorage
        const ticketNew = response.data.newRegister;
        return ticketNew;
      }
    } catch (error) {
      showError(error);
    }
  };

  const postSolicitud = async (data, id_ticket) => {
    const tokenLS = localStorage.getItem('jwt');
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    try {
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
      };
      const response = await axios.post(
        `${API_DET}/${id_ticket}`,
        data,
        axiosConfig
      );
      if (response) {
        //Muestro el mensaje de retorno de la API
        console.log(response);
        setToken(tokenStorage);
        toast.success(response.data.message);
        console.log(response.data.newRegister);
        const solicitudNew = response.data.newRegister;
        return solicitudNew;
      }
    } catch (error) {
      showError(error);
    }
  };

  const postControl = async (data, id_ticket, id_solicitud) => {
    const tokenLS = localStorage.getItem('jwt');
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    try {
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
      };
      const response = await axios.post(
        `${API_CTR}/${id_ticket}/${id_solicitud}`,
        data,
        axiosConfig
      );
      if (response) {
        //Muestro el mensaje de retorno de la API
        console.log(response);
        setToken(tokenStorage);
        toast.success(response.data.message);
        console.log(response.data.newRegister);
        const solicitudNew = response.data.newRegister;
        return solicitudNew;
      }
    } catch (error) {
      showError(error);
    }
  };

  const updateSolicitud = async (
    id_ticket,
    id_solicitud,
    dataUpdate,
    assign,
    redirect,
    dataMail
  ) => {
    const API_PARAMS = `${API_DET}/${id_ticket}/${id_solicitud}`;
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    try {
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
      };
      const response = await axios.patch(API_PARAMS, dataUpdate, axiosConfig);
      if (response) {
        toast.success(response.data.message);
        //*Assign = true para recargar la página al momento de asignar el agente
        //*Se envía cuerpo de correo para enviar mail de ticket asignado agente
        if (assign) {
          toast.success('Solicitud asignada con éxito');
          // Llamar api para envío de correo al cliente de solicitud asignada y cual agente se asignó
          const dataToMail = {
            id_ticket: id_ticket,
            id_solicitud: id_solicitud,
            emailClient: dataMail.email,
            agente: dataMail.nameAgente,
            estatus: dataMail.estatus,
            descripSolic: dataMail.descripSolic,
          };
          try {
            const responseMail = await axios.post(
              `${API_DET}/sendMail/assigned`,
              dataToMail,
              axiosConfig
            );

            if (responseMail) {
              //Muestro el mensaje de retorno de la API de mail enviado con éxito
              console.log(responseMail.data.message);
              toast.success(responseMail.data.message);
              getSolicitudes(true, true);
            }
          } catch (error) {
            console.log(error);
            toast.error('No se pudo enviar el correo de asignación');
            getSolicitudes(true, true);
          }
        }
        //*Se arma cuerpo de correo para enviar mail de inicio del proceso de la solicitud
        if (dataMail && dataMail.estatus === 2) {
          console.log('verificacion ingresa a solicitud en proceso');
          // Llamar api para envío de correo al cliente de solicitud Iniciada
          const dataToMail = {
            id_ticket: id_ticket,
            id_solicitud: id_solicitud,
            emailClient: dataMail.email,
            agente: dataMail.nameAgente,
            estatus: dataMail.estatus,
            descripSolic: dataMail.descripSolic,
          };
          try {
            const responseMail = await axios.post(
              `${API_DET}/sendMail/assigned`,
              dataToMail,
              axiosConfig
            );

            if (responseMail) {
              //Muestro el mensaje de retorno de la API de mail enviado con éxito
              console.log(responseMail.data.message);
              toast.success(responseMail.data.message);
            }
          } catch (error) {
            console.log(error);
            toast.error(
              'No se pudo enviar el correo para indicar el inicio del soporte'
            );
          }
        }

        //*Si "redirect=true" se redirecciona a la página principal de solicitudes, usado cuando se finaliza una solicitud
        //Se envía cuerpo de correo para enviar mail de finalización de la solicitud
        if (redirect) {
          toast.success('Solicitud Finalizada');

          toast('...Enviando Correo', {
            icon: '🚀',
            style: {
              borderRadius: '12px',
              background: '#3bc9db',
            },
          });

          // Llamar api para envío de correo al cliente de solicitud Finalizada
          const dataToMail = {
            id_ticket: id_ticket,
            id_solicitud: id_solicitud,
            emailClient: dataMail.email,
            agente: dataMail.nameAgente,
            estatus: dataMail.estatus,
            descripSolic: dataMail.descripSolic,
            detSolucion: dataMail.detSolucion,
          };
          try {
            const responseMail = await axios.post(
              `${API_DET}/sendMail/assigned`,
              dataToMail,
              axiosConfig
            );

            if (responseMail) {
              //Muestro el mensaje de retorno de la API
              console.log(responseMail);
              toast.success(responseMail.data.message);
              router.push('/support/allTicketsAsign');
            }
          } catch (error) {
            console.log(error);
            toast.error('No se pudo enviar el correo de finalización');
            router.push('/support/allTicketsAsign');
          }
        }
      }
    } catch (error) {
      showError(error);
    }
  };

  //Trae todas las solicitudes de un ticket
  const getOnlySolicitud = async (id_ticket) => {
    const API_PARAMS = `${API_DET}/${id_ticket}`;
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    try {
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
      };
      const response = await axios.get(API_PARAMS, axiosConfig);
      if (response) {
        console.log(response.data);
        setDataTicket(response.data);
        return response.data;
      }
    } catch (error) {
      showError(error);
    }
  };

  //Obtiene la solicitud especifica del ticket para ser atendida
  const getTicketSolic = async (id_ticket, id_solicitud) => {
    const API_PARAMS = `${API_DET}/${id_ticket}/${id_solicitud}`;
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
        setToken(tokenStorage);
        setPayloadJwt(payloadStorage);
        return response.data;
      }
    } catch (error) {
      showError(error);
    }
  };

  //Actualizar datos de Ticket
  const updateTicket = async (id_ticket, dataUpdate) => {
    const API_PARAMS = `${API}/${id_ticket}`;
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    try {
      let axiosConfig = {
        headers: {
          Authorization: `Bearer ${tokenStorage}`,
        },
      };
      const response = await axios.patch(API_PARAMS, dataUpdate, axiosConfig);
      if (response) {
        toast.success(response.data.message);
      }
    } catch (error) {
      showError(error);
    }
  };

  //Eliminar Ticket
  const deleteTicket = async (id_ticket, message, tracking) => {
    const API_PARAMS = `${API}/${id_ticket}`;
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    toast(
      (t) => (
        <span className="toasterDelete">
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
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <b>{message}</b>
          <span className="toasterButtons">
            <button
              onClick={async () => {
                try {
                  let axiosConfig = {
                    headers: {
                      Authorization: `Bearer ${tokenStorage}`,
                    },
                  };
                  const response = await axios.delete(API_PARAMS, axiosConfig);
                  toast.dismiss(t.id);
                  response && getTickets(tracking); //Una vez eliminado realizo "hotReload" para refrescar datos
                  toast.success(response.data.message, {
                    style: {
                      border: '1px solid rgb(155, 32, 32)',
                      padding: '16px',
                    },
                    iconTheme: {
                      primary: 'rgb(155, 32, 32)',
                      secondary: '#FFFAEE',
                    },
                    duration: 1000,
                  });
                  setTimeout(() => {
                    toast.dismiss();
                  }, 2000);
                } catch (error) {
                  toast.dismiss(t.id);
                  showError(error);
                }
              }}
            >
              SI
            </button>
            <button onClick={() => toast.dismiss(t.id)}>NO</button>
          </span>
        </span>
      ),
      { duration: 60000 }
    );
  };
  //Eliminar Todas las Solicitud de un ticket Ticket Especifico
  const deleteAllSolicitud = async (id_ticket, message, tracking) => {
    const API_PARAMS = `${API_DET}/${id_ticket}`;
    const API_TICKET = `${API}/${id_ticket}`;
    //Obtengo las variables del LocalStorage
    const tokenLS = localStorage.getItem('jwt');
    //Si existen las variables, se las transforma en JSON para su uso
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    toast(
      (t) => (
        <span className="toasterDelete">
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
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <b>{message}</b>
          <span className="toasterButtons">
            <button
              onClick={async () => {
                try {
                  let axiosConfig = {
                    headers: {
                      Authorization: `Bearer ${tokenStorage}`,
                    },
                  };
                  const response = await axios.delete(API_PARAMS, axiosConfig);
                  const response2 = await axios.delete(API_TICKET, axiosConfig); //Este elimina el ticket total
                  toast.dismiss(t.id);
                  response && response2 && getTickets(tracking); //Una vez eliminado realizo "hotReload" para refrescar datos
                  toast.success(response.data.message, {
                    style: {
                      border: '1px solid rgb(155, 32, 32)',
                      padding: '16px',
                    },
                    iconTheme: {
                      primary: 'rgb(155, 32, 32)',
                      secondary: '#FFFAEE',
                    },
                    duration: 1000,
                  });
                  setTimeout(() => {
                    toast.dismiss();
                  }, 2000);
                } catch (error) {
                  toast.dismiss(t.id);
                  showError(error);
                }
              }}
            >
              SI
            </button>
            <button onClick={() => toast.dismiss(t.id)}>NO</button>
          </span>
        </span>
      ),
      { duration: 60000 }
    );
  };
  return {
    getTickets,
    getcountTickets,
    getTicketById,
    postTickets,
    updateTicket,
    deleteTicket,
    getSolicitudes,
    postSolicitud,
    updateSolicitud,
    getOnlySolicitud,
    deleteAllSolicitud,
    getTicketSolic,
    postControl,
    getSolicitudEstatus,
    dataSolicEstatus,
    dataTicket,
    amountTickets,
    pagesTotal,
    token,
    payloadJwt,
    load,
    error,
    statusError,
    messageError,
  };
};

export default useApiTickets;
