'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import ModulesMain from '../containers/ModulesMain';
import CreateLinkPersonalEmp from '@/containers/CreateLinkPersonalEmp';
import CreateLinkAgenteSop from '@/containers/CreateLinkAgenteSop';
import { validateExpToken } from '../utils/helpers';

const home = () => {
  const [payloadJwt, setPayloadJwt] = useState({});

  useEffect(() => {
    //Obtengo las variables del LocalStorage
    const payloadLS = localStorage.getItem('payload');
    //Si existen las variables, se las transforma en JSON para su uso
    const payloadStorage = payloadLS && JSON.parse(payloadLS);
    payloadLS && setPayloadJwt(payloadStorage);
    validateExpToken();
  }, []);

  return (
    <>
      <Head>
        <title>Soporte Técnico</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {payloadJwt.perfil === 'cliente' &&
      payloadJwt.idClient === 'SIN_EMPRESA' ? (
        <CreateLinkPersonalEmp
          userName={payloadJwt.username}
          subPayload={payloadJwt.sub}
          mail={payloadJwt.mail}
        />
      ) : payloadJwt.perfil === 'agente' && payloadJwt.agSop === '-' ? (
        <CreateLinkAgenteSop
          userName={payloadJwt.username}
          subPayload={payloadJwt.sub}
        />
      ) : (
        <ModulesMain userName={payloadJwt.username} />
      )}
    </>
  );
};

export default home;
