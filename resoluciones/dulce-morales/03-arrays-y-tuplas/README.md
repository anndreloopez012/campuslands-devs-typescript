# Ejercicio 03: Arrays y Tuplas

**Contexto:** Equipos de futbol (futbol sala)
**Alumna:** Dulce Morales

## Que hice

- `jugadores: string[]`: un array solo de textos. Uso `push` para agregar a la quinta jugadora.
- `golesPorJugador: number[]`: los goles de cada jugadora, solo numeros.
- `marcador: [golesLocal: number, golesVisitante: number]`: una tupla con exactamente dos numeros. La desestructuro en `golesLocal` y `golesVisitante`.
- Uso `map` y `join` para armar la plantilla con el dorsal de cada jugadora.
- Reto extra:
  - `dorsales: Array<number>` con el numero de cada jugadora.
  - El total de goles del partido (suma de la tupla) y los goles del equipo local (con `reduce` sobre `golesPorJugador`).

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/03-arrays-y-tuplas/index.ts
```

## Salida esperada

```text
========= PARTIDO DE FUTBOL SALA =========
Plantilla:
  #1 Ana
  #4 Lucia
  #7 Sofia
  #9 Valeria
  #10 Camila
Dorsales: 1, 4, 7, 9, 10
Marcador: Local 4 - 2 Visitante
Goles del equipo local (por jugadora): 4
Total de goles del partido: 6
==========================================
```
