import React from 'react';
import Link from 'next/link';
import styles from '../styles/error.module.css';
const ErrorLayout = ({ messageError, statusCode, customMessage, account }) => {
  console.log(messageError);
  return (
    <div className={styles.errorContainer}>
      {customMessage && <h3>{customMessage}</h3>}
      {!customMessage && <h2>Error {statusCode}</h2>}
      {/* {!customMessage && messageError[0].code !== 'ERR_NETWORK' ? ( */}
      {!customMessage ? (
        messageError?.map((error, index) => {
          return <p key={index}>{error}</p>;
        })
      ) : (
        <p>{messageError[0].code}</p>
      )}
      {/* {!customMessage && messageError[0].code !== 'ERR_NETWORK' ? (
        messageError.map((error, index) => {
          return <p key={index}>{error}</p>;
        })
      ) : (
        <p>{messageError[0].code}</p>
      )} */}
      {account && <Link href="/account">Crear Cuenta</Link>}
    </div>
  );
};

export default ErrorLayout;
