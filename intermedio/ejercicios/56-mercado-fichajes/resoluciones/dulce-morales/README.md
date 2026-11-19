# Intermedio 56: Mercado de fichajes futbol

**Tematica:** futbol
**Alumna:** Dulce Morales

## Problema

El ultimo dia del mercado de fichajes, un club negocia **varios jugadores a la vez**:

- cada negociacion es asincrona: se manda una oferta y el otro club tarda en responder;
- la respuesta puede ser aceptar, contraofertar o rechazar, y se negocia hasta 3 rondas;
- si se acepta, el jugador pasa una **revision medica** (tambien asincrona) que puede fallar;
- el presupuesto se **reserva** al aceptar, para no gastar dos veces el mismo dinero en negociaciones paralelas;
- a la hora de **cierre** del mercado ya no se aceptan tratos.

## Que hice

### Async

- `responder(objetivo, oferta)` y `revisionMedica(objetivo)` son `async` y simulan la demora con `await`.
- `DirectorDeportivo.fichar(objetivo)` es `async`: hace las rondas, reserva el dinero y espera la revision.
- `main` lanza **todas** las negociaciones juntas con `Promise.allSettled`, asi un fichaje fallido no cancela a los demas.

### Errores tipados

- `ErrorVentanaCerrada`: el mercado cerro durante la negociacion.
- `ErrorPresupuesto`: incluye cuanto falta.
- `ErrorNegociacion`: oferta rechazada, o piden mas que el maximo.
- `ErrorMedico`: no paso la revision.

`type ErrorFichaje` los une, y el type guard `esErrorFichaje` permite mostrarlos de forma segura. Un error de otro tipo se vuelve a lanzar.

`RespuestaClub` es una union discriminada: acepta, contraoferta (con monto) o rechaza (con motivo).

### Encapsulamiento

`DirectorDeportivo` guarda **privados** el dinero disponible, las reservas (un `Map`), la bitacora y la hora de inicio. Si la revision medica falla, el `catch` **libera la reserva** y vuelve a lanzar el error.

### Reglas del club vendedor

- **Acepta** si la oferta es al menos 110% del valor de mercado.
- **Contraoferta** pidiendo el 125% si la oferta es al menos el 80%.
- Si no, **rechaza**.
- Si la contraoferta pasa el maximo del comprador, se abandona la negociacion.

### Casos probados

- **Fichado tras negociar:** Lautaro Paz (ofrecen 35 M, piden 50 M, se acepta).
- **Limite:** la contraoferta por Tomas Rey es **exactamente** su maximo (25 M) y se acepta.
- **Rechazo:** la oferta por Ines Mora es demasiado baja.
- **Revision medica:** Bruno Leal se acepta, pero no pasa la revision, asi que se libera su reserva de 28 M.
- **Presupuesto:** cuando aceptan a Kevin Sol por 75 M, el dinero ya esta reservado para otros fichajes.
- **Cierre:** el club de Hugo Diaz responde tan lento que el mercado cierra antes de terminar.
- **Repetible:** corri el programa 3 veces y la salida fue identica.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/56-mercado-fichajes/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
================ ULTIMO DIA DE FICHAJES (presupuesto 110 M, todas las negociaciones a la vez) ================

--- Bitacora (en el orden en que paso) ---
Lautaro Paz: ronda 1, oferta 35 M
Ines Mora: ronda 1, oferta 20 M
Bruno Leal: ronda 1, oferta 28 M
Tomas Rey: ronda 1, oferta 17 M
Kevin Sol: ronda 1, oferta 50 M
Hugo Diaz: ronda 1, oferta 21 M
Bruno Leal: ACEPTADO por 28 M (reservado; quedan 82 M)
Lautaro Paz: contraoferta de 50 M
Lautaro Paz: ronda 2, oferta 50 M
Tomas Rey: contraoferta de 25 M
Tomas Rey: ronda 2, oferta 25 M
Kevin Sol: contraoferta de 75 M
Kevin Sol: ronda 2, oferta 75 M
Bruno Leal: se libera la reserva de 28 M
Lautaro Paz: ACEPTADO por 50 M (reservado; quedan 60 M)
Tomas Rey: ACEPTADO por 25 M (reservado; quedan 35 M)
Hugo Diaz: contraoferta de 27.5 M
Hugo Diaz: ronda 2, oferta 27.5 M

--- Resultado por jugador ---
FICHADO   Lautaro Paz  DEL de River Sur       por 50 M (valor 40 M)
NO        Ines Mora    [ErrorNegociacion] Ines Mora: la oferta es demasiado baja
NO        Bruno Leal   [ErrorMedico] Bruno Leal no paso la revision medica
FICHADO   Tomas Rey    POR de Union Valle     por 25 M (valor 20 M)
NO        Kevin Sol    [ErrorPresupuesto] no alcanza el presupuesto para Kevin Sol (faltan 40 M)
NO        Hugo Diaz    [ErrorVentanaCerrada] el mercado cerro antes de cerrar el trato por Hugo Diaz

Gastado: 75 M | presupuesto restante: 35 M
```
