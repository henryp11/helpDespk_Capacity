'use client';
import React from 'react';
import styles from '../styles/modulGeneral.module.css';

const EstatusAgente = ({ solicByAgente }) => {
  console.log(solicByAgente);

  return (
    <>
      <div className={styles.solicAgentContainer}>
        <h4>Solicitudes en atención por agente</h4>
        <div>
          <div className={styles.solicAgentGrid}>
            <span></span>
            <h3
              style={{
                gridColumn: '4 span',
                color: '#1a73e8',
                // border: '1px solid #1a73e8',
              }}
            >
              Estado Solicitudes
            </h3>
          </div>
          <div className={styles.solicAgentGrid}>
            <span>Agente</span>
            <span>Asignado</span>
            <span>Proceso</span>
            <span>Pausado</span>
            <span>Reasignado</span>
          </div>
          {solicByAgente.map((agente) => {
            return (
              <div key={agente.id_agente} className={styles.solicAgentGrid}>
                <span>{`${agente.id_agente} | ${agente.nombre}`}</span>
                <span>
                  {
                    agente.det_tickets.filter((solicitud) => {
                      return solicitud.estatus === 'asignado';
                    }).length
                  }
                </span>
                <span>
                  {
                    agente.det_tickets.filter((solicitud) => {
                      return solicitud.estatus === 'proceso';
                    }).length
                  }
                </span>
                <span>
                  {
                    agente.det_tickets.filter((solicitud) => {
                      return solicitud.estatus === 'pausado';
                    }).length
                  }
                </span>
                <span>
                  {
                    agente.det_tickets.filter((solicitud) => {
                      return solicitud.estatus === 'reasignado';
                    }).length
                  }
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default EstatusAgente;
