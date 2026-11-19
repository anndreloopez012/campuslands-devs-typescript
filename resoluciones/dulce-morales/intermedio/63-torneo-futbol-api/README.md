# Intermedio 63: Torneo futbol asincrono

**Tematica:** futbol
**Alumna:** Dulce Morales

## Problema

Un torneo de 8 equipos pasa por fases:

**inscripcion -> grupos -> semifinales -> final -> terminado**

- El estado se maneja con un **reducer puro** y una **maquina de estados**: cada accion solo vale en ciertas fases.
- Los resultados de los partidos llegan de una **API remota simulada**, con demora y una falla que se reintenta.
- Un orquestador asincrono pide los datos y **despacha acciones** al reducer.

## Que hice

### Acciones (union discriminada)

`INSCRIBIR`, `CERRAR_INSCRIPCION`, `RESULTADOS_GRUPOS`, `RESULTADOS_SEMIS` y `RESULTADO_FINAL`. Cada una lleva sus propios datos.

### Maquina de estados

`PERMITIDAS: Record<Fase, Accion["tipo"][]>` dice que acciones valen en cada fase. Si llega una accion fuera de su fase, el reducer la rechaza y lo anota en la bitacora.

| Fase | Acciones validas | Pasa a |
|---|---|---|
| inscripcion | INSCRIBIR, CERRAR_INSCRIPCION (con 8 equipos) | grupos |
| grupos | RESULTADOS_GRUPOS | semifinales |
| semifinales | RESULTADOS_SEMIS | final |
| final | RESULTADO_FINAL | terminado |

### Reducer puro

`reducer(estado, accion)` siempre devuelve un estado nuevo. Al cerrar la inscripcion arma los grupos A y B. Con los resultados de grupos calcula las tablas y los cruces de semifinales: **1A vs 2B** y **1B vs 2A**.

### Tabla de grupos

Se ordena por puntos (3 por victoria, 1 por empate), luego diferencia de goles, goles a favor y nombre. Solo cuenta los partidos **entre equipos del mismo grupo**.

### Async

- `pedirResultados(endpoint, partidos)` es `async`. La primera consulta a `/semifinales` responde 503 (`ErrorApi`).
- `conReintento<T>()` es generica: atrapa ese error, espera y vuelve a intentar.
- En eliminatorias, un empate se define por penales (`penales?` es opcional en `Resultado`).

### Bug que encontre y corregi

En la primera version, la tabla impresa al final contaba tambien los partidos de eliminatorias y daba puntajes imposibles (11 puntos en 3 partidos). La corregi para que solo sume partidos del grupo.

### Casos probados

- **Inscripcion:**
  - cerrar con 7 equipos se rechaza;
  - un equipo repetido se rechaza;
  - un 9no equipo se queda fuera por cupo lleno.
- **Fase equivocada:**
  - mandar el resultado de la final durante la inscripcion;
  - inscribir un equipo en semifinales.
- **API:** la primera consulta de semifinales falla y el reintento funciona.
- **Penales:** dos partidos de eliminatoria se definen por penales.
- **Final:** el torneo termina en "terminado" con su campeon.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/63-torneo-futbol-api/index.ts
```

## Salida esperada

```text
==================== BITACORA DEL TORNEO ====================
inscrito Leones (1/8)
inscrito Halcones (2/8)
inscrito Toros (3/8)
inscrito Lobos (4/8)
inscrito Cobras (5/8)
inscrito Osos (6/8)
inscrito Pumas (7/8)
X faltan equipos: hay 7 de 8
X RESULTADO_FINAL no se permite en la fase "inscripcion"
inscrito Zorros (8/8)
X Leones ya esta inscrito
X cupo lleno, Aguilas queda fuera
inscripcion cerrada -> fase de grupos
grupos terminados -> semifinales: Leones vs Zorros, Lobos vs Cobras
X INSCRIBIR no se permite en la fase "semifinales"
semifinales terminadas -> final: Leones vs Lobos
FINAL -> CAMPEON: Leones
! [ErrorApi] /semifinales respondio 503; reintentando...

==================== TABLAS DE GRUPOS ====================
Grupo A:
  1. Leones    7 pts  DG +4  GF 6  <- clasifica
  2. Cobras    5 pts  DG +2  GF 5  <- clasifica
  3. Pumas     2 pts  DG -3  GF 3
  4. Toros     1 pts  DG -3  GF 2
Grupo B:
  1. Lobos     7 pts  DG +2  GF 4  <- clasifica
  2. Zorros    6 pts  DG +2  GF 4  <- clasifica
  3. Halcones  3 pts  DG -1  GF 3
  4. Osos      1 pts  DG -3  GF 2

==================== ELIMINATORIAS ====================
Leones 1-1 Zorros (penales 4-3) -> pasa Leones
Lobos 2-0 Cobras -> pasa Lobos
Leones 1-1 Lobos (penales 4-3) -> pasa Leones

Fase final: terminado | campeon: Leones
```
