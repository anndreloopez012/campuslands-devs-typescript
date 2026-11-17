# Intermedio 45: Log avanzado de saltos

**Tematica:** paracaidismo
**Alumna:** Dulce Morales

## Problema

Antes de dejar subir a alguien al avion, la zona de salto revisa sus fechas:

- **ultimo salto:** si paso mucho tiempo, necesita un salto supervisado;
- **paracaidas de reserva:** debe haberse re-empacado hace menos de 180 dias;
- **certificado medico** y **AAD** (dispositivo de apertura automatica): no deben estar vencidos.

Con eso se decide su estado: **habilitado**, **requiere supervision** o **suspendido**. Ademas, se arma un reporte de saltos por mes.

## Que hice

### Servicio `ControlZonaSalto`

- Recibe la fecha de "hoy" por constructor y la guarda como **privada**.
- `revisar(paracaidista)`: aplica todas las reglas y devuelve el estado, los motivos y los dias desde el ultimo salto.
- `reporteMensual(lista)`: un `Map` de mes ("AAAA-MM") a otro `Map` de paracaidista a cantidad de saltos.

### Fechas

- Todas las fechas son `Date` (creadas con `new Date(anio, mes - 1, dia)`).
- `diasEntre(desde, hasta)` calcula la diferencia en dias. Usa `Math.round` para que un cambio de horario no deje un dia "partido".
- Para mostrar las fechas uso `getDate()`, `getMonth()` y `getFullYear()`.

### Reglas

| Revision | Regla | Si no cumple |
|---|---|---|
| Certificado medico | vigente (el dia del vencimiento todavia vale) | suspendido |
| AAD | vigente | suspendido |
| Reserva | empacada hace 180 dias o menos | suspendido |
| Ultimo salto | hace 60 dias o menos | requiere supervision |
| Sin saltos | - | requiere supervision |

- Si un vencimiento llega en **15 dias o menos**, se agrega un aviso, sin cambiar el estado.
- Suspendido pesa mas que supervision.

### Casos probados

- **Limite de recencia:** el ultimo salto de Bruno fue hace **exactamente** 60 dias, asi que sigue habilitado.
- **Limite de aviso:** el certificado de Bruno vence en **exactamente** 15 dias, asi que recibe aviso.
- **Limite de vencimiento:** el certificado de Elena vence **hoy**: sigue habilitada, con aviso de "0 dias".
- **Supervision:** Carla no salta hace 166 dias y Flor no tiene saltos.
- **Suspendido:** Dario tiene el certificado vencido y la reserva empacada hace 220 dias.
- **Reporte mensual:** los saltos agrupados por mes y por persona.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/45-log-saltos/index.ts
```

## Salida esperada

```text
================ CONTROL DE LA ZONA DE SALTO - 16/11/2026 ================

Andrea  [HABILITADO] ultimo salto hace 8 dias

Bruno   [HABILITADO] ultimo salto hace 60 dias
   - aviso: certificado medico vence en 15 dia(s)

Carla   [REQUIERE SUPERVISION] ultimo salto hace 166 dias
   - su ultimo salto fue hace 166 dias (maximo 60)

Dario   [SUSPENDIDO] ultimo salto hace 15 dias
   - certificado medico vencido el 10/11/2026
   - reserva empacada hace 220 dias (maximo 180)

Elena   [HABILITADO] ultimo salto hace 7 dias
   - aviso: certificado medico vence en 0 dia(s)

Flor    [REQUIERE SUPERVISION] sin saltos
   - no tiene saltos registrados

Resumen: 3 habilitado(s), 2 con supervision, 1 suspendido(s)

================ SALTOS POR MES ================
2026-06: 2 salto(s) | Carla 2
2026-08: 1 salto(s) | Bruno 1
2026-09: 3 salto(s) | Andrea 2, Bruno 1
2026-10: 3 salto(s) | Andrea 1, Dario 1, Elena 1
2026-11: 4 salto(s) | Andrea 1, Dario 1, Elena 2
```
