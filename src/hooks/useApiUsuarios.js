// En este componente separo la lógica de llamado a la API usando custom hook
// donde se envía el dato de la API como parametro
//y mediante el hook de useEffect retorno el valor del estado que deseo utilizar

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
const API = 'http://localhost:3000/api/v1/users';

const useApiUsuarios = () => {
  const router = useRouter();
  const [dataUser, setDataUser] = useState([]);
  const [token, setToken] = useState('');
  const [payloadJwt, setPayloadJwt] = useState({});
  const [load, setLoad] = useState(true);
  const [error, setError] = useState(false);
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

  //Consulta del personal de todas las empresas
  const getUsuarios = async () => {
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
      const response = await axios.get(API, axiosConfig);
      if (response) {
        setToken(tokenStorage);
        setPayloadJwt(payloadStorage);
        console.log(response);
        setDataUser(response.data);
        setLoad(false);
      }
    } catch (error) {
      setLoad(false);
      showError(error);
    }
  };

  const getUsuarioById = async (id_user) => {
    const API_PARAMS = `${API}/${id_user}`;
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
      setLoad(true);
      const response = await axios.get(API_PARAMS, axiosConfig);
      if (response) {
        //En este caso retorno la promesa de la respuesta a la API la cual me entrega los datos de la consulta
        return response.data;
      }
      setLoad(false);
    } catch (error) {
      setLoad(false);
      showError(error);
    }
  };

  //Crear nuevo personal para la empresa
  const postUsuario = async (data) => {
    try {
      const response = await axios.post(API, data);
      if (response) {
        //Muestro el mensaje de retorno de la API
        console.log(response);
        toast.success(response.data.message);
        router.push('/');
      }
    } catch (error) {
      showError(error);
    }
  };

  //Actualizar datos de personal de la empresa
  const updateUsuario = async (id_user, dataUpdate, register) => {
    const API_PARAMS = `${API}/${id_user}`;
    delete dataUpdate.id_user; //QUito la PK desde el objeto que llegue cuando se actualiza para evitar error en API
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
        //Si se invoca la función desde la pantalla de Vinculación de usuario y cliente se elimina el local
        //Storage, recarga la página para que el usuario deba ingresar nuevamente y crear un nuevo token con los nuevos datos
        if (register) {
          toast.success(
            'Usuario vinculado con éxito! Por favor vuelva a registrar sus credenciales para hacer uso del sistema',
            { duration: 4000 }
          );
          localStorage.clear();
          router.push('/');
          setTimeout(() => {
            window.location.reload();
          }, 4000);
        }
      }
    } catch (error) {
      showError(error);
    }
  };

  //Eliminar Empresa
  const deleteUsuario = async (id_user, message) => {
    const API_PARAMS = `${API}/${id_user}`;
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
                  response && getUsuarios(); //Una vez eliminado realizo "hotReload" para refrescar datos
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
    getUsuarios,
    getUsuarioById,
    postUsuario,
    updateUsuario,
    deleteUsuario,
    dataUser,
    payloadJwt,
    load,
    error,
    statusError,
    messageError,
  };
};

export default useApiUsuarios;
