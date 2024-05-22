'use client';
import dynamic from 'next/dynamic';
// Exporto Toaster para mensajes estilizados, como es un componente
// que se ejecuta solo en el cliente, lo transformo en componente dinámico
// EN next , hago la llamado y lo importo para usarlo como componente
// en el archivo global de la app _app.js

export const Toaster = dynamic(
  async () => {
    const { Toaster } = await import('react-hot-toast');
    return Toaster;
  },
  { ssr: false }
);
