# Intermedio 13: Curador de playlist

**Tematica:** musica
**Alumna:** Dulce Morales

## Problema

Armar el set de un DJ a partir de una biblioteca de canciones. El set debe durar cerca de un tiempo objetivo, seguir una **curva de energia** (calentamiento, pico y cierre) y cada transicion debe ser "mezclable": tonos compatibles, poco salto de BPM y sin repetir artista seguido.

## Que hice

### Modelo (objetos anidados)

- `interface Cancion` con un `artista` anidado (nombre y pais) y un `tono` anidado (`Tono`: numero 1-12 y letra A/B, notacion de la rueda Camelot).
- Union types: `Letra` (A = menor, B = mayor) y `Fase` (calentamiento, pico, cierre).
- `interface Transicion` y `SetDj` para el resultado.

### Reglas de negocio

- **Tonos compatibles** (rueda Camelot):
  - mismo tono (8A y 8A);
  - relativo mayor/menor (10A y 10B);
  - tono vecino con la misma letra (8A y 9A). Tambien cuenta 12 y 1, porque la rueda da la vuelta.
- **Salto de BPM** maximo de 6 entre canciones seguidas.
- **No repetir artista** en dos canciones seguidas.
- **Curva de energia segun el avance del set:**
  - calentamiento (0-30%): busca energia 5;
  - pico (30-80%): busca energia 9;
  - cierre (80-100%): busca energia 6.
- **Algoritmo:**
  1. Empieza con la cancion mas tranquila.
  2. En cada paso filtra las canciones compatibles y elige la de menor puntaje: distancia a la energia buscada + salto de BPM / 10.
  3. Termina al llegar a la duracion objetivo o cuando ya no hay ninguna compatible.
- **Validacion:** tono de 1 a 12, BPM de 60 a 200, energia de 1 a 10 y duracion positiva.

### Como use arrays tipados

- `filter`: canciones validas, candidatas compatibles y canciones que no entraron.
- `sort`: elegir la mejor candidata (sobre el resultado de `filter`, que es un arreglo nuevo).
- `map`: armar la curva de energia y los nombres.

### Casos probados

- **Normal (40 min):** la curva sube y baja como se espera, 4 > 5 > 6 > 9 > 10 > 8 > 6, y llega a 40:55.
- **Limite (90 min):** se pide mas de lo que se puede mezclar. El set sube hasta la energia 10 y se detiene en 40:40, porque despues de "Tormenta de Neon" ya no queda ninguna cancion compatible. El programa lo explica.
- **Cancion que nunca entra:** "Hardstyle Fuera de Lugar" (150 BPM, tono 3B) choca con todas.
- **Invalidas:** tono 14A y energia 15.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/13-playlist-dj/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
================ BIBLIOTECA ================
Canciones validas: 10 | invalidas: 2
  X Tono Inventado: tono 14A no existe en la rueda Camelot
  X Energia Rota: energia 15 fuera de 1-10

================ SET PRINCIPAL (objetivo 40:00) ================
 1. [ 0:00] Amanecer Digital   Luna Verde  120 BPM 8A  energia  4 (calentamiento)
 2. [ 5:10] Corriente Alterna  Kael        122 BPM 8A  energia  5 (calentamiento)
 3. [10:50] Ritmo Solar        Nova Beats  124 BPM 9A  energia  6 (calentamiento)
 4. [16:55] Electricidad       Dex Rivera  128 BPM 10A energia  9 (pico)
 5. [23:15] Tormenta de Neon   Kael        128 BPM 10B energia 10 (pico)
 6. [29:10] Gravedad Cero      Nova Beats  127 BPM 10A energia  8 (pico)
 7. [35:10] Ultimo Tren        Mia Sol     124 BPM 11A energia  6 (cierre)
Transiciones:
   8A -> 8A   mismo tono             +2 BPM
   8A -> 9A   tono vecino            +2 BPM
   9A -> 10A  tono vecino            +4 BPM
  10A -> 10B  relativo mayor/menor   +0 BPM
  10B -> 10A  relativo mayor/menor   -1 BPM
  10A -> 11A  tono vecino            -3 BPM
Curva de energia: 4 > 5 > 6 > 9 > 10 > 8 > 6
Duracion total: 40:55 | se alcanzo la duracion objetivo
No entraron: Pulso Urbano, Luces Bajas, Hardstyle Fuera de Lugar

================ SET LARGO (objetivo 90:00) ================
 1. [ 0:00] Amanecer Digital   Luna Verde  120 BPM 8A  energia  4 (calentamiento)
 2. [ 5:10] Corriente Alterna  Kael        122 BPM 8A  energia  5 (calentamiento)
 3. [10:50] Ritmo Solar        Nova Beats  124 BPM 9A  energia  6 (calentamiento)
 4. [16:55] Pulso Urbano       Luna Verde  126 BPM 9A  energia  7 (calentamiento)
 5. [22:25] Gravedad Cero      Nova Beats  127 BPM 10A energia  8 (calentamiento)
 6. [28:25] Electricidad       Dex Rivera  128 BPM 10A energia  9 (pico)
 7. [34:45] Tormenta de Neon   Kael        128 BPM 10B energia 10 (pico)
Transiciones:
   8A -> 8A   mismo tono             +2 BPM
   8A -> 9A   tono vecino            +2 BPM
   9A -> 9A   mismo tono             +2 BPM
   9A -> 10A  tono vecino            +1 BPM
  10A -> 10A  mismo tono             +1 BPM
  10A -> 10B  relativo mayor/menor   +0 BPM
Curva de energia: 4 > 5 > 6 > 7 > 8 > 9 > 10
Duracion total: 40:40 | no hay canciones compatibles despues de "Tormenta de Neon"
No entraron: Ultimo Tren, Luces Bajas, Hardstyle Fuera de Lugar
```
