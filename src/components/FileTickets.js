'use client';
import React, { useState, useEffect } from 'react';
import { storage } from '@/server/firebase';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'; //Storage de firebase para almacenar archivos
import { toast } from 'react-hot-toast';
import { RiFileWord2Line } from 'react-icons/ri';
import { RiFileExcel2Line } from 'react-icons/ri';
import { FaRegFilePdf } from 'react-icons/fa6';
import { TbFileTypeTxt } from 'react-icons/tb';
import { TbFileTypeXml } from 'react-icons/tb';
import styles from '@/styles/forms.module.css';

//Función fuera del componente para ejecutar una unica vez al cargar el componente
const scrollUp = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const FileTickets = ({
  setStateSolicitud, //Para modificar el estado del componente solicitud anterior
  stateSolicitud,
  idFile, //Corresponde al key del array de capturas para modificar (file1, 2,3, 4)
  idTicket,
  setReset, //Para resetear los archivos y previews usados cuando se añade una nueva solicitud
  reset,
  showModal,
  setShowModalFile,
}) => {
  //Aquí ejecuto antes de la carga del componente la función para que siempre empiece desde el principio, otra forma de usar useState.
  useState(scrollUp);
  const [archivo, setArchivo] = useState(null); //captura archivo a subir a storage
  const [previewImg, setPreviewImg] = useState(''); //Para mostrar un preview de la imagen a subir
  const [isUpload, setIsUpload] = useState(true); //Detecta si se selecciona una imagen para obligar a subirle primero
  //const [nameImgInicial, setNameImgInicial] = useState(data.image.name); //Se utiliza al editar un producto para capturar el nombre de la imagen si existe y poderla eliminar si se requiere

  useEffect(() => {
    if (reset) {
      //Resetea valores cuando se añade una nueva solicitud;
      setArchivo(null);
      setPreviewImg('');
      setReset(false);
    }
  }, [reset]);

  // Para detectar la selección de un archivo. El parámetro "numFile" es para enviar en cada input
  // la posición dentro del objeto de capturas con el nombre del parámetro dependiendo de cual se está subiendo
  //(file1, file2, file3, file4) ya que solo se permitirá 4 archivos por solicitud.
  const handleFile = (numFile) => (e) => {
    //Detectar archivo
    const fileDetect = e.target.files[0];
    console.log({ fileDetect });
    if (fileDetect) {
      setArchivo(fileDetect);
      const reader = new FileReader(); //Objeto de JS para poder previsualizar la imagen seleccionada
      //Carga el resultado de la imagen capturada
      reader.onload = () => {
        setPreviewImg(reader.result);
      };
      reader.readAsDataURL(fileDetect); //Transforma imagen capturada en string de tipo byte 64 para poderlo visualizar

      //Cada vez que se elija un archivo primero guardo el nombre de este
      setStateSolicitud({
        ...stateSolicitud,
        capturas: {
          ...stateSolicitud.capturas,
          [numFile]: {
            name: `${idTicket}_${fileDetect.name}`,
            type: `${fileDetect.type}`,
            size: `${fileDetect.size}`,
          },
        },
      });

      toast('No olvide dar clic en [SUBIR]', {
        icon: '🔔',
        duration: 4000,
      });
    } else {
      //Si se cancela la selección de una imagen se quita el preview y se encera los campos de la imagen
      setPreviewImg('');
      setStateSolicitud({
        ...stateSolicitud,
        capturas: {
          ...stateSolicitud.capturas,
          [numFile]: { name: '', type: '', size: '' },
        },
      });
      setIsUpload(true);
    }
  };

  //Función que se encargará de cargar archivos al storage de Firebase
  const handleStorage = async (numFile) => {
    if (archivo) {
      //Cargar al Storage
      setIsUpload(false);
      const refArchivo = ref(
        storage,
        `soporte/${idTicket}/${stateSolicitud.capturas[numFile].name}` // `soporte/${stateSolicitud.capturas.file1.name}`
      );
      await uploadBytes(refArchivo, archivo); //Carga el archivo al storage dando la referencia y el archivo a cargar
      //Obtengo URL del archivo en Storage para colocarla en el producto a crear
      let urlArchivo = await getDownloadURL(refArchivo);
      setStateSolicitud({
        ...stateSolicitud,
        capturas: {
          ...stateSolicitud.capturas,
          [numFile]: { ...stateSolicitud.capturas[numFile], url: urlArchivo },
        },
      });
      //Solo se ejecuta si el nombre de la imagen inicial es distinto de la nueva imagen
      //Ya que si sube una imagen con un nombre  igual al nombre inicial que tenía al momento
      //De comenzar la edición, se subirá la imagen y al mismo tiempo se eliminaría.
      // if (nameImgInicial !== valueState.image.name) {
      //   deleteImageOld(); //Se elimina la imagen anterior del Storage si existiera
      // }

      toast.success('Archivo subido con éxito!');
      setIsUpload(true);
      setShowModalFile({ ...showModal, active: false });
    }
  };

  //Para eliminar archivo

  const removeImage = (numFile) => {
    const desertRef = ref(
      storage,
      `soporte/${idTicket}/${stateSolicitud.capturas[numFile].name}`
    );
    deleteObject(desertRef)
      .then(() => {
        console.log('File deleted successfully');
        setStateSolicitud({
          ...stateSolicitud,
          capturas: {
            ...stateSolicitud.capturas,
            [numFile]: {
              ...stateSolicitud.capturas[numFile],
              name: '',
              url: '',
              type: '',
              size: '',
            },
          },
        });
        setPreviewImg('');
        toast.success('Archivo eliminado con éxito!');
      })
      .catch((error) => {
        console.log(`Error al eliminar archivo: ${error}`);
      });
  };

  console.log({ stateSonInFileTK: stateSolicitud });
  console.log({ reset });
  console.log({ archivo });
  console.log({ previewImg });
  return (
    <>
      {showModal.active && showModal.name === idFile && (
        <div className={`${styles.inputImage} ${styles.inputImageModal}`}>
          <h1>Para añadir un archivo, de click en el recuadro o arrastrelo</h1>
          <button
            tittle="Cancelar"
            type="button"
            onClick={() => {
              setShowModalFile({ ...showModal, active: false });
              // Al Cerrar el modal de preview de archivos, si solo está viendo un archivo
              // Ya subido y cancela no se quitara el URL de estado de la solicitud
              // Esta condición solo aplica para cuando se ha seleccionado algún archivo
              //Y no se subió al Storage y se dió clic en cancelar, se entiende que debe enserar el estado del archivo
              if (!stateSolicitud.capturas[idFile].url) {
                setStateSolicitud({
                  ...stateSolicitud,
                  capturas: {
                    ...stateSolicitud.capturas,
                    [idFile]: {
                      name: '',
                      url: '',
                    },
                  },
                });
              }
            }}
            style={{
              position: 'absolute',
              top: '25px',
              right: '1%',
              background: '#800000',
              borderRadius: '50%',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </button>
          <span style={{ position: 'relative' }}>
            <input type="file" id="file" onChange={handleFile(idFile)} />
            <div className={styles.containerPreview}>
              <h2>
                {stateSolicitud.capturas[idFile].name &&
                  `Nombre Archivo: ${stateSolicitud.capturas[idFile].name}`}
              </h2>
              {archivo && (
                <>
                  {(archivo.type.includes('application/x-msdownload') ||
                    archivo.name.includes('.bat') ||
                    archivo.name.includes('.ps1') ||
                    archivo.name.includes('.ps') ||
                    archivo.name.includes('.cmd')) && (
                    <p
                      style={{
                        color: 'red',
                        fontSize: '24px',
                        margin: '8px',
                      }}
                    >
                      Tipo de Archivo Inválido!!
                    </p>
                  )}
                  {archivo.size > 5000000 && (
                    <p
                      style={{
                        color: 'white',
                        fontSize: '20px',
                        margin: '8px',
                        textAlign: 'center',
                      }}
                    >
                      El Archivo no puede pesar más de 5MB, si desea enviarlo,
                      puede usar otros medios como correo electrónico o utilizar
                      el servicio{' '}
                      <a
                        href="https://wetransfer.com/"
                        target="_blank"
                        style={{
                          textDecoration: 'underline',
                          fontWeight: 'bold',
                        }}
                      >
                        Wetransfer
                      </a>
                    </p>
                  )}
                  {archivo.type.includes('image') && (
                    <img
                      src={previewImg}
                      alt={stateSolicitud.capturas[idFile].name}
                      className={styles.previewImage}
                    />
                  )}
                  {archivo.type.includes(
                    'officedocument.wordprocessingml.document'
                  ) && (
                    <span className="reactIconsFiles">
                      <RiFileWord2Line />
                    </span>
                  )}
                  {archivo.type.includes(
                    'officedocument.spreadsheetml.sheet'
                  ) && (
                    <span className="reactIconsFiles">
                      <RiFileExcel2Line />
                    </span>
                  )}
                  {archivo.type.includes('application/pdf') && (
                    <span className="reactIconsFiles">
                      <FaRegFilePdf />
                    </span>
                  )}

                  {archivo.type.includes('text/plain') && (
                    <span className="reactIconsFiles">
                      <TbFileTypeTxt />
                    </span>
                  )}
                  {archivo.type.includes('text/xml') && (
                    <span className="reactIconsFiles">
                      <TbFileTypeXml />
                    </span>
                  )}
                </>
              )}

              {!archivo && stateSolicitud.capturas[idFile].url && (
                <>
                  {stateSolicitud.capturas[idFile].type.includes('image') && (
                    <img
                      src={stateSolicitud.capturas[idFile].url}
                      alt={stateSolicitud.capturas[idFile].name}
                      className={styles.previewImage}
                    />
                  )}
                  {stateSolicitud.capturas[idFile].type.includes(
                    'officedocument.wordprocessingml.document'
                  ) && (
                    <span className="reactIconsFiles">
                      <RiFileWord2Line />
                    </span>
                  )}
                  {stateSolicitud.capturas[idFile].type.includes(
                    'officedocument.spreadsheetml.sheet'
                  ) && (
                    <span className="reactIconsFiles">
                      <RiFileExcel2Line />
                    </span>
                  )}
                  {stateSolicitud.capturas[idFile].type.includes(
                    'application/pdf'
                  ) && (
                    <span className="reactIconsFiles">
                      <FaRegFilePdf />
                    </span>
                  )}

                  {stateSolicitud.capturas[idFile].type.includes(
                    'text/plain'
                  ) && (
                    <span className="reactIconsFiles">
                      <TbFileTypeTxt />
                    </span>
                  )}
                  {stateSolicitud.capturas[idFile].type.includes(
                    'text/xml'
                  ) && (
                    <span className="reactIconsFiles">
                      <TbFileTypeXml />
                    </span>
                  )}
                </>
              )}
            </div>
            {previewImg && (
              <button
                onClick={() => {
                  handleStorage(idFile);
                }}
                type="button"
                tittle="Guardar Archivo"
                disabled={
                  archivo.type.includes('application/x-msdownload') ||
                  archivo.name.includes('.bat') ||
                  archivo.name.includes('.ps1') ||
                  archivo.name.includes('.ps') ||
                  archivo.name.includes('.cmd') ||
                  archivo.size > 5000000
                    ? true
                    : false
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                Subir Archivo <br />
                {!isUpload && `Subiendo por favor espere...`}
              </button>
            )}
            {!archivo && stateSolicitud.capturas[idFile].url && (
              <button
                onClick={() => {
                  removeImage(idFile);
                }}
                className={styles.removeImage}
                type="button"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 13.5H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
                Quitar Archivo
              </button>
            )}
          </span>
        </div>
      )}
    </>
  );
};

export default FileTickets;
