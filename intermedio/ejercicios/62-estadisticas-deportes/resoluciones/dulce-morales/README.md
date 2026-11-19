# Intermedio 62: Dashboard multi-deporte

**Tematica:** deportes
**Alumna:** Dulce Morales

## Problema

Un dashboard en vivo sigue partidos de **futbol**, **basquetbol** y **tenis** al mismo tiempo. Los eventos de los tres deportes llegan mezclados, y un **reducer puro** los aplica al partido que corresponde. Cada deporte tiene sus reglas:

- **futbol:** dos amarillas son roja, y un expulsado ya no puede marcar;
- **basquet:** una canasta vale 1, 2 o 3, y hay 4 cuartos;
- **tenis:** el marcador del game es una **maquina de estados** (0-15-30-40, iguales, ventaja, game).

Los eventos que no tienen sentido se rechazan.

## Que hice

### Uniones discriminadas

- `type Partido`: una variante por `deporte`, cada una con sus datos (goles y tarjetas; puntos y cuarto; puntos del game y games).
- `type Evento`: una variante por `tipo` (GOL, AMARILLA, CANASTA, FIN_CUARTO, PUNTO, FINAL).

### Reducer puro

`reducer(dashboard, evento)` nunca modifica el estado anterior: crea un `Map` nuevo y objetos nuevos con *spread*. Todo el partido se procesa con `eventos.reduce(reducer, inicial)`. Al final se comprueba que el estado inicial sigue en 0-0.

Orden de revision:

1. el partido existe;
2. no termino;
3. `FINAL` lo termina;
4. un `switch` por deporte decide si el evento corresponde y lo aplica.

### Maquina de estados del tenis

`puntoTenis(marcador, quienGana)` decide el siguiente estado del game:

| Estado del que gana | Estado del otro | Resultado |
|---|---|---|
| 0 / 15 / 30 | cualquiera | sube a 15 / 30 / 40 |
| 40 | 0, 15 o 30 | gana el game |
| 40 | 40 (iguales) | pasa a ventaja (AD) |
| 40 | AD | vuelve a iguales (40-40) |
| AD | 40 | gana el game |

Uso una funcion auxiliar `con(lado, valor)` para cambiar el puntaje de un solo lado sin casteos.

### Casos probados

- **Tenis:**
  - un game en blanco para Paz (15-0, 30-0, 40-0, game);
  - un game con **iguales, ventaja de Paz, vuelta a iguales**, y luego ventaja y game para Rios.
- **Futbol:** la segunda amarilla de Rojas lo expulsa, y su gol posterior se rechaza.
- **Basquet:** no se puede terminar un 5to cuarto; despues de `FINAL` no se aceptan canastas.
- **Rechazos:** una canasta en un partido de futbol y un evento de un partido inexistente.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/62-estadisticas-deportes/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
==================== EVENTOS PROCESADOS ====================
F1: GOL de Mora (Leones)
B1: canasta de 3 para Toros
T1: punto Paz (15-0)
T1: punto Paz (30-0)
T1: punto Paz (40-0)
T1: GAME para Paz
F1: amarilla a Rojas
B1: canasta de 2 para Lobos
T1: punto Rios (0-15)
T1: punto Rios (0-30)
T1: punto Rios (0-40)
T1: punto Paz (15-40)
T1: punto Paz (30-40)
T1: punto Paz (40-40)
T1: punto Paz (AD-40)
T1: punto Rios (40-40)
T1: punto Rios (40-AD)
T1: GAME para Rios
F1: segunda amarilla a Rojas -> ROJA
X GOL en F1: Rojas esta expulsado
F1: GOL de Vega (Halcones)
X CANASTA en F1: evento que no es de futbol
B1: termina el cuarto 1
B1: termina el cuarto 2
B1: termina el cuarto 3
X FIN_CUARTO en B1: ya se jugaron los 4 cuartos, usar FINAL
B1: FINAL
X CANASTA en B1: el partido ya termino
X GOL en F9: partido inexistente

==================== DASHBOARD ====================
FUTBOL  Leones 1 - 1 Halcones | expulsados: Rojas
BASQUET Toros 3 - 2 Lobos | cuarto 4 (final)
TENIS   Paz 1 - 1 Rios (games) | game actual 0-0

El estado inicial no cambio (reducer puro): F1 sigue 0-0 en el estado inicial
```
