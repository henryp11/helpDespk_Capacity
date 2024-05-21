'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter as useNextRouter } from 'next/router';
import CustomInput from '../../components/CustomInput';
import ErrorLayout from '../../components/ErrorLayout';
import useApiContratos from '../../hooks/useApiContratos';
import useApiEmpresas from '@/hooks/useApiEmpresas';
import useApiPlanesMant from '@/hooks/useApiPlanesMant';
import { validateExpToken, addZero } from '../../utils/helpers';
import styles from '../../styles/forms.module.css';
import stylesEmp from '../../styles/emp.module.css';

const Newregister = () => {
  const {
    postContrato,
    getContratoById,
    updateContrato,
    error,
    statusError,
    messageError,
  } = useApiContratos();

  const { getEmpresas, dataEmp } = useApiEmpresas();
  const { getPlanes, dataPlan } = useApiPlanesMant();

  const nextRouter = useNextRouter(); //usado de next/router para extraer el query params de la ruta (el id de cada registro de firebase)
  const idSearch = nextRouter.query.id_contrato; //Para verificar el string param de id_emp y saber si estoy creando o editando un registro
  console.log(`id_contrato: ${idSearch}`);
  const ruta = usePathname();

  const initialState = {
    id_contrato: '',
    id_emp: '',
    id_plan: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_extendida: undefined,
    factura: undefined,
    observac: undefined,
    flag_vigente: true,
    estatus: true,
  };
  const [valueState, setValueState] = useState(initialState);
  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });

  const [timePlan, setTimePlan] = useState(false);

  useEffect(() => {
    getDataContrato();
    getEmpresas();
    getPlanes();
    validateExpToken();
  }, [ruta]);

  const getDataContrato = () => {
    //Valido si estoy creando un nuevo registro o editando
    if (idSearch !== 'new') {
      setLoadCreate({ loading: true, error: null });
      //La consulta a la API me retorna una promesa con la información de la consulta, por eso utilizo un then/catch
      const response = getContratoById(idSearch);
      response
        .then((data) => {
          console.log({ dataGetApi: data });
          //Ya que la consulta a la API retorna los datos de la empresa con las FK que traen más datos de otras tablas,
          //solo extraigo los datos que me interesan para armar el objeto del estado y de esa forma actualizar
          //Solo los datos que pertenecen a la tabla que requiero, en este caso la tabla de Empresas, no envio el id_emp ya que es la PK y está prohibido topar ese campo.
          const dataEdit = {
            id_contrato: data.id_contrato,
            id_emp: data.id_emp,
            id_plan: data.id_plan,
            fecha_inicio: data.fecha_inicio,
            fecha_fin: data.fecha_fin,
            fecha_extendida:
              data.fecha_extendida === null ? undefined : data.fecha_extendida,
            factura: data.factura === null ? undefined : data.factura,
            observac: data.observac === null ? undefined : data.observac,
            flag_vigente: data.flag_vigente,
            estatus: data.estatus,
          };
          setValueState(dataEdit);
          setLoadCreate({ loading: false, error: null });
        })
        .catch((error) => {
          console.log(error);
          setLoadCreate({ loading: false, error: error });
        });
    }
  };

  const handleChange = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
  };

  //Para controlar el plan elegido, extraer los datos de dias de contrato y calcular posteriormente la fecha de vencimiento
  const handleChangeSelect = (e) => {
    setValueState({ ...valueState, [e.target.name]: e.target.value });
    //Guardo los datos del plan seleccionado en el estado timePlan
    setTimePlan(
      dataPlan.filter((planSelect) => planSelect.id_plan === e.target.value)[0]
    );
  };

  //Calculo la fecha de vencimiento
  const calcFechaVence = () => {
    const fechaIniParse = valueState.fecha_inicio.split('-'); //Transformo en array la fecha de inicio guardada como texto en formato yyyy-mm-dd
    // JS maneja los meses como array de 0 a 11, por eso al extraer le resto 1 al mes para que coloque el correcto y no el de la posición
    const fechaIniCalc = new Date(
      fechaIniParse[0],
      fechaIniParse[1] - 1,
      fechaIniParse[2]
    );

    //Armo la fecha de finalización sumando los días obenidos de los datos del paln del estado timePlan, capturado en el onChange del select de planes
    const fechaFinCalc = new Date(
      fechaIniCalc.getFullYear(),
      fechaIniCalc.getMonth(),
      fechaIniCalc.getDate() + timePlan.dias_vigencia
    );

    //Armo la fecha a guardar en el estado como string, añadiendo los ceros para evitar errores de formato
    const fechaFinalSave = `${fechaFinCalc.getFullYear()}-${addZero(
      fechaFinCalc.getMonth() + 1
    )}-${addZero(fechaFinCalc.getDate())}`;
    //Actualizo el estado de la fecha final
    setValueState({
      ...valueState,
      fecha_fin: fechaFinalSave,
    });
  };

  const handleCheck = (fieldCheck) => {
    if (fieldCheck === 'plan') {
      setValueState({ ...valueState, flag_vigente: !valueState.flag_vigente });
    } else if (fieldCheck === 'est') {
      setValueState({ ...valueState, estatus: !valueState.estatus });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idSearch === 'new') {
      postContrato(valueState);
    } else {
      updateContrato(idSearch, valueState);
    }
  };

  console.log({ stateCompon: valueState });
  console.log(timePlan);

  return (
    <>
      <div className={stylesEmp.crudEmpContainer}>
        <h2>
          {idSearch !== 'new' ? 'Editando Registro' : 'Creando Nuevo Registro'}
        </h2>
        {loadCreate.loading === false ? (
          <form
            id="form"
            onSubmit={handleSubmit}
            className={styles['form-default']}
          >
            <span className={styles.idField}>
              <CustomInput
                typeInput="text"
                nameInput="id_contrato"
                valueInput={!idSearch ? valueState.id_contrato : idSearch}
                onChange={handleChange}
                nameLabel="Id.Contrato"
                required={true}
                disabled={idSearch !== 'new' && true}
              />
              <span className={styles.selectContainer}>
                <b>* Empresa:</b>
                <select name="id_emp" onChange={handleChange} required>
                  {valueState.id_emp ? (
                    <option value={valueState.id_emp}>
                      {dataEmp
                        .filter(
                          (empSelect) => empSelect.id_emp === valueState.id_emp
                        )
                        .map((emp) => emp.nombre_emp)}
                    </option>
                  ) : (
                    <option value="" label="Elegir Empresa:">
                      Elegir Empresa
                    </option>
                  )}
                  {dataEmp.map((empresa) => {
                    if (empresa.estatus) {
                      return (
                        <option key={empresa.id_emp} value={empresa.id_emp}>
                          {empresa.nombre_emp}
                        </option>
                      );
                    }
                  })}
                </select>
              </span>
            </span>
            <span className={styles.selectContainer}>
              <b>* Plan Mant:</b>
              <select name="id_plan" onChange={handleChangeSelect} required>
                {valueState.id_plan ? (
                  <option value={valueState.id_plan}>
                    {dataPlan
                      .filter(
                        (planSelect) =>
                          planSelect.id_plan === valueState.id_plan
                      )
                      .map((plan) => plan.nombre_plan)}
                  </option>
                ) : (
                  <option value="" label="Elegir Plan">
                    Elegir Plan
                  </option>
                )}
                {dataPlan.map((plan) => {
                  if (plan.estatus) {
                    return (
                      <option key={plan.id_plan} value={plan.id_plan}>
                        {plan.nombre_plan}
                      </option>
                    );
                  }
                })}
              </select>
              {timePlan && (
                <div>
                  <i>Días: </i> {timePlan.dias_vigencia} | <i># Horas Sop.:</i>{' '}
                  {timePlan.horas_sop}
                </div>
              )}
            </span>
            <CustomInput
              typeInput="date"
              nameInput="fecha_inicio"
              placeholder="Fecha comienza a contar el soporte"
              valueInput={valueState.fecha_inicio}
              onChange={handleChange}
              nameLabel="Fecha Inicio contrato"
              required={true}
            />
            <span className={styles.inputWithButton}>
              <button
                type="button"
                onClick={() => {
                  calcFechaVence();
                }}
              >
                Calcular fecha Fin:
              </button>
              <p>
                Finaliza el: <br />
                <b>
                  {`${valueState.fecha_fin
                    .split('-')
                    .reverse()
                    .toString()
                    .replace(/,/g, ' / ')}`}
                </b>
              </p>
              {/* <CustomInput
                typeInput="text"
                nameInput="fecha_fin"
                placeholder="Fecha finaliza el soporte"
                valueInput={valueState.fecha_fin}
                onChange={calcFechaVence}
                nameLabel="Fecha Finalización contrato"
                required={true}
                disabled={true}
              /> */}
            </span>

            <CustomInput
              typeInput="date"
              nameInput="fecha_extendida"
              placeholder="Solo se debe colocar en el caso de que la fecha de finalización sea distinta a la calculada"
              valueInput={valueState.fecha_extendida}
              onChange={handleChange}
              nameLabel="Fecha Finalización Personalizada"
            />
            <CustomInput
              typeInput="text"
              nameInput="factura"
              valueInput={valueState.factura}
              onChange={handleChange}
              nameLabel="Factura Vinculada"
            />
            <CustomInput
              typeInput="text"
              nameInput="observac"
              valueInput={valueState.observac}
              onChange={handleChange}
              nameLabel="Observaciones / Detalles"
            />

            <CustomInput
              typeInput="checkbox"
              nameInput="flag_vigente"
              isChecked={valueState.flag_vigente}
              onChange={() => {
                handleCheck('plan');
              }}
              nameLabel="Plan Activo?"
              required={false}
            />
            <CustomInput
              typeInput="checkbox"
              nameInput="estatus"
              isChecked={valueState.estatus}
              onChange={() => {
                handleCheck('est');
              }}
              nameLabel="Contrato Activo?"
              required={false}
            />
            <span className={styles.buttonContainer}>
              <button title="Guardar" className={styles['formButton']}>
                {idSearch === 'new' ? (
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{ scale: '0.7' }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                )}
              </button>
              <button
                tittle="Cancelar"
                className={`${styles.formButton}`}
                id="cancelButton"
              >
                <Link href="/contratos" className={`${styles.cancelButton}`}>
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
      </div>
      {error && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </>
  );
};

export default Newregister;
