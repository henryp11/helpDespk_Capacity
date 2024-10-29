import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CustomInput from '@/components/CustomInput';
import ErrorLayout from '@/components/ErrorLayout';
import { validateExpToken } from '@/utils/helpers';
import useApiPersonal from '@/hooks/useApiPersonal';
import useApiEmpresas from '@/hooks/useApiEmpresas';
import styles from '../styles/forms.module.css';
import stylesEmp from '../styles/emp.module.css';

const CreateLinkPersonalEmp = ({ userName, subPayload, mail }) => {
  const {
    postPersonal,
    getPersonalById,
    updatePersonal,
    error,
    statusError,
    messageError,
  } = useApiPersonal();
  const { getEmpresaByRuc } = useApiEmpresas();
  const ruta = usePathname();

  const initialState = {
    id_per: '',
    id_emp: '',
    nombre: '',
    telf1: '',
    telf2: undefined,
    cargo: undefined,
    depto: undefined,
    correo: mail,
    estatus: true,
  };

  const [valueState, setValueState] = useState(initialState);
  //Controlar datos capturados si existe la empresa a buscar
  const [rucEmpresa, setRucEmpresa] = useState({
    rucSearch: '',
    nombre_emp: '',
    id_emp: '',
    dataPersonal: false,
    cedula: '',
    alert: '',
  });

  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });

  const [showFieldForm, setShowFieldForm] = useState(false);

  useEffect(() => {
    validateExpToken();
  }, [ruta]);

  const getDataEmpleado = () => {
    //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
    const response = getPersonalById(rucEmpresa.cedula); //Envío el Ruc Capturado
    response
      .then((data) => {
        console.log({ dataPersonApi: data });
        if (data) {
          //Si encuentra el empleado,quito los campos que no requiero para enviar
          delete data.empresa;
          delete data.created_at;
          delete data.updated_at;
          setRucEmpresa({ ...rucEmpresa, dataPersonal: data, alert: '' });
          //El estado se llenará con toda la info y adicional se colocará el id_user para que
          //Quede vinculado el cliente con el usuario que está registrandose.
          // Este dato proviene del payload del token siendo el sub, el cual es enviado como Props desde Home
          setValueState({
            ...valueState,
            ...data,
            id_user: subPayload,
            telf2: !data.telf2 ? undefined : data.telf2,
          });
        } else {
          setRucEmpresa({
            ...rucEmpresa,
            alert:
              'No te encuentras registrado. Por favor llenar el formulario a continuación ⬇',
          });
          setValueState({ ...valueState, id_per: rucEmpresa.cedula });
        }
        setShowFieldForm(true);
      })
      .catch((error) => {
        console.log(error);
        setLoadCreate({ loading: false, error: error });
      });
  };
  const getDataEmpresaRuc = () => {
    //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
    const response = getEmpresaByRuc(rucEmpresa.rucSearch); //Envío el Ruc Capturado
    response
      .then((data) => {
        console.log({ dataEmpApi: data });
        if (data.length > 0) {
          setRucEmpresa({ ...rucEmpresa, ...data[0], alert: '' });
          setValueState({ ...valueState, id_emp: data[0].id_emp });
        } else {
          setRucEmpresa({
            ...rucEmpresa,
            nombre_emp: 'Empresa no Registrada',
            alert:
              'La empresa indicada no forma parte de nuestros clientes, por favor comuniquese al número 0991989296 o envienos un correo a: info@capacity-soft.com y soporte@capacity-soft.com, con la información de su empresa (RUC, razón social, número de contacto, correo electrónico), para poder corroborar que pertenezca como cliente de Capacity-Soft para que pueda utilizar la aplicación',
          });
        }
      })
      .catch((error) => {
        console.log(error);
        setLoadCreate({ loading: false, error: error });
      });
  };

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  //Controlo el campo de RUC exclusivo para realizar busqueda de empresas a asignar
  const handleChangeRuc = (e) => {
    setRucEmpresa({ ...rucEmpresa, [e.target.name]: e.target.value });
  };

  const handleCedEmp = (e) => {
    setRucEmpresa({ ...rucEmpresa, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!rucEmpresa.dataPersonal) {
      postPersonal(valueState, true);
    } else {
      //El último parámetro es para indicar que realizo el update desde la pantalla de vinculación entre usuario y cliente
      updatePersonal(rucEmpresa.cedula, valueState, true);
    }
  };

  console.log({ stateCompon: valueState });
  console.log({ stateRucCapture: rucEmpresa });

  return (
    <div className={stylesEmp.crudEmpContainer} style={{ width: '90%' }}>
      <h4 style={{ textAlign: 'center' }}>
        Bienvenido! {userName}. Gracias por usar la aplicación de asistencia y
        soporte técnico de Capacity-Soft. <br />
        Para poderla utilizar y vincular tu cuenta, por favor realiza los
        siguientes pasos:
      </h4>
      <ol>
        <li>
          Digita el número de RUC de la empresa a la que perteneces y da clic en
          el ícono de busqueda 🔍.
        </li>
        <li>
          Ingresa tu número de cédula o documento de identificación, si tu
          supervisor ya te ha registrado en nuestro sistema tus datos se
          cargarán automáticamente 🔍.
        </li>
        <li>
          Si aún no te encuentras registrado por favor, llena el formulario a
          continuación para darte de alta en el sistema.
        </li>
      </ol>
      <h4>
        Una vez registrado ya podras utilizar la aplicación y realizar las
        solicitudes que desees 😉.
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
              nameInput="rucSearch"
              placeholder="Digite RUC de la Empresa a la que pertenece y de clic en BUSCAR ➡"
              valueInput={rucEmpresa.rucSearch}
              onChange={handleChangeRuc}
              nameLabel={`Pertenece a: ${rucEmpresa.id_emp} | ${rucEmpresa.nombre_emp}`}
              required={true}
              buttonEsp={true}
              onClickSearch={() => {
                getDataEmpresaRuc();
              }}
            />
            <b className="alertMessage">{rucEmpresa.alert}</b>
          </span>
          {valueState.id_emp && (
            <span className="gridAllColumn">
              <CustomInput
                typeInput="text"
                // nameInput={!inputRucAlter ? 'cedula' : 'id_per'}
                nameInput="cedula"
                placeholder="Digite tu # de cédula y de clic en BUSCAR ➡"
                valueInput={rucEmpresa.cedula}
                onChange={handleCedEmp}
                nameLabel="Cédula"
                required={true}
                buttonEsp={true}
                onClickSearch={() => {
                  getDataEmpleado();
                }}
              />
            </span>
          )}
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
              typeInput="tel"
              nameInput="telf1"
              valueInput={valueState.telf1}
              onChange={handleChange}
              nameLabel="Teléfono"
              required={true}
            />
          )}
          {showFieldForm && (
            <CustomInput
              typeInput="tel"
              nameInput="telf2"
              valueInput={valueState.telf2}
              onChange={handleChange}
              nameLabel="Telf. Secundario"
            />
          )}
          {showFieldForm && (
            <CustomInput
              typeInput="email"
              nameInput="correo"
              valueInput={valueState.correo}
              onChange={handleChange}
              nameLabel="Correo"
            />
          )}
          {showFieldForm && (
            <CustomInput
              typeInput="text"
              nameInput="cargo"
              valueInput={valueState.cargo}
              onChange={handleChange}
              nameLabel="Cargo"
            />
          )}
          {showFieldForm && (
            <CustomInput
              typeInput="text"
              nameInput="depto"
              valueInput={valueState.depto}
              onChange={handleChange}
              nameLabel="Departamento"
            />
          )}
          <span className={styles.buttonContainer}>
            {valueState.id_emp && showFieldForm && (
              <button title="Guardar" className={styles['formButton']}>
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
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}

            <button
              tittle="Cancelar"
              className={`${styles.formButton}`}
              id="cancelButton"
              onClick={() => {
                localStorage.clear();
              }}
            >
              <Link href="/" className={`${styles.cancelButton}`}>
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
                    d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
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

export default CreateLinkPersonalEmp;
