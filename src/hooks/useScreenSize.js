import React, { useState, useEffect, useLayoutEffect } from "react";

//Custom Hook para determinar el tamaño de pantalla para mobil
const useScreenSize = () => {
  //Verifico la carga en el lado del cliente
  const useSafeLayoutEffect =
    typeof window !== "undefined" &&
    window.document &&
    window.document.createElement
      ? useLayoutEffect
      : useEffect;

  //El atributo .matches retorna un boolean si coincide con la medida a buscar
  // Y con eso inicializo el estado para la carga inicial del dispositivo
  const [matches, setMatches] = useState(
    typeof window !== "undefined" &&
      window.matchMedia("(max-width: 480px)").matches
  );
  const mql =
    typeof window !== "undefined" && window.matchMedia("(max-width: 480px)");

  const handler = (e) => {
    setMatches(mql.matches);
  };

  //Detecto el cambio en pantalla con el handler para setear la variable matches de acuerdo a si coincide con el mediaQuery a buscar
  useSafeLayoutEffect(() => {
    mql.addEventListener("change", handler);
    //Una vez cambiado el estado se debe remover el Listener para que no cosuma recursos
    return () => mql.removeEventListener("change", handler);
  }, []);

  return matches;
};

export default useScreenSize;
