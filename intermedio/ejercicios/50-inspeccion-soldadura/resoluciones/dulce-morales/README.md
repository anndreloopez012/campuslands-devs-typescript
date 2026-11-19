# Intermedio 50: Inspeccion visual soldadura

**Tematica:** soldadura
**Alumna:** Dulce Morales

## Problema

Un inspector revisa a simple vista cada cordon de soldadura y anota los defectos que ve. Segun el tipo y la cantidad de defectos, el cordon queda:

- **aprobado**;
- **para reparar**;
- **rechazado**.

Una reparacion se vuelve a inspeccionar. Con el historial de los ultimos 30 dias se calcula la tasa de rechazo de cada soldador: si pasa de 20%, debe volver a certificarse.

## Que hice

### Registro generico

`Registro<T extends { fecha: Date }>` guarda los elementos en una lista **privada**. Su metodo `entre(desde, hasta)` filtra por rango de fechas.

### Servicio `InspeccionService` (encapsulamiento)

- `evaluar(inspeccion)`: aplica los criterios a cada hallazgo y decide el resultado. Si la inspeccion es la revision de una **reparacion** y sigue con defectos, ya no se repara otra vez: se rechaza.
- `tasas(hoy)`: tasa de rechazo por soldador en los ultimos 30 dias, contando solo las primeras inspecciones (no las reinspecciones). Usa un `Map`.
- `defectosMasComunes()`: cuenta los defectos que pasaron lo aceptable.

### Criterios (`Record<Defecto, ...>`)

| Defecto | Aceptable hasta | Reparable hasta |
|---|---|---|
| porosidad | 3 | 10 |
| socavado | 1 | 5 |
| salpicadura | 20 | siempre |
| falta de fusion | 0 | 15 |
| grieta | 0 | 0 (siempre se rechaza) |

Si un cordon tiene varios defectos, gana el peor resultado (rechazada > reparar > aprobada).

### Fechas

Cada inspeccion tiene un `Date`. La ventana de 30 dias se calcula restando milisegundos a la fecha de hoy.

### Casos probados

- **Limite de defecto:** I02 tiene **exactamente** 3 poros, el maximo aceptable, y se aprueba.
- **Limite de tasa:** Raul tiene 1 rechazo de 5 inspecciones = **20% exacto**, asi que no necesita recertificarse (la regla es "mas de 20%").
- **Reparacion:**
  - la reparacion de I03 (I04) sale bien y se aprueba;
  - la de I08 (I09) sigue con poros, asi que se rechaza.
- **Recertificacion:** Lina tiene 50% de rechazo y debe recertificarse.
- **Fuera de la ventana:** la grieta de Omar del 20/09 no cuenta para su tasa actual.
- **Grieta:** siempre se rechaza, sin importar la cantidad.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/50-inspeccion-soldadura/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
==================== INSPECCIONES ====================
I01 20/10 Raul  Viga V1-a   -> APROBADA
I02 27/10 Raul  Viga V1-b   -> APROBADA
I03 03/11 Raul  Viga V2-a   -> REPARAR
      - socavado 3 (acepta hasta 1): reparar
I04 04/11 Raul  Viga V2-a   -> APROBADA (reinspeccion de I03)
I05 10/11 Raul  Viga V3-a   -> RECHAZADA
      - grieta 1: no se puede reparar
I06 12/11 Raul  Viga V3-b   -> REPARAR
      - salpicadura 25 (acepta hasta 20): reparar
I07 02/11 Lina  Columna C1  -> RECHAZADA
      - falta de fusion 20: no se puede reparar
I08 05/11 Lina  Columna C2  -> REPARAR
      - porosidad 6 (acepta hasta 3): reparar
I09 06/11 Lina  Columna C2  -> RECHAZADA (reinspeccion de I08)
      - porosidad 4 (acepta hasta 3): reparar
      - ya era una reparacion y sigue con defectos
I10 11/11 Lina  Columna C3  -> RECHAZADA
      - grieta 2: no se puede reparar
I11 13/11 Lina  Columna C4  -> APROBADA
I12 20/09 Omar  Placa P1    -> RECHAZADA
      - grieta 1: no se puede reparar
I13 09/11 Omar  Placa P2    -> APROBADA

==================== TASA DE RECHAZO (ultimos 30 dias al 16/11) ====================
Raul  1/5 rechazadas = 20%
Lina  2/4 rechazadas = 50%  << debe recertificarse
Omar  0/1 rechazadas = 0%

Defectos que mas aparecen (fuera de lo aceptable):
  grieta           3
  porosidad        2
  socavado         1
  salpicadura      1
  falta de fusion  1
```
