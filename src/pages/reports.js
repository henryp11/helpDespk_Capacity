import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ErrorLayout from '@/components/ErrorLayout';
import CustomInput from '@/components/CustomInput';
import TableReport from '@/components/TableReport';
import useApiReports from '@/hooks/useApiReports';
import useApiEmpresas from '@/hooks/useApiEmpresas';
import styles from '@/styles/forms.module.css';

const Reports = () => {
  const {
    getTickets,
    getTicketsBySolicitud,
    dataTicket,
    error,
    statusError,
    messageError,
    load,
  } = useApiReports();
  const { getEmpresas, getEmpresaById, dataEmp } = useApiEmpresas();
  const [perfil, setPerfil] = useState('');
  const [selectEmp, setSelectEmp] = useState({ id_emp: '' });
  const [personalEmp, setPersonalEmp] = useState([]);
  const [selectCli, setSelectCli] = useState({ id_per: '' });
  const [dates, setDates] = useState({
    date_ini: '',
    date_fin: '',
    condition: '',
  });
  const [typeReport, setTypeReport] = useState('');

  useEffect(() => {
    // getTickets();
    const payloadStorage =
      localStorage.getItem('payload') &&
      JSON.parse(localStorage.getItem('payload'));
    getEmpresas();
    if (payloadStorage.perfil === 'supervisor') {
      getEmpresaById(payloadStorage.idEmp);
    }
    setPerfil(payloadStorage.perfil);
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
    if (typeReport === 'resumen') {
      getTickets(
        selectEmp.id_emp,
        selectCli.id_per,
        dates.condition,
        dates.date_ini,
        dates.date_fin
      );
    } else {
      getTicketsBySolicitud(
        selectEmp.id_emp,
        selectCli.id_per,
        dates.condition,
        dates.date_ini,
        dates.date_fin
      );
    }
  };

  console.log(dataTicket);
  console.log(dataEmp);
  console.log(selectEmp);
  // console.log(personalEmp);
  console.log(selectCli);
  console.log(dates);
  console.log(perfil);
  return (
    <>
      <div className={styles.reportContainer}>
        <h2>Seleccione los filtros para generar su reporte</h2>
        <h6>
          *Si no selecciona ningún filtro se mostrará toda la información que se
          encuentre.
        </h6>
        <form
          id="form"
          onSubmit={handleSubmit}
          className={`${styles['form-default']} ${styles.formReports}`}
        >
          {perfil !== 'cliente' && (
            <fieldset className={styles.fieldSetCustom}>
              <legend>
                {perfil !== 'supervisor'
                  ? 'Seleccionar cliente'
                  : 'Seleccionar personal'}
              </legend>
              {perfil !== 'supervisor' && (
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
                    title="Quitar Filtro"
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
              )}
              <span className={styles.selectContainer}>
                <strong>Personal:</strong>
                <select
                  name="id_per"
                  onChange={handleChangePersonal}
                  // disabled={!selectEmp.id_emp && true}
                >
                  {!selectCli.id_per && (
                    <option defaultValue="" label="Elegir Personal:" selected>
                      Elegir Personal
                    </option>
                  )}
                  {perfil !== 'supervisor'
                    ? personalEmp.map((personal) => {
                        return (
                          <option key={personal.id_per} value={personal.id_per}>
                            {personal.nombre}
                          </option>
                        );
                      })
                    : dataEmp.personal_emp?.map((personal) => {
                        return (
                          <option key={personal.id_per} value={personal.id_per}>
                            {personal.nombre}
                          </option>
                        );
                      })}
                </select>
                <button
                  type="button"
                  title="Quitar Filtro"
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
          )}

          <fieldset className={styles.fieldSetCustom}>
            <legend>Filtro por fecha</legend>
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
                title="Quitar Filtro"
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

          <span
            className={`${styles.buttonContainer} ${styles.containerButtonReports}`}
          >
            <button
              title="Reporte Resumen"
              className={`${styles.formButton} ${styles.reportButton}`}
              onClick={() => {
                setTypeReport('resumen');
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                />
              </svg>
              Rep. Resumido x Tickets
            </button>
            <button
              title="Reporte Detallado"
              className={`${styles.formButton} ${styles.reportButton}`}
              onClick={() => {
                setTypeReport('detalle');
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                />
              </svg>
              Rep. Detallado x Solicitud
            </button>

            <button
              tittle="Cancelar"
              className={`${styles.formButton}`}
              id="cancelButton"
              type="button"
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

        {dataTicket.length > 0 && !load && (
          <TableReport
            dataTicket={dataTicket}
            typeReport={typeReport}
            loadData={load}
          />
        )}
        {dataTicket.length === 0 && !load && (
          <h4>No se hallaron registros con el criterio dado</h4>
        )}
        {typeReport && load && <h4>Cargando...</h4>}
      </div>

      {error && (
        <ErrorLayout messageError={messageError} statusCode={statusError} />
      )}
    </>
  );
};

export default Reports;
