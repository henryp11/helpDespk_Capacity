import React, { useState } from 'react';

function useSearchSimple(dataSearch) {
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
        return `${dataFilter.id_emp} ${dataFilter.nombre_emp} ${dataFilter.ruc}`
          .toLowerCase()
          .includes(query.toLowerCase()); //Si encuentra lo que busco mostrará ese resultado, transformo todo a minusculas
      });
    //Esta sección de transformar en estado la busqueda es por si cambia la lista de items a querys a mostar
    setFilteredRegs(result);
  }, [dataSearch, query]);

  return { query, setQuery, filteredRegs };
}

export default useSearchSimple;
