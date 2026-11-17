# Intermedio 41: Reservas de restaurante

**Tematica:** restaurantes
**Alumna:** Dulce Morales

## Problema

Un restaurante recibe solicitudes de reserva con fecha y hora. El programa:

- asigna a cada reserva la **mesa mas chica** donde quepa el grupo y que este libre esas 2 horas;
- cambia el estado de las reservas: pendiente, confirmada, cancelada o "no se presento";
- cobra un cargo si se cancela con menos de 24 h de aviso;
- arma un reporte por dia y por turno.

## Que hice

### Repositorio generico

`Repositorio<T extends { id }>` guarda cualquier entidad con `id` en un `Map` **privado**. Tiene `guardar`, `buscar` y `todos`. Lo uso para las mesas y para las reservas.

### Servicio `ReservaService` (encapsulamiento)

Toda la logica vive en el servicio; los datos solo se cambian por sus metodos:

- `solicitar()`:
  - valida la fecha, las personas y el turno;
  - busca mesas con capacidad suficiente (y en la zona pedida, si hay una);
  - elige la mas chica que este libre.
- `confirmar()`, `cancelar()` y `marcarNoShow()`: cada uno solo funciona desde ciertos estados.
- `reporte()`: agrupa con `reduce` en un `Map` cuya clave es "dia turno".
- `ocupada()` (**privado**): revisa si una mesa tiene otra reserva activa que se cruce.

### Fechas

- Uso objetos `Date` y comparo con `getTime()` (milisegundos).
- **Turnos:** almuerzo de 12 a 16 y cena de 19 a 23. Fuera de esos horarios no se reserva.
- Cada reserva dura 2 horas.
- El dia del reporte se arma con la **fecha local**. Si usara `toISOString()` (que es UTC), una cena a las 20:00 apareceria como el dia siguiente.

### Reglas de estados

| Accion | Desde | Resultado |
|---|---|---|
| confirmar | pendiente | confirmada |
| cancelar con 24 h o mas | pendiente o confirmada | cancelada, sin cargo |
| cancelar con menos de 24 h | pendiente o confirmada | cancelada, cargo de $20 |
| no se presento | confirmada | cargo de $40 |

### Casos probados

- **Limite de capacidad:** Mora reserva para 6 y le toca la mesa de **exactamente** 6.
- **Limite de horario:** la reserva de Lopez termina a las 15:00 y la de Diaz empieza a las 15:00 en la **misma mesa**. No es un cruce.
- **Limite de cancelacion:** la reserva 4 se cancela con **24 h exactas** y no tiene cargo; la 5, con 5 h, si.
- **Rechazos:**
  - terraza ocupada;
  - grupo de 8 sin mesa;
  - reserva fuera de turno;
  - marcar "no se presento" a una reserva sin confirmar;
  - confirmar una reserva cancelada.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/41-reservas-restaurante/index.ts
```

## Salida esperada

```text
==================== SOLICITUDES ====================
OK  #1 Lopez   2 pers. 2026-11-20 13:00 -> mesa B1
OK  #2 Garcia  4 pers. 2026-11-20 13:30 -> mesa T1
OK  #3 Mora    6 pers. 2026-11-20 20:00 -> mesa S3
OK  #4 Rivas   4 pers. 2026-11-20 13:00 -> mesa S2
X   Pena    4 pers. 2026-11-20 14:00 -> todas las mesas adecuadas estan ocupadas a esa hora
OK  #5 Diaz    2 pers. 2026-11-20 15:00 -> mesa B1
X   Vega    8 pers. 2026-11-20 21:00 -> no hay mesas para 8
X   Soto    2 pers. 2026-11-20 17:30 -> 17:30 esta fuera de los turnos (12-16 y 19-23)
OK  #6 Ruiz    3 pers. 2026-11-21 20:30 -> mesa S2
OK  #7 Paz     2 pers. 2026-11-21 20:00 -> mesa B1

==================== CAMBIOS DE ESTADO ====================
- reserva 1 confirmada
- reserva 2 confirmada
- reserva 3 confirmada
- reserva 7 confirmada
- reserva 4 cancelada con 24 h de aviso: sin cargo
- reserva 5 cancelada con 5 h de aviso: cargo de $20
- reserva 2: el cliente no se presento, cargo de $40
- reserva 6: solo una confirmada puede ser "no se presento"
- reserva 4: solo se confirma una reserva pendiente

==================== REPORTE POR DIA Y TURNO ====================
2026-11-20 almuerzo: 1 reserva(s) activa(s), 2 personas
   #1 13:00-15:00 Lopez   2 pers. mesa B1 confirmada
   #4 13:00-15:00 Rivas   4 pers. mesa -  cancelada
   #2 13:30-15:30 Garcia  4 pers. mesa T1 no se presento (cargo $40)
   #5 15:00-17:00 Diaz    2 pers. mesa -  cancelada (cargo $20)
2026-11-20 cena: 1 reserva(s) activa(s), 6 personas
   #3 20:00-22:00 Mora    6 pers. mesa S3 confirmada
2026-11-21 cena: 2 reserva(s) activa(s), 5 personas
   #7 20:00-22:00 Paz     2 pers. mesa B1 confirmada
   #6 20:30-22:30 Ruiz    3 pers. mesa S2 pendiente

Cargos por cancelaciones y no-shows: $60
```
