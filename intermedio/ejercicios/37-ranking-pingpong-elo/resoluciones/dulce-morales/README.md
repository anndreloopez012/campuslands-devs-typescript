# Intermedio 37: Ranking ELO pingpong

**Tematica:** pingpong
**Alumna:** Dulce Morales

## Problema

Un club de pingpong usa el sistema **ELO** para su ranking:

1. Antes de cada partido se calcula la probabilidad de que gane cada jugador segun sus puntos.
2. Al terminar, el ganador sube y el perdedor baja.
3. Ganarle a alguien mucho mejor da muchos puntos; ganarle a alguien peor, pocos.

El **factor K** (cuanto se mueve el puntaje) depende de la experiencia del jugador.

## Que hice

### Clases

- **`Jugador`:** el ELO, los partidos jugados y el historial son **privados**.
  - getters `puntos`, `partidos` y `evolucion`;
  - getter `factorK`, que cambia segun la experiencia;
  - `aplicar(cambio)` actualiza el puntaje.
- **`RankingElo`:** guarda a los jugadores en un `Map` privado.
  - `inscribir()` rechaza nombres repetidos con un error;
  - `RankingElo.probabilidad()` es un metodo **estatico** con la formula ELO;
  - `registrar(partido)` valida y aplica el resultado;
  - `tabla()` devuelve el ranking ordenado.

### Tipos y type guards

- Literal type `Categoria` (novato, intermedio, avanzado, experto).
- `type Procesado`: union discriminada (partido valido, con ganador, cambio y probabilidad, o invalido, con motivo).
- **Type guard** `esValido`: se usa para filtrar los partidos validos y buscar la mayor sorpresa.

### Reglas

- **Probabilidad de que A gane:** 1 / (1 + 10^((ELO de B - ELO de A) / 400)).
- **Cambio:** K x (resultado - probabilidad). Cada jugador usa **su propio** K, asi que lo que sube uno no siempre es igual a lo que baja el otro.
- **Factor K:**
  - menos de 10 partidos (provisional): 40;
  - ELO de 1600 o mas: 16;
  - resto: 24.
- **Categorias:** novato (menos de 1200), intermedio (1200 o mas), avanzado (1400 o mas), experto (1600 o mas).
- **Partido valido:** los dos jugadores inscritos y distintos, y un marcador al mejor de 5 (alguien con 3 sets, el otro con menos).

### Casos probados

- **Limite del factor K:** Dario empieza con 9 partidos. Su primer partido usa K = 40 (sube 23). Al llegar a **10 exactos** pasa a K = 24 y se mueve menos.
- **Sorpresa:** Elsa (nueva, 1200) le gana a Ana (experta, 1650) con 7% de probabilidad y sube 37 puntos. Ana solo baja 15, porque su K es 16.
- **Favoritas:** cuando Ana le gana a Carla con 88% de probabilidad, solo sube 2.
- **Invalidos:** un jugador contra si mismo, un jugador no inscrito y un marcador 3-3.
- **Validacion:** inscribir dos veces a Ana lanza un error controlado.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/37-ranking-pingpong-elo/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
Validacion: Ana ya esta inscrito

====================== PARTIDOS ======================
F1 Ana   3-1 Beto  | gana Ana   (tenia 79% de probabilidad) +3
F1 Carla 2-3 Dario | gana Dario (tenia 43% de probabilidad) +23
F2 Elsa  3-2 Ana   | gana Elsa  (tenia  7% de probabilidad) +37
F2 Beto  3-0 Dario | gana Beto  (tenia 69% de probabilidad) +7
F3 Ana   3-0 Carla | gana Ana   (tenia 88% de probabilidad) +2
F3 Dario 1-3 Elsa  | gana Elsa  (tenia 46% de probabilidad) +22
F4 Beto  3-2 Elsa  | gana Beto  (tenia 72% de probabilidad) +7
F4 Carla 0-3 Ana   | gana Ana   (tenia 89% de probabilidad) +2
F5 Elsa  3-1 Carla | gana Elsa  (tenia 45% de probabilidad) +22
F5 Dario 3-2 Beto  | gana Dario (tenia 27% de probabilidad) +18
F5 Ana   3-0 Ana   | X no puede jugar contra si mismo
F5 Beto  3-1 Zoe   | X jugador no inscrito
F5 Carla 3-3 Dario | X marcador 3-3 no es al mejor de 5

====================== RANKING ======================
1. Ana    1642 (-8) experto    K=16 | 44 partidos | 1650 > 1653 > 1638 > 1640 > 1642
2. Beto   1411 (-9) avanzado   K=24 | 29 partidos | 1420 > 1415 > 1422 > 1429 > 1411
3. Dario  1271 (+21) intermedio K=24 | 13 partidos | 1250 > 1273 > 1266 > 1253 > 1271
4. Elsa   1270 (+70) intermedio K=40 | 4 partidos (provisional) | 1200 > 1237 > 1259 > 1248 > 1270
5. Carla  1267 (-33) intermedio K=24 | 16 partidos | 1300 > 1286 > 1283 > 1280 > 1267

Mayor sorpresa: Elsa le gano a Ana con solo 7% de probabilidad (+37)
```
