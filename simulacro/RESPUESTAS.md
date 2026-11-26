# Respuesta 1: Preparación de proyecto
- **Acceder al backend**: Se arranca entrando primeramente en la carpeta del backend `\simulacro` y se debe de realizar un `npm install` para instalar sus dependencias.
- **Configuración de puerto en variables de entorno**: Posteriormente se debe de realizar una copia del `.env.example`, y renombrarla a `.env`. En el valor de `PORT`, se ha de poner el puerto cuyo se quiere abrir el servidor. 
- **Como llega al arranque:** Para llegar el valor al arranque sale de .env, hacia env.ts que carga el archivo en `process.env` y lo pasa a numero porque llega como texto y, finalmente llega a `server.ts` que importa env y llama al `listen`
- **Porque se sube el .env.example y no .env:** Porque .env.example es una plantilla de como debe de quedar, el .env no se sube porque puede contener claves reales y quedarian expuestas.
- **Apertura y puesta en marcha**: Para abrirlo en su versión de desarrollo, se debe ejecutar `npm run dev` en caso de querer hacerlo en su versión de producción se ha de hacer `npm run build` y posteriormente `npm start`

# Respuesta 3: ResourceNotFoundError

- **Creación del error:** en `simulacro/src/services/documentsService.ts`, la función `getById` crea y lanza (`throw new ResourceNotFoundError(...)`) el error cuando no encuentra el documento. Incluye el estado `404`, el mensaje, el código `RESOURCE_NOT_FOUND` y el identificador solicitado.
- **Propagación:** ni el servicio ni el controlador capturan el error. Express 5 lo recoge y lo envía al manejador centralizado.
- **Conversión a respuesta HTTP:** en `simulacro/src/middlewares/errorHandler.ts`, el manejador reconoce el error con `instanceof ResourceNotFoundError` y, con `res.status(err.statusCode).json(...)`, responde con estado `404` y las propiedades `message` y `resourceId`.
- **Comprobación en Bruno:** la petición `simulacro/bruno/connectia/04 - Documento inexistente (404).bru` comprueba el estado HTTP, el mensaje y el identificador.


# Respuesta 4: Error directamente en el controlador
**Diferencias:**
- En el 3 la petición pasa por el `router` y el `controlador`, que llama al `servicio`. Si el documento no existe, el `servicio` lanza un `ResourceNotFoundError`. El `controlador` no lo captura, así que express lo envía a `errorHandler`, que lo reconoce y responde con un `404`. En la consola aparecen el registro de errorHandler y el del logger.

- En el 4 la petición pasa por el `router` y llega al `controlador`. Si el título es inválido, `el propio controlador responde` con `res.status(400).json(...)` y hace `return`. No lanza ningún error ni llama a next(err), así que no interviene errorHandler. Tampoco llama al servicio de actualización, por lo que el documento no cambia. En la consola solo aparece el registro del logger, con estado 400.

# Respuesta 5: ¿Por qué deshabilitar el logger no debe impedir que la petición llegue a las rutas?
- No lo impide porque se llama a `next()` fuera del if del logger, y hace que llame al siguiente middleware hasta llegar a las rutas, si estuviera dentro del if y el log fuera off, no llegaria a las rutas
