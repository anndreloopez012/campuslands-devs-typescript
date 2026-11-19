# Intermedio 74 - Planner de viajes DOM

**Tematica:** viajes
**Alumna:** Dulce Morales

## Problema

Un planificador de viajes donde se agregan actividades (hospedaje, transporte, comidas, tours) desde
un formulario. La app valida que el plan sea posible y que no se pase del presupuesto, y luego muestra
el itinerario por dia.

## Que hice

- `ActividadFormDTO` representa el formulario (todo en texto, como los `<input>`). `validarForm` lo
  convierte en una `Actividad` con horas en minutos y el costo convertido a MXN, o regresa todos los
  errores juntos (`Validacion`, union discriminada).
- `RepoActividades` es un repositorio en memoria con ids autoincrementales y consulta por dia ordenada por hora.
- `Planner` es el servicio con las reglas que dependen del plan existente (choques, traslados, limites).
- `itinerario()` genera lo que el DOM pintaria: una columna por dia con sus tarjetas, incluidos los dias libres.
- `reporte()` muestra el gasto por tipo contra su limite, el total contra el presupuesto y las ciudades.

## Reglas

| Regla | Detalle |
|---|---|
| Fechas | formato YYYY-MM-DD, deben existir (30 de febrero no) y estar dentro del viaje |
| Horas | HH:MM y el fin despues del inicio |
| Monedas | MXN, USD (x17.5) y EUR (x19), todo se guarda en MXN |
| Choques | dos actividades no pueden traslaparse, salvo el hospedaje (que dura toda la noche) |
| Traslados | entre actividades en ciudades distintas debe haber al menos el tiempo de traslado; si no hay ruta registrada se rechaza |
| Transporte | las actividades de transporte no exigen traslado (ellas son el traslado) |
| Limites | superar el limite por tipo o el presupuesto total no bloquea, pero agrega un AVISO |

## Casos probados

- Cena que choca con otra.
- Mitla a 30 min de Monte Alban se rechaza (se necesitan 60 min). Caso limite: a 60 min exactos se acepta.
- Destino sin ruta registrada.
- Hospedaje en USD que excede el limite de hospedaje.
- Tour que excede el limite de tours y el presupuesto total.
- Formulario con 6 errores a la vez y una fecha que no existe (2026-02-30).
- Itinerario con un dia libre y reporte con limites excedidos y faltante.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/74-planner-viajes/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
=== Oaxaca y costa (2026-12-20 a 2026-12-23) ===
  #1 agregada "Hotel centro" ($2400.00 MXN)
  #2 agregada "Tlayudas" ($350.00 MXN)
  RECHAZADA "Mezcaleria": choca con "Tlayudas" (19:00-20:30)
  #3 agregada "Monte Alban" ($787.50 MXN)
  RECHAZADA "Ruinas de Mitla": de Oaxaca a Mitla solo hay 30 min (se necesitan 60 min)
  #4 agregada "Ruinas de Mitla" ($1050.00 MXN)
  RECHAZADA "Hierve el Agua": de Oaxaca a Hierve el Agua solo hay 300 min (no hay ruta registrada)
  #5 agregada "Autobus a la costa" ($650.00 MXN)
  #6 agregada "Hotel playa" ($2625.00 MXN)  AVISO: supera el limite de hospedaje ($5000)
  #7 agregada "Clase de surf" ($700.00 MXN)
  #8 agregada "Cena en la playa" ($1800.00 MXN)
  #9 agregada "Lancha y delfines" ($2100.00 MXN)  AVISO: supera el limite de tour ($3000); supera el presupuesto total
  RECHAZADA "Fiesta": tipo "fiesta" desconocido; ciudad vacia; fecha 2026-12-24 fuera del viaje (2026-12-20 a 2026-12-23); hora invalida (usa HH:MM); costo invalido; moneda "GBP" no soportada
  RECHAZADA "Fecha imposible": fecha "2026-02-30" invalida

=== Itinerario ===
  [2026-12-20] 2 actividad(es), $2750.00
      15:00-23:59 hospedaje  Hotel centro               Oaxaca           2400 MXN
      19:00-20:30 comida     Tlayudas                   Oaxaca           350 MXN
  [2026-12-21] 2 actividad(es), $1837.50
      09:00-13:00 tour       Monte Alban                Oaxaca           45 USD
      14:00-16:30 tour       Ruinas de Mitla            Mitla            60 USD
  [2026-12-22] 4 actividad(es), $5775.00
      07:00-13:00 transporte Autobus a la costa         Oaxaca           650 MXN
      14:00-23:59 hospedaje  Hotel playa                Puerto Escondido 150 USD
      16:00-18:00 tour       Clase de surf              Puerto Escondido 40 USD
      19:00-21:00 comida     Cena en la playa           Puerto Escondido 1800 MXN
  [2026-12-23] 1 actividad(es), $2100.00
      08:00-11:00 tour       Lancha y delfines          Puerto Escondido 120 USD

=== Gastos ===
  transporte $   650.00
  hospedaje  $  5025.00 / limite $5000 EXCEDIDO
  comida     $  2150.00 / limite $2500
  tour       $  4637.50 / limite $3000 EXCEDIDO
  museo      $     0.00
  libre      $     0.00
  TOTAL      $ 12462.50 de $12000 -> faltan $462.50
  Ciudades visitadas: Oaxaca, Mitla, Puerto Escondido
```
