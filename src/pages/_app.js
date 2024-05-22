//Este es el archivo que ejecuta la aplicación como tal por lo tanto aquí colocare
//todas las configuraciones globales como estilos css y principalmente el contexto
//También colocaré los componentes a repetir como si fuese el layout en React
import Head from 'next/head';
import Header from '../containers/Header';
import Appcontext from '../context/AppContext';
import { Toaster } from '../componentHide/_Toaster';
//import Header from "components/Header";
import useInitialState from '../hooks/useInitialState';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  //Inicializo el estado
  const initialState = useInitialState();
  //Dentro del return aplico el Provider de AppContext
  return (
    <Appcontext.Provider value={initialState}>
      <Head>
        {/* Titulo por default en páginas si importa la equiqueta Head */}
        <title>HelpDesk Capacity</title>
      </Head>
      <Header />
      <Component {...pageProps} />
      <Toaster reverseOrder={true} />
    </Appcontext.Provider>
  );
}
