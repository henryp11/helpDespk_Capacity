import jwt from 'jsonwebtoken';

//Valida la fecha y hora de expiración del token para detectar cuando este
//Expira, cuando suceda se recarga la página automáticamente a la pantalla de login
export const validateExpToken = () => {
  const token = JSON.parse(localStorage.getItem('jwt'));
  console.log(Date.now() / 1000);
  if (token) {
    const decodeToken = jwt.decode(token);
    const fechaIni = decodeToken.iat;
    const fechaExp = decodeToken.exp;
    const alertTime =
      new Date(fechaExp * 1000 - 60000) - new Date(fechaIni * 1000);
    console.log({
      tokenHome: token,
      decoded: decodeToken,
      inicio: new Date(fechaIni * 1000).toLocaleString(),
      exp: new Date(fechaExp * 1000).toLocaleString(),
      alert: new Date(fechaExp * 1000 - 60000).toLocaleString(),
      msAlert: alertTime,
    });

    //Pendiente a confirmación del usuario para generar un token de respaldo
    //o finalizar sesión
    setTimeout(() => {
      alert('Su sesión finalizará dentro de un minuto ¿desea Continuar?');
    }, alertTime);

    setTimeout(() => {
      window.location.reload();
    }, alertTime + 60001);

    if (fechaExp < Date.now() / 1000) {
      console.log('token expirado');
      localStorage.removeItem('jwt');
      localStorage.clear();
      window.location.href = '/';
    } else {
      console.log('token vigente');
    }
  } else {
    window.location.href = '/';
  }
};

export const addZero = (dato) => {
  if (dato.toString().length === 1) {
    return `0${dato}`;
  } else {
    return dato;
  }
};

export const formatDateTransform = (fecha) => {
  const fechaTexto = fecha.split('T');
  const onlyDate = fechaTexto[0].split('-');
  const onlyTime = fechaTexto[1].split(':');

  console.log(onlyDate);
  console.log(onlyTime);

  let finalDate = new Date(
    Number(onlyDate[0]),
    Number(onlyDate[1]),
    Number(onlyDate[2]),
    Number(onlyTime[0]),
    Number(onlyTime[1]),
    Number(onlyTime[2].slice(0, 2))
  );

  return finalDate;
};
