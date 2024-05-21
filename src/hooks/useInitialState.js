// NO SE ESTA USANDO PARA ESTE PROYECTO, SE TIENE DE EJEMPLO PARA USO DE ESTADO
// PERO YA SE COLOCÓ UN ESTADO POR DEFECTO PARA TODO POR ESO SE DEJA EL ARCHIVO
import { useState } from 'react';
import { usePathname } from 'next/navigation';

// Empiezo creando un estado inicial general de los atributos requeridos en otras pantallas
const initialState = {
  showItemsList: false,
  showAlert: false,
  showFormClient: false,
  cliente: null,
  idVendedor: '',
  itemsCotiza: [],
  totalesCotiza: {
    ivaTotal: 0.0,
    subTotIva: 0.0,
    subTotIva0: 0.0,
    totalDcto: 0.0,
  },
};

const useInitialState = () => {
  // Con el hook de useState se cambiará el estado inicial
  const [state, setState] = useState(initialState); //Modifica el estado principal
  const [itemsList, setItemsList] = useState([]); //Trae todos los items
  const [clientList, setClientList] = useState([]); //Trae todos los clientes
  const [vendList, setVendList] = useState([]); //Trae todos los vendedores
  const [loadData, setLoadData] = useState({
    loading: false,
    error: null,
  });
  const [showHeader, setShowHeader] = useState(true);
  const pathname = usePathname();

  const getUrl = () => {
    const url = `${pathname}`;
    console.log(url);
    if (url === '/') {
      setShowHeader(false);
    }
    return url;
  };

  //Funciones para obtener los datos de los items a mostrar
  // const getProducts = async () => {
  //   setLoadData({ loading: true, error: null });
  //   try {
  //     onSnapshot(collection(db, 'Productos'), (querySnapshot) => {
  //       const docs = [];
  //       querySnapshot.forEach((doc) => {
  //         docs.push({ ...doc.data(), id: doc.id });
  //       });
  //       // Ordeno los datos por id_producto
  //       docs.sort((a, b) => {
  //         if (a.idItem < b.idItem) {
  //           return -1;
  //         }
  //         if (a.idItem > b.idItem) {
  //           return 1;
  //         }
  //         return 0;
  //       });
  //       setItemsList(docs);
  //       setLoadData({ loading: false, error: null });
  //     });
  //   } catch (error) {
  //     setLoadData({ loading: false, error: error });
  //   }
  // };

  // const getClients = async () => {
  //   setLoadData({ loading: true, error: null });
  //   try {
  //     //querySnapshot es como firebase llama a la obtención de una respuesta, y obtengo los datos con getDocs
  //     const querySnapshot = await getDocs(collection(db, 'Clientes')); //Obtengo los datos de una colección
  //     //Cada colección almacena los datos como documentos, en donde
  //     // itero sobre ellos y extraigo la información de cada uno con .data()
  //     const docs = [];
  //     querySnapshot.forEach((doc) => {
  //       // console.log(doc.data());
  //       docs.push({ ...doc.data(), id: doc.id });
  //     });
  //     docs.sort((a, b) => {
  //       if (a.idCliente < b.idCliente) {
  //         return -1;
  //       }
  //       if (a.idCliente > b.idCliente) {
  //         return 1;
  //       }
  //       return 0;
  //     });
  //     setClientList(docs);
  //     setLoadData({ loading: false, error: null });
  //   } catch (error) {
  //     setLoadData({ loading: false, error: error });
  //   }
  // };

  // const getVendedores = async () => {
  //   setLoadData({ loading: true, error: null });
  //   try {
  //     const querySnapshot = await getDocs(collection(db, 'Vendedores'));
  //     const docs = [];
  //     querySnapshot.forEach((doc) => {
  //       docs.push({ ...doc.data(), id: doc.id });
  //     });
  //     docs.sort((a, b) => {
  //       if (a.idVend < b.idVend) {
  //         return -1;
  //       }
  //       if (a.idVend > b.idVend) {
  //         return 1;
  //       }
  //       return 0;
  //     });
  //     setVendList(docs);
  //     setLoadData({ loading: false, error: null });
  //   } catch (error) {
  //     setLoadData({ loading: false, error: error });
  //   }
  // };

  //Función para mostrar el componente que contendrá el listado de items al facturar
  const showListItems = () => {
    setState({ ...state, showItemsList: !state.showItemsList });
  };
  //Función para mostrar el componente que contendrá el listado de items al facturar
  const showAlert = () => {
    setState({ ...state, showAlert: !state.showAlert });
  };

  //Función para mostrar el componente que contendrá el listado de items al facturar
  const showFormClient = () => {
    setState({ ...state, showFormClient: !state.showFormClient });
  };

  const closeAllModal = () => {
    setState({ ...state, showFormClient: false, showAlert: false });
  };

  //Para añadir o quitar items de la factura
  //Payload se usa para el objeto que quiero pasar al estado en este caso un item
  const addItemFact = (payload, idItemSearch) => {
    if (state.itemsCotiza.length === 0) {
      setState({
        ...state,
        itemsCotiza: [...state.itemsCotiza, payload],
      });
    } else {
      let searchItemsId = [];
      searchItemsId = state.itemsCotiza
        .map(({ idItem }) => idItem)
        .filter((idItem) => idItem === idItemSearch);

      if (searchItemsId.length === 0) {
        setState({
          ...state,
          itemsCotiza: [...state.itemsCotiza, payload],
        });
      } else {
        setState({
          ...state,
          itemsCotiza: [
            ...state.itemsCotiza.map((item) => {
              if (item.idItem !== idItemSearch) return item;
              return {
                ...item,
                cantFact: item.cantFact + 1,
              };
            }),
          ],
        });
      }
    }
  };

  const reduceCantItemFact = (idItemSearch) => {
    setState({
      ...state,
      itemsCotiza: [
        ...state.itemsCotiza.map((item) => {
          if (item.idItem !== idItemSearch) return item;
          return {
            ...item,
            cantFact: item.cantFact - 1,
          };
        }),
      ],
    });
  };

  const removeItemFact = (payload) => {
    setState({
      ...state,
      itemsCotiza: state.itemsCotiza.filter((items) => items.id !== payload.id),
    });
  };

  //   const listaDetItems = await state.itemsCotiza;
  //   if (listaDetItems.length > 0) {
  //     //Las siguientes líneas son para obtener los valores totales de cada columna
  //     const addTotalesItems = state.itemsCotiza.map((item) => {
  //       return {
  //         ...item,
  //         precioTot: item.cantFact * item.precios[0].precio,
  //         valDcto: +calcDcto(
  //           item.cantFact * item.precios[0].precio,
  //           item.precios[0].dcto
  //         ).toFixed(2),
  //         subTotal: +calcSubTotal(
  //           item.cantFact * item.precios[0].precio,
  //           item.precios[0].dcto
  //         ).toFixed(2),
  //         valIva: +calcIVA(
  //           item.cantFact * item.precios[0].precio,
  //           item.precios[0].dcto,
  //           item.precios[0].iva
  //         ).toFixed(2),
  //         totalFinal: +calcTotFinal(
  //           item.cantFact * item.precios[0].precio,
  //           item.precios[0].dcto,
  //           item.precios[0].iva
  //         ).toFixed(2),
  //       };
  //     });

  //     console.log(addTotalesItems);
  //     //Con el nuevo Array con los totales de cada item se procede a calcular la
  //     //Sumatoria total de la factura, almacenando en el objeto de totales del estado del contexto

  //     const tieneDescuento = (item) => item.valDcto > 0; //Predicado para verificar que items tienen descuento
  //     const obtenerSoloDcto = (item) => item.valDcto; //Obtengo solo el valor de Descuento de cada objeto
  //     const acumulador = (acumulador, valores) => acumulador + valores; //predicado de acumulación a usar en cada caso
  //     const itemsConDcto = addTotalesItems
  //       .filter(tieneDescuento)
  //       .map(obtenerSoloDcto)
  //       .reduce(acumulador, 0)
  //       .toFixed(2);

  //     // Declaro predicados para combinación de map, filter y reduce para IVA
  //     const tieneIva = (item) => item.valIva > 0; //Predicado para verificar que items tienen IVA
  //     const sinIva = (item) => !tieneIva(item); //Niego la función anterior para obtener items sin IVA
  //     const obtenerSoloIva = (item) => item.valIva; //Obtengo solo el valor de IVA de cada objeto
  //     const itemsConIva = addTotalesItems
  //       .filter(tieneIva)
  //       .map(obtenerSoloIva)
  //       .reduce(acumulador, 0)
  //       .toFixed(2);

  //     // Con lo obtenido anteriormente puedo extraer el subtotal de los items con IVA
  //     const obtenerSubTotal = (item) => item.precioTot;
  //     const subtotConIva = addTotalesItems
  //       .filter(tieneIva)
  //       .map(obtenerSubTotal)
  //       .reduce(acumulador, 0)
  //       .toFixed(2);

  //     const subtotSinIva = addTotalesItems
  //       .filter(sinIva)
  //       .map(obtenerSubTotal)
  //       .reduce(acumulador, 0)
  //       .toFixed(2);

  //     setState({
  //       ...state,
  //       itemsCotiza: addTotalesItems,
  //       totalesFactura: {
  //         ...state.totalesFactura,
  //         totalDcto: +itemsConDcto,
  //         ivaTotal: +itemsConIva,
  //         subTotIva: +subtotConIva,
  //         subTotIva0: +subtotSinIva,
  //       },
  //     });
  //   }
  // };

  //Detecta cambios realizados en el formulario del detalle principal al cambiar
  //El los inputs datos camo cantidad, precioUnitario, descuentos, etc
  //Gestionado por nivel de anidamiento de objetos
  const handleChangeItems = (idItemSearch, tipe, nivel) => (e) => {
    const buscaCampoNivel1 = (item) => {
      if (item.idItem !== idItemSearch) return item;
      return {
        ...item,
        [e.target.name]: tipe === 'number' ? +e.target.value : e.target.value,
      };
    };
    //Al obtener el item, bajo un nivel más (precios) el cual es un array
    //Por lo tanto mediante un nuevo objeto, traigo toda la información
    //de los objetos de ese array de precios, haciendo el spread mediante
    //la posición obtenida anteriormente, accediendo a la primero posición
    //y en ese punto modifico el precio del objeto de precios en el array.
    const buscaCampoNivel2 = (item, pos) => {
      if (item.idItem !== idItemSearch) return item;
      return {
        ...item,
        precios: [
          {
            ...state.itemsCotiza[pos].precios[0],
            [e.target.name]: +e.target.value,
          },
        ],
      };
    };

    //Busco el item a cambiar cantidad mediante valor enviado en función
    if (nivel === 1) {
      setState({
        ...state,
        itemsCotiza: [...state.itemsCotiza.map(buscaCampoNivel1)],
      });
    }

    //Busco el item a cambiar precio mediante valor enviado en función
    if (nivel === 2) {
      setState({
        ...state,
        itemsCotiza: [...state.itemsCotiza.map(buscaCampoNivel2)],
      });
    }
  };

  //Función para capturar cambios en datos iniciales del estado de contexto
  // En este caso datos de lista de precios y vendedor elegido
  const handleChangeHeader = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  return {
    state,
    setState,
    itemsList,
    clientList,
    vendList,
    loadData,
    addItemFact,
    reduceCantItemFact,
    removeItemFact,
    handleChangeItems,
    handleChangeHeader,
    showListItems,
    showAlert,
    showFormClient,
    closeAllModal,
    getUrl,
    showHeader,
  }; //retorno el estado y funciones a usar
};

export default useInitialState;
