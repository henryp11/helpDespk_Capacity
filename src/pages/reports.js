import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrorLayout from '@/components/ErrorLayout';
import CustomInput from '@/components/CustomInput';
import TableReport from '@/components/TableReport';
import useApiReports from '@/hooks/useApiReports';
import useApiEmpresas from '@/hooks/useApiEmpresas';
import styles from '@/styles/forms.module.css';

const Reports = () => {
  const { getTickets, dataTicket, error, statusError, messageError } =
    useApiReports();
  const { getEmpresas, dataEmp } = useApiEmpresas();
  const [selectEmp, setSelectEmp] = useState({ id_emp: '' });
  const [personalEmp, setPersonalEmp] = useState([]);
  const [selectCli, setSelectCli] = useState({ id_per: '' });
  const [dates, setDates] = useState({
    date_ini: '',
    date_fin: '',
    condition: '',
  });
  // const [dateFin, setDateFin] = useState('');
  const [loadCreate, setLoadCreate] = useState({
    loading: false,
    error: null,
  });
  useEffect(() => {
    // getTickets();
    getEmpresas();
  }, []);

  const handleChangeEmp = (e) => {
    setSelectEmp({ ...selectEmp, [e.target.name]: e.target.value });
    setPersonalEmp(() => {
      return dataEmp.filter((empresa) => empresa.id_emp === e.target.value)[0]
        .personal_emp;
    });
    if (selectCli.id_per) {
      setSelectCli({ ...selectCli, id_per: '' });
    }
  };

  const handleChangePersonal = (e) => {
    setSelectCli({ ...selectCli, [e.target.name]: e.target.value });
  };

  const handleChange = (e) => {
    setDates({ ...dates, [e.target.name]: e.target.value });
  };

  const clearEmp = () => {
    setSelectEmp({ ...selectEmp, id_emp: '' });
    setSelectCli({ ...selectCli, id_per: '' });
  };

  const clearPersonal = () => {
    setSelectCli({ ...selectCli, id_per: '' });
  };

  const clearDates = () => {
    setDates({ ...dates, date_ini: '', date_fin: '', condition: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    getTickets(
      selectEmp.id_emp,
      selectCli.id_per,
      dates.condition,
      dates.date_ini,
      dates.date_fin
    );
  };

  console.log(dataTicket);
  // console.log(dataEmp);
  console.log(selectEmp);
  // console.log(personalEmp);
  console.log(selectCli);
  console.log(dates);
  return (
    <>
      <div className={styles.reportContainer}>
        <h2>Seleccione los filtros para generar su reporte</h2>
        <h6>
          *Si no se selecciona ningún filtro se mostrará toda la información
        </h6>
        {loadCreate.loading === false ? (
          <form
            id="form"
            onSubmit={handleSubmit}
            className={`${styles['form-default']} ${styles.formReports}`}
          >
            <fieldset className={styles.fieldSetCustom}>
              <legend>Seleccionar clientes</legend>
              <span className={styles.selectContainer}>
                <strong>Empresa:</strong>
                <select name="id_emp" onChange={handleChangeEmp}>
                  {!selectEmp.id_emp && (
                    <option defaultValue="" label="Elegir Empresa:" selected>
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
                <button
                  type="button"
                  onClick={clearEmp}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
              </span>
              <span className={styles.selectContainer}>
                <strong>Personal:</strong>
                <select
                  name="id_per"
                  onChange={handleChangePersonal}
                  disabled={!selectEmp.id_emp && true}
                >
                  {!selectCli.id_per && (
                    <option defaultValue="" label="Elegir Personal:" selected>
                      Elegir Personal
                    </option>
                  )}
                  {personalEmp.map((personal) => {
                    return (
                      <option key={personal.id_per} value={personal.id_per}>
                        {personal.nombre}
                      </option>
                    );
                  })}
                </select>
                <button
                  type="button"
                  onClick={clearPersonal}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
              </span>
            </fieldset>
            <fieldset className={styles.fieldSetCustom}>
              <legend>Filtro de fecha</legend>
              <span className={styles.selectContainer}>
                <strong>Condición de Fecha:</strong>
                <select name="condition" onChange={handleChange}>
                  {!dates.condition && (
                    <option defaultValue="" label="Elegir Condición:" selected>
                      Elegir Condición de filtrado:
                    </option>
                  )}
                  <option value="entre">{`Este Entre`}</option>
                  <option value="mayorigual">{`Mayor o igual que (>=)`}</option>
                  <option value="menorigual">{`Menor o igual que (<=)`}</option>
                  <option value="mayor">{`Mayor que (>)`}</option>
                  <option value="menor">{`Menor que (<)`}</option>
                  <option value="igual">{`igual`}</option>
                </select>
                <button
                  type="button"
                  onClick={clearDates}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
              </span>
              <span>
                <CustomInput
                  typeInput="date"
                  nameInput="date_ini"
                  placeholder="Fecha inicio Filtro"
                  valueInput={dates.date_ini}
                  onChange={handleChange}
                  nameLabel={
                    dates.condition === 'entre' ? 'Fecha Inicio' : 'Fecha'
                  }
                  required={dates.condition ? true : false}
                />
                {dates.condition === 'entre' && (
                  <CustomInput
                    typeInput="date"
                    nameInput="date_fin"
                    placeholder="Fecha Fin Filtro"
                    valueInput={dates.date_fin}
                    onChange={handleChange}
                    nameLabel="Fecha Fin"
                    required={true}
                  />
                )}
              </span>
            </fieldset>

            <span className={styles.buttonContainer}>
              <button title="Emitir Reporte" className={styles['formButton']}>
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

              <button
                tittle="Cancelar"
                className={`${styles.formButton}`}
                id="cancelButton"
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
        {dataTicket.length > 0 ? (
          <TableReport dataTicket={dataTicket} />
        ) : (
          <h4>No se hallaron registros con el criterio dado</h4>
        )}
      </div>

      {error && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </>
  );
};

export default Reports;
