// En este componente separo la lógica de llamado a la API usando
// custom hook donde se envía el dato de la API como parametro
//y mediante el hook de useEffect retorno el valor del estado que deseo utilizar

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const API = `${process.env.NEXT_PUBLIC_API_ROUTE}/api/v1/auth`;
console.log(API);

const useAuth = () => {
  const router = useRouter();
  const params = useSearchParams(); //usado desde next/navigation para extraer los parametros como variables enviados (despues de ?)
  const recoveryToken = params.get('rectk');
  const userMail = params.get('mail');
  const [resData, setResData] = useState([]); //Información con la respuesta del login
  const [token, setToken] = useState('');
  const [dataUser, setDataUser] = useState({
    user: '',
    pass: '',
    recoveryToken: '',
  });
  const [payloadJwt, setPayloadJwt] = useState({});
  const [error, setError] = useState(false);
  const [messageError, setMessageError] = useState({});
  const [statusError, setStatusError] = useState('');

  //1º useEffect que verificará si ya existe un localStorage para mantenerlo en el
  //state del token, se maneja así porque cada componente de next pasa primero
  //por el servidor y luego al cliente, y en este caso no sirve solo con usar 'use client'

  useEffect(() => {
    const tokenLS = localStorage.getItem('jwt');
    const payloadLS = localStorage.getItem('payload');
    const tokenStorage = tokenLS && JSON.parse(tokenLS);
    const payloadStorage = payloadLS && JSON.parse(payloadLS);
    if (tokenStorage) {
      setToken(tokenStorage);
      setPayloadJwt(payloadStorage);
    }

    if (tokenLS !== null) {
      if (JSON.parse(tokenLS).length > 0) router.push('/home');
    }
  }, []);

  //2º useEffect que almacenará el token en local storage
  useEffect(() => {
    localStorage.setItem('jwt', JSON.stringify(token));
    localStorage.setItem('payload', JSON.stringify(payloadJwt));
  }, [token]);

  //3º useEffect que verificará si se intenta reestablecer una contraseña
  useEffect(() => {
    if (recoveryToken) {
      setDataUser({
        ...dataUser,
        user: userMail,
        recoveryToken: recoveryToken,
      });
    }
  }, [recoveryToken]);

  //Controla los errores a mostrar para todo tipo de petición, invocandolo en el catch
  const showError = (error) => {
    console.error(error);
    setMessageError([error]);
    setError(true);
    setStatusError(error.response.status);
    if (error.message) {
      console.log(error);
    } else {
      if (typeof error.response.data === 'object') {
        setMessageError([
          error.response.data.error,
          error.response.data.message,
        ]);
      } else {
        setMessageError([error.response.data]);
      }
    }
  };

  const signIn = async () => {
    await axios
      .post(`${API}/login`, {
        mail: dataUser.user,
        clave: dataUser.pass,
      })
      .then((response) => {
        console.log(response);
        setResData(response.data);
        setToken(response.data.token);
        setPayloadJwt(jwt.decode(response.data.token));
        setError(false);
        setMessageError({});
        router.push('/home');
      })
      .catch((error) => {
        console.log('error desde hook auth');
        console.log({ errorHookAuth: error });
        showError(error);
      });
  };
  const recoveryPass = async () => {
    await axios
      .post(`${API}/recovery`, {
        mail: dataUser.user,
      })
      .then((response) => {
        console.log(response);
        setResData(response.data);
        setError(false);
        setMessageError({});
        toast.success(
          `Se ha enviado un correo a ${dataUser.user} con los pasos para recuperar su contraseña`,
          { duration: 8000 }
        );
        router.push('/');
      })
      .catch((error) => {
        showError(error);
      });
  };
  const changePass = async () => {
    await axios
      .post(`${API}/change-password`, {
        token: dataUser.recoveryToken,
        newPassword: dataUser.pass,
      })
      .then((response) => {
        console.log(response);
        setResData(response.data);
        setError(false);
        setMessageError({});
        toast.success(
          `Su contraseña ha sido cambiada con éxito, por favor vuelva a ingresar con sus nuevas credenciales`,
          { duration: 8000 }
        );
        router.push('/');
      })
      .catch((error) => {
        showError(error);
      });
  };

  return {
    resData,
    token,
    payloadJwt,
    dataUser,
    setDataUser,
    signIn,
    recoveryPass,
    changePass,
    error,
    statusError,
    messageError,
  };
};

export default useAuth;
