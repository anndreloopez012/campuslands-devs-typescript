# Intermedio 60: Garaje de lujo

**Tematica:** autos de lujo
**Alumna:** Dulce Morales

## Problema

Un coleccionista quiere actualizar el valor de su garaje:

- un servicio de tasacion remoto (simulado) valua cada auto, pero solo acepta **2 consultas a la vez**;
- si no tiene datos de mercado de un auto, se usa el **ultimo valor conocido**;
- se revisan los seguros: se avisa si una poliza vence pronto (o ya vencio), o si el valor asegurado quedo por debajo del valor real.

Todo se informa con eventos tipados.

## Que hice

### Limite de concurrencia generico

`conLimite<T, R>(items, limite, tarea)` procesa una lista con como maximo `limite` tareas al mismo tiempo:

- lanza `limite` "trabajadores" con `Promise.all`;
- cada trabajador toma el siguiente elemento libre hasta que no quede ninguno;
- devuelve `PromiseSettledResult<R>[]` en el mismo orden de la lista, igual que `Promise.allSettled`.

El servicio cuenta cuantas consultas hay en curso y guarda el maximo: queda en **2**, lo que confirma que el limite se respeta.

### Servicios async

- `ServicioTasacion.tasar(auto)`: espera con `await` y, si no hay datos de mercado, lanza `ErrorTasacion`. El `finally` siempre descuenta la consulta en curso, aunque haya error.
- `revisarSeguro(...)`: async; emite alertas segun las fechas y los montos.
- Los seguros se revisan todos en paralelo con `Promise.all`.

### Errores y eventos tipados

- `ErrorTasacion` lleva el id del auto y el motivo. Si ocurre, se usa el ultimo valor conocido.
- `Emisor<E>` **generico** con `EventosGaraje`: `"tasacion iniciada"` (con cuantas consultas hay en curso) y `"alerta seguro"`.

### Reglas del seguro

- **Poliza vencida:** la fecha ya paso.
- **Vence pronto:** faltan **30 dias o menos**.
- **Infraseguro:** el valor asegurado es **menor** al 90% del valor real actual.

### Casos probados

- **Concurrencia:** las 6 tasaciones se hacen de a 2.
- **Sin datos de mercado:** el Bugatti EB110 usa su ultimo valor conocido. Ademas, su poliza vencio hace 6 dias.
- **Limite de vencimiento:** la poliza del Porsche vence en **exactamente** 30 dias y recibe aviso.
- **Infraseguro:** el Miura subio 30% y su seguro quedo corto.
- **Limite de infraseguro:** el DB5 vale $1,188,000 y su 90% es $1,069,200. Esta asegurado por $1,100,000, asi que **no** es infraseguro.
- **Total:** la coleccion paso de $57.4 M a casi $64 M.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/60-garaje-lujo/index.ts
```

## Salida esperada

```text
================ TASACION (maximo 2 consultas a la vez) ================
  > tasando G1 (1 en curso)
  > tasando G2 (2 en curso)
  > tasando G3 (2 en curso)
  > tasando G4 (2 en curso)
  > tasando G5 (2 en curso)
  > tasando G6 (2 en curso)
  ! [ErrorTasacion] G4: sin ventas recientes en el mercado: se usa el ultimo valor conocido
  Maximo de consultas simultaneas: 2

================ VALOR DE LA COLECCION ================
Ferrari 250 GTO          1962  $53,760,000  +12%
Lamborghini Miura P400   1967  $ 3,250,000  +30%
Bugatti EB110            1993  $ 3,000,000  +0%  (ultimo valor conocido)
Mercedes 300 SL Gullwing 1955  $ 1,632,000  +2%
Aston Martin DB5         1964  $ 1,188,000  +8%
Porsche 911 Carrera RS   1973  $ 1,140,000  -5%
Total: $63,970,000 (antes $57,400,000, +11.4%)

================ REVISION DE SEGUROS ================
! G2: poliza vence en 30 dia(s)
! G3: asegurado por $2,500,000 y vale $3,250,000 (infraseguro)
! G4: poliza VENCIDA hace 6 dia(s)
```
