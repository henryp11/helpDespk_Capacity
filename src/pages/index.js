// Este archivo index.js ubicado en pages es la raíz principal del
// sitio es decir la aplicaicón como tal ya que las rutas en next se manejan por archivos

import Head from 'next/head';
import Login from '../containers/Login';

export default function Home() {
  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Login />
    </>
  );
}
