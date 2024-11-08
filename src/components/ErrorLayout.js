import React from 'react';
import Link from 'next/link';
import styles from '../styles/error.module.css';
const ErrorLayout = ({
  messageError,
  statusCode,
  customMessage,
  account,
  restart,
}) => {
  console.log({ codeError: statusCode, error: messageError });
  return (
    <div className={styles.errorContainer}>
      <h2>Error {statusCode}</h2>
      {customMessage && <h3>{customMessage}</h3>}
      {/* {!customMessage && messageError[0].code !== 'ERR_NETWORK' ? ( */}

      {/* {messageError?.map((error, index) => {
        return <p key={index}>{error}</p>;
      })} */}
      {!customMessage &&
        messageError?.map((error, index) => {
          return <p key={index}>{error}</p>;
        })}
      {/* {!customMessage && messageError[0].code !== 'ERR_NETWORK' ? (
        messageError.map((error, index) => {
          return <p key={index}>{error}</p>;
        })
      ) : (
        <p>{messageError[0].code}</p>
      )} */}
      {account && (
        <Link
          style={{
            color: 'blue',
            textDecoration: 'underline',
            margin: '4px',
            fontWeight: 'bold',
          }}
          href="/account"
        >
          CREAR CUENTA
        </Link>
      )}
      {restart && (
        <Link
          style={{
            color: 'blue',
            textDecoration: 'underline',
            margin: '4px',
            fontWeight: 'bold',
          }}
          href="/recovery/recoverypass"
        >
          REESTABLECER CONTRASEÑA
        </Link>
      )}
    </div>
  );
};

export default ErrorLayout;
