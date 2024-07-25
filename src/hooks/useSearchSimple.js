import React, { useState } from 'react';

function useSearchSimple(dataSearch, modOption) {
  const [query, setQuery] = useState('');
  const [filteredRegs, setFilteredRegs] = useState(dataSearch);
  // Filtro el listado con la función JS filter, la cual recibe una función
  // Para optimizar los resultados de los filtros, con la función useMemo de react cuando se busca algo quedará almacenado
  //y al volver a buscar no debe buscar desde cero si no mostrará lo almacenado
  // UseMemo recibe como primer argumento otra función y el segundo es una lista en array, donde se iran almacenando los valores ya buscados.

  React.useMemo(() => {
    const result =
      dataSearch !== undefined &&
      dataSearch.filter((dataFilter) => {
        let fieldSearch = '';

        switch (modOption) {
          case 'empresas':
            fieldSearch = `${dataFilter.id_emp} ${dataFilter.nombre_emp} ${dataFilter.ruc}`;
            break;
          case 'personal':
            fieldSearch = `${dataFilter.id_per} ${dataFilter.nombre} ${dataFilter.empresa.nombre_emp} ${dataFilter.cargo}  ${dataFilter.correo}`;
            break;
          case 'planes':
            fieldSearch = `${dataFilter.id_plan} ${dataFilter.nombre_plan} ${dataFilter.dias_vigencia}`;
            break;
          case 'contratos':
            fieldSearch = `${dataFilter.id_contrato} ${dataFilter.empresa.nombre_emp} ${dataFilter.planes_mant.nombre_plan}`;
            break;
          case 'agentes':
            fieldSearch = `${dataFilter.id_agente} ${dataFilter.nombre} ${dataFilter.cargo} ${dataFilter.nivel_atencion}`;
            break;
          case 'tickets':
            fieldSearch = `${dataFilter.id_ticket} ${dataFilter.personal_emp.nombre} ${dataFilter.personal_emp.empresa.nombre_emp} ${dataFilter.estatus}`;
            break;
          case 'solicitudes':
            fieldSearch = `${dataFilter.id_ticket} ${dataFilter.id_solicitud} ${dataFilter.mtr_tickets.personal_emp.nombre} ${dataFilter.mtr_tickets.personal_emp.empresa.nombre_emp} ${dataFilter.mtr_tickets.descrip_tk} ${dataFilter.estatus}`;
            break;
          case 'usuarios':
            fieldSearch = `${dataFilter.id_user} ${dataFilter.username} ${
              dataFilter.rol
            } ${dataFilter.personalEmp && dataFilter.personalEmp.nombre} ${
              dataFilter.personalEmp &&
              dataFilter.personalEmp.empresa.nombre_emp
            }  ${dataFilter.mail}`;
            break;
          default:
            break;
        }

        return fieldSearch.toLowerCase().includes(query.toLowerCase()); //Si encuentra lo que busco mostrará ese resultado, transformo todo a minusculas
      });
    //Esta sección de transformar en estado la busqueda es por si cambia la lista de items a querys a mostar
    setFilteredRegs(result);
  }, [dataSearch, query]);

  return { query, setQuery, filteredRegs };
}

export default useSearchSimple;
