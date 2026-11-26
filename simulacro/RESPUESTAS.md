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


# Respuesta 7: Listado, búsqueda y paginación de avisos

- **Valores por defecto:** `page` vale `1` y `limit` vale `2`.
- **Validación:** como `req.query` llega como texto, se convierte con `Number()`. Si no son enteros mayores que cero, se lanza un `AppError` y `errorHandler` responde `400` (`INVALID_PAGINATION`).
- **Búsqueda:** `search` se busca en el título sin distinguir mayúsculas. Se le aplica `trim()`, así que si no se envía, está vacío o solo tiene espacios, no filtra.
- **Paginación:** primero se filtra y después se corta con `slice`. Por eso `total` cuenta los avisos que cumplen el filtro antes de paginar. Sin resultados, o con una página posterior a la última, `slice` devuelve `[]` con estado `200`.
- **Evidencia:** peticiones de Bruno 10 a 15.

# Respuesta 8: Creación, consulta y actualización de avisos

- **Creación:** `title` es obligatorio y se guarda ya con `trim()`. `description` es opcional (`''` si se omite) y, si se envía, debe ser una cadena. El servicio genera `id` y `createdAt` y se responde `201`.
- **Consulta:** si el aviso no existe, `getById` lanza `ResourceNotFoundError` con el identificador solicitado.
- **Actualización:** el controlador solo extrae `title` y `description`, por lo que `id` y `createdAt` se conservan. Los campos omitidos quedan como `undefined` y el servicio no los toca.
- **Todo o nada:** se validan los dos campos antes de llamar al servicio. Si uno falla, no se modifica ninguno.
- **Aviso inexistente:** `update` reutiliza `getById`, así que propaga `ResourceNotFoundError`. Si el cuerpo además es inválido, se responde `400`, porque se valida primero.
- **Errores:** los datos inválidos usan `AppError` y el manejador centralizado. Las validaciones son condicionales en el propio controlador, igual que en documentos.
- **Evidencia:** peticiones de Bruno 16 a 25. La 20 envía solo `description` y la 21 demuestra con una consulta posterior que el título se conserva. La 22 envía un título válido y una descripción inválida, y la 23 demuestra que no cambió nada.

# Respuesta 9: Comportamiento en producción

Evidencias: `evidencias/09-development.txt` y `evidencias/09-production.txt`. El error temporal se lanzó en `getById` de avisos (solo para el id `fallo`), en una copia del proyecto.

- **¿Cambiar `NODE_ENV` desactiva el logger?** No. En ambos modos aparecen sus registros. El logger solo depende de `env.LOG === "ON"`, que es una variable independiente.
- **Respuesta al error inesperado:** en los dos casos es `500` con `INTERNAL_ERROR`. En desarrollo, `message` es el real (`Fallo interno de prueba`). En producción es genérico (`An unexpected error occurred`) para no revelar detalles internos.
- **Registros del manejador:** en ambos aparecen `requestId` y `error`. En desarrollo incluye además `stack`; en producción no aparece.
- **Instrucciones que lo explican** (`errorHandler.ts`):
  - `const isProduction = env.NODE_ENV === 'production';`
  - `stack: isProduction ? undefined : err.stack` (`JSON.stringify` omite las propiedades `undefined`).
  - `message: isProduction ? 'An unexpected error occurred' : err.message`
- La petición correcta responde igual en ambos modos. Hay que reiniciar porque las variables se leen una sola vez, al arrancar (`env.ts`).

# Respuesta 10: Dos fallos de middleware

Cada prueba se hizo por separado en una copia temporal. El código entregado no contiene ninguno de los dos fallos.

## Prueba 1: `notFound` antes de los routers

- **Qué esperaba:** que las rutas válidas respondieran `404`.
- **Qué sucedió:** `/health/live` y `/api/v1/notices` respondieron `404`.
- **Respuesta:** `{"error":"NOT_FOUND","message":"Route not found: GET /health/live"}`.
- **Explicación:** Express ejecuta los middleware en el orden de registro. `notFound` se registra sin ruta, así que coincide con todo; responde y no llama a `next()`, por lo que los routers no se ejecutan.
- **Corrección:** volver a registrarlo después de todas las rutas y antes de `errorHandler`.
- **Evidencia:** `evidencias/10-1-notFound-antes.txt`.

## Prueba 2: logger sin `next()`

- **Qué esperaba:** que la petición se quedara esperando.
- **Qué sucedió:** no llegó a ninguna ruta y tampoco apareció ningún registro de la petición.
- **Respuesta:** ninguna. `curl` abandonó a los 5 segundos (código 28).
- **Explicación:** el logger no responde ni cede el control, así que la cadena se detiene. Su callback de `finish` no se ejecuta porque nunca se envía una respuesta.
- **Corrección:** restaurar `next();` al final del logger, fuera del callback y del `if`.
- **Evidencia:** `evidencias/10-2-logger-sin-next.txt`.

# Respuesta 11: Recorrido de las peticiones

Todas pasan primero por `requestId`, después **entran** en `logger` (guarda la hora, se suscribe a `finish` y llama a `next()`) y luego por `express.json()`. El **callback de `finish`** se ejecuta al final, cuando la respuesta ya se ha enviado, y es el que escribe el registro si `LOG=ON`.

