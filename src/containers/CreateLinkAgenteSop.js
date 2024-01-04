import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CustomInput from '@/components/CustomInput';
import ErrorLayout from '@/components/ErrorLayout';
import { validateExpToken } from '@/utils/helpers';
import useApiAgentes from '@/hooks/useApiAgentes';
import styles from '../styles/forms.module.css';
import stylesEmp from '../styles/emp.module.css';

const CreateLinkAgenteSop = ({ userName, subPayload }) => {
  const {
    getAgentByCed,
    postAgente,
    updateAgente,
    error,
    statusError,
    messageError,
  } = useApiAgentes();
  const ruta = usePathname();

  const initialState = {
    cedula: '',
    nombre: '',
    fecha_nacimiento: undefined,
    fecha_ingreso: '',
    cargo: 'Técnico Soporte',
    estatus: true,
  };

  const [valueState, setValueState] = useState(initialState);

  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });

  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showAlert, setShowAlertForm] = useState({ idAgente: '', message: '' });

  useEffect(() => {
    validateExpToken();
  }, [ruta]);

  const getDataEmpleado = () => {
    //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
    const response = getAgentByCed(valueState.cedula); //Envío la cedula capturada
    response
      .then((data) => {
        console.log({ dataPersonApi: data });
        if (data.length > 0) {
          //Si encuentra el empleado,quito los campos que no requiero para enviar
          const dataUpdate = data[0];
          setShowAlertForm({ idAgente: dataUpdate.id_agente, message: '' });
          delete dataUpdate.created_at;
          delete dataUpdate.updated_at;
          delete dataUpdate.horario;
          delete dataUpdate.id_agente;
          //El estado se llenará con toda la info y adicional se colocará el id_user para que
          //Quede vinculado el agente con el usuario que está previamente registrando.
          // Este dato proviene del payload del token siendo el sub, el cual es enviado como Props desde Home
          setValueState({ ...valueState, ...dataUpdate, id_user: subPayload });
        } else {
          setShowAlertForm({
            idAgente: '',
            message:
              'No te encuentras registrado. Por favor llenar el formulario a continuación ⬇',
          });
        }
        setShowFieldForm(true);
      })
      .catch((error) => {
        console.log(error);
        setLoadCreate({ loading: false, error: error });
      });
  };

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!showAlert.idAgente) {
      postAgente(valueState, true);
    } else {
      //El último parámetro es para indicar que realizo el update desde la pantalla de vinculación entre usuario y agente
      updateAgente(showAlert.idAgente, valueState, true);
    }
  };

  console.log({ stateCompon: valueState, agentAlert: showAlert });

  return (
    <div className={stylesEmp.crudEmpContainer} style={{ width: '90%' }}>
      <h4 style={{ textAlign: 'center' }}>
        Bienvenido! {userName}. Eres un usuario para brindar soporte técnico,
        aún no te encuentras vinculado a un agente de soporte <br />
        Por favor sigue los siguientes pasos:
      </h4>
      <ol>
        <li>
          Ingresa tu número de cédula o documento de identificación, si el
          administrador ya te ha registrado en nuestro sistema tus datos se
          cargarán automáticamente 🔍.
        </li>
        <li>
          Si aún no te encuentras registrado por favor, llena el formulario a
          continuación para darte de alta en el sistema.
        </li>
      </ol>
      <h4>
        Una vez vinculado ya podras utilizar la aplicación y dar atención a
        nuestros clientes 😉.
      </h4>
      {loadCreate.loading === false ? (
        <form
          id="form"
          onSubmit={handleSubmit}
          className={styles['form-default']}
        >
          <span className="gridAllColumn">
            <CustomInput
              typeInput="text"
              // nameInput={!inputRucAlter ? 'cedula' : 'id_per'}
              nameInput="cedula"
              placeholder="Digita tu # de cédula y da clic en BUSCAR ➡"
              valueInput={valueState.cedula}
              onChange={handleChange}
              nameLabel="Cédula"
              required={true}
              buttonEsp={true}
              onClickSearch={() => {
                getDataEmpleado();
              }}
            />
            <b className="alertMessage">{showAlert.message}</b>
          </span>

          {showFieldForm && (
            <CustomInput
              typeInput="text"
              nameInput="nombre"
              valueInput={valueState.nombre}
              onChange={handleChange}
              nameLabel="Nombre"
              required={true}
            />
          )}
          {showFieldForm && (
            <CustomInput
              typeInput="date"
              nameInput="fecha_nacimiento"
              valueInput={valueState.fecha_nacimiento}
              onChange={handleChange}
              nameLabel="Fecha Nacimiento"
            />
          )}
          {showFieldForm && (
            <CustomInput
              typeInput="date"
              nameInput="fecha_ingreso"
              valueInput={valueState.fecha_ingreso}
              onChange={handleChange}
              nameLabel="Fecha Ingreso"
              required={true}
            />
          )}
          {showFieldForm && (
            <CustomInput
              typeInput="text"
              nameInput="cargo"
              valueInput={valueState.cargo}
              onChange={handleChange}
              nameLabel="Cargo"
              required={true}
            />
          )}
          <span className={styles.buttonContainer}>
            {showFieldForm && (
              <button
                title="Guardar"
                className={styles['formButton']}
                style={{
                  borderRadius: '0',
                  width: '80%',
                  background: 'white',
                  border: '1px solid #555fc2',
                  color: '#555fc2',
                  margin: '0px 8px',
                }}
              >
                Vincular
              </button>
            )}

            <button
              tittle="Cancelar"
              className={`${styles.formButton}`}
              style={{
                borderRadius: '0',
                width: '80%',
                background: 'white',
                border: '1px solid rgb(155, 32, 32)',
                margin: '0px 8px',
              }}
              id="cancelButton"
              onClick={() => {
                localStorage.clear();
              }}
            >
              <Link
                href="/"
                className={`${styles.cancelButton}`}
                style={{ color: 'rgb(155, 32, 32)' }}
              >
                Cancelar
              </Link>
            </button>
          </span>
        </form>
      ) : (
        <h1>loading...</h1>
      )}
      {error && statusError !== 404 && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </div>
  );
};

export default CreateLinkAgenteSop;
