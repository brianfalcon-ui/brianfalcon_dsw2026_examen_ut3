# Respuesta: Preparación de proyecto
- **Acceder al backend**: Se arranca entrando primeramente en la carpeta del backend `\simulacro` y se debe de realizar un `npm install` para instalar sus dependencias.
- **Configuración de variables de entorno**: Posteriormente se debe de realizar una copia del `.env.example`, y renombrarla a `.env`. En el valor de `PORT`, se ha de poner el puerto cuyo se quiere abrir el servidor.
- **Apertura y puesta en marcha**: Para abrirlo en su versión de desarrollo, se debe ejecutar `npm run dev` en caso de querer hacerlo en su versión de producción se ha de hacer `npm run build` y posteriormente `npm start`
# Respuesta: ResourceNotFoundError

- **Creación del error:** en `simulacro/src/services/documentsService.ts`, la función `getById` lanza `ResourceNotFoundError` cuando no encuentra el documento. Incluye el identificador solicitado, el estado `404` y el código `RESOURCE_NOT_FOUND`.
- **Conversión a respuesta HTTP:** en `simulacro/src/middlewares/errorHandler.ts`, el manejador centralizado reconoce `ResourceNotFoundError` y responde con estado `404` y las propiedades `message` y `resourceId`.
- **Comprobación Bruno:** la petición `simulacro/bruno/connectia/04 - Documento inexistente (404).bru` comprueba el estado HTTP, el mensaje y el identificador.