| Caso | Recorrido después de `requestId` → `logger` | Dónde se genera la respuesta | ¿`errorHandler`? |
| --- | --- | --- | --- |
| 1. Documento existente (`200`) | `express.json` → `documentsRouter` → `documentsController.getById` → `documentsService.getById` | Controlador, `res.json` | No |
| 2. Documento inexistente (`404`) | `express.json` → `documentsRouter` → controlador → el servicio lanza `ResourceNotFoundError` | `errorHandler` | Sí |
| 3. URL inexistente (`404`) | `express.json` → ningún router ni ruta coincide → `notFound` | `notFound` | No |
| 4. Aviso con título inválido (`400`) | `express.json` (JSON correcto) → `noticesRouter` → `noticesController.create` → la validación lanza `AppError` (no se llama al servicio) | `errorHandler` | Sí |
| 5. JSON mal formado (`400`) | `express.json` falla con `SyntaxError`; se saltan routers y `notFound` | `errorHandler` (`INVALID_JSON`) | Sí |
| 6. Documento con título vacío (`400`) | `express.json` → `documentsRouter` → `documentsController.update` (no se llama al servicio) | Controlador, `res.status(400).json` + `return` | No |

En los seis casos se ejecuta después el callback de `finish`. Evidencia: `evidencias/11-recorridos-requestId.txt`.

> El caso 5 se comprueba con `curl`: el CLI de Bruno convierte el cuerpo mal formado de la petición 28 en una cadena JSON. También obtiene `INVALID_JSON`, porque `express.json()` solo admite objetos y arrays.

## Preguntas

- **¿Por qué `notFound` no llama a `next()`?** Porque es el final del camino para las rutas no encontradas: ya envía la respuesta `404` y no queda nada más que hacer.
- **¿Por qué con `next(err)` no se ejecuta `notFound`?** Porque al haber un error, Express se salta los middleware normales (los de menos de cuatro parámetros) y busca un manejador de errores. Lo mismo ocurre cuando se lanza un error con `throw`.
- **¿Por qué el manejador necesita cuatro parámetros?** Express identifica un manejador de errores por el número de parámetros declarados. Sin `_next` lo trataría como un middleware normal, y no recibiría los errores.
- **Ruta inexistente frente a recurso inexistente:** en la ruta inexistente ningún endpoint coincide con el método y la URL (responde `notFound`). En el recurso inexistente la ruta sí existe, pero no hay datos con ese id (el servicio lanza `ResourceNotFoundError`). Ambos son `404`.
- **¿Por qué el logger usa `finish`?** Porque al entrar en el logger la respuesta aún no existe. En `finish` ya se conocen el estado definitivo y la duración.
- **¿Para qué sirve `requestId`?** Identifica cada petición. Se devuelve en la cabecera `X-Request-Id` y aparece en los registros, lo que permite relacionarlos aunque se mezclen varias peticiones. Ejemplo del caso 2 (`stack` omitido):

  ```text
  X-Request-Id: 2c14070b-87c8-4426-8472-e09532df4e54
  {"requestId":"2c14070b-87c8-4426-8472-e09532df4e54","error":"Document with id 'no-existe' not found"}
  {"requestId":"2c14070b-87c8-4426-8472-e09532df4e54","method":"GET","path":"/api/v1/admin/documents/no-existe","status":404,"durationMs":2.63}
  ```

  Observación: el logger usa `req.path`, que dentro de un router es relativa al punto de montaje. Por eso, cuando responde el controlador (casos 1 y 6), el registro no muestra el prefijo `/api/v1/admin/documents`. Con `req.originalUrl` se vería la URL completa.

- **¿Es obligatorio separar router, controlador y servicio?** No, Express permite escribirlo todo en la propia ruta. La separación reparte responsabilidades: el router asocia URL y método, el controlador trata la petición y la respuesta HTTP, y el servicio gestiona los datos sin depender de `req` ni `res`. Así el código es más fácil de mantener, probar y reutilizar, y se podría cambiar el array por una base de datos tocando principalmente el servicio.
- **¿Qué pasa con los avisos creados al reiniciar?** Se pierden, porque solo están en un array en la memoria del proceso. Al arrancar de nuevo quedan únicamente los cinco avisos iniciales. Evidencia: `evidencias/11-reinicio.txt`.

# Respuesta 12: Comprobación final

- `npm run typecheck` y `npm run lint` terminan sin errores. Antes había dos errores de lint: el parámetro `_next` sin usar y el `namespace` de `requestId.ts`. Ambos son necesarios, por lo que se desactiva la regla solo en esa línea, con un comentario que lo justifica.
- La colección de Bruno (`bruno/connectia`) pasa completa: 29 peticiones y 60 aserciones, incluidas las de documentos, preguntas y health.
- Se retiraron los restos temporales de `health.ts`. Los fallos de las pruebas 9 y 10 se hicieron en una copia.
- El proyecto usa el puerto `4000` (`.env.example`, valor por defecto de `env.ts` y entorno de Bruno).
- `.env`, `node_modules/` y `dist/` están ignorados por Git.
- El índice de evidencias está en `evidencias/README.md`.
