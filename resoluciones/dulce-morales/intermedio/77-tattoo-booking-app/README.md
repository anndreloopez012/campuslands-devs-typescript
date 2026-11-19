# Intermedio 77 - Booking tattoo app

**Tematica:** tatuajes
**Alumna:** Dulce Morales

## Problema

La app de citas de un estudio de tatuajes. A partir de una solicitud hay que estimar la duracion y el
precio, encontrar al artista adecuado con el primer hueco libre, manejar anticipos y cancelaciones, y
generar un reporte por artista.

## Que hice

- `SolicitudDTO` trae lo que manda el formulario: estilo, tamano, zona, color, artista preferido y
  desde que dia se busca cita.
- `Cita` es una union discriminada que funciona como maquina de estados: `pendiente` -> `confirmada`
  -> `completada`, o -> `cancelada`. Cada estado guarda solo sus datos: el anticipo, lo cobrado o el
  reembolso y lo retenido.
- `RepoCitas` es un repositorio en memoria. Las citas canceladas liberan su horario.
- `Estudio` es el servicio:
  - `solicitar` busca entre los artistas que hacen ese estilo y elige la cita mas pronta; si hay
    empate, la mas barata.
  - Tambien incluye `pagarAnticipo`, `completar`, `cancelar`, `agenda` y `reporte`.
- `estimar` calcula las horas segun el tamano, el factor de zona y el color, y redondea a medias horas
  hacia arriba.
- Los dias de trabajo de cada artista se revisan con `Date` real (diciembre de 2026).

## Reglas

| Regla | Valor |
|---|---|
| Horas base | chico 1, mediano 3, grande 5 (+1 si es a color) |
| Zona | costillas x1.4, mano x1.2, resto x1 |
| Precio | horas x tarifa del artista, minimo $800 |
| Sesiones | maximo 5 h por sesion; se agenda la primera y se indica cuantas faltan |
| Edad | mayor de 18 |
| Acuarela | siempre a color |
| Anticipo | 30 % del precio para confirmar |
| Cancelacion | 72 h o mas: reembolso total; de 24 a 72 h: se retiene la mitad; menos de 24 h: se retiene todo; pendiente: sin costo |

## Casos probados

- **Asignacion de artista:** realismo va con Iris y tradicional con Rocko. Para blackwork elige al
  artista que puede atender primero.
- **Sesiones:** un tatuaje de 8.5 h se divide en 2 sesiones.
- **Rechazos:** acuarela sin color, menor de edad y un artista preferido que no hace el estilo pedido.
- **Precio minimo (limite):** 1 h x $700 se cobra a $800.
- **Anticipos:** uno insuficiente y luego el correcto. No se puede completar una cita pendiente.
- **Cancelaciones:** con 72 h exactas (limite, reembolso total), con 30 h, con 5 h, una pendiente y
  una ya completada.
- **Hueco liberado:** una cita nueva ocupa el horario que libero una cancelacion.
- **Reporte por artista:** horas agendadas, ingreso (cobrado mas retenido) y monto por cobrar.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/77-tattoo-booking-app/index.ts
```

## Salida esperada

```text
=== Solicitudes ===
  #1 Ana   -> vale   dia  1 11:00 (1.5 h) $1050
  #2 Beto  -> iris   dia  2 10:00 (5 h) $7000
  #3 Caro  -> iris   dia  3 10:00 (5 h, sesion 1 de 2) $11900
  #4 Dani  -> rocko  dia  1 12:00 (4 h) $4000
  #5 Eli   -> rocko  dia  3 12:00 (3 h) $3000
  x Fede: la acuarela siempre es a color
  x Gus: hay que ser mayor de edad
  x Hana: ningun artista hace realismo (pidio a vale)
  #6 Ivan  -> vale   dia  1 12:30 (1 h) $800
  #7 Juli  -> iris   dia  2 15:00 (1.5 h) $2100

=== Pagos y cambios ===
  cita #1 confirmada con $405
  cita #2: anticipo insuficiente ($1000 de $2100)
  cita #2 confirmada con $2100
  cita #3 confirmada con $3570
  cita #4 confirmada con $1200
  cita #5 confirmada con $900
  cita #1 completada: resta cobrar $645
  cita #6 no se puede completar (pendiente)
  cita #2 cancelada con 72 h de aviso: reembolso $2100, retenido $0
  cita #4 cancelada con 30 h de aviso: reembolso $600, retenido $600
  cita #5 cancelada con 5 h de aviso: reembolso $0, retenido $900
  cita #6 cancelada con 1 h de aviso: reembolso $0, retenido $0
  cita #1 ya esta completada
  cita #99 no existe
  #8 Karla toma el hueco liberado: dia 2 10:00 con iris

=== Agenda de diciembre ===
  mar 01/12 11:00-12:30 vale   Ana      fineline     $1050 [completada]
  mie 02/12 10:00-13:00 iris   Karla    realismo     $4200 [pendiente]
  mie 02/12 15:00-16:30 iris   Juli     blackwork    $2100 [pendiente]
  jue 03/12 10:00-15:00 iris   Caro     realismo     $11900 [confirmada]

=== Reporte por artista ===
  Vale   citas 2 | horas agendadas  1.5 | ingreso $ 1050 | por cobrar $    0
  Rocko  citas 2 | horas agendadas    0 | ingreso $ 1500 | por cobrar $    0
  Iris   citas 4 | horas agendadas  9.5 | ingreso $    0 | por cobrar $14630
```
