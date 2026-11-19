# Intermedio 14: Catalogo de peliculas de miedo

**Tematica:** peliculas
**Alumna:** Dulce Morales

## Problema

Un cine club tiene un catalogo de peliculas de terror con resenas. El programa calcula la calificacion de cada pelicula (solo si tiene suficientes resenas), mide su **nivel de miedo** y recomienda un **maraton** para cada espectador segun su edad, el tiempo que tiene y si quiere evitar el gore.

## Que hice

### Modelo (objetos anidados)

- `interface Pelicula` con objetos anidados: `director` (nombre, pais), `sustos` (saltos y nivel de gore de 0 a 3) y una lista de `Resena`.
- Union types: `Subgenero` y `Clasificacion` (B: 12+, B15: 15+, C: 18+).
- `interface Espectador`, `FichaPelicula` (con `calificacion: number | null`) y `Maraton`.

### Reglas de negocio

- **Calificacion:** promedio de las resenas, solo si hay **al menos 3**. Si hay menos, es `null` (se muestra "s/c") y la pelicula no se recomienda.
- **Nivel de miedo (0-10):**
  - sustos por hora / 2, hasta un maximo de 7 puntos;
  - mas el nivel de gore, hasta 3 puntos.
- **Para cada espectador** se excluyen las peliculas:
  - por clasificacion segun su edad;
  - con gore mayor a 1, si evita el gore;
  - sin calificacion.
- **Orden de preferencia:** subgeneros favoritos primero, luego mejor nota y luego mas corta. Se van agregando mientras quepan en el tiempo disponible.
- **Orden de proyeccion:** de menos a mas miedo, para ir subiendo la tension.
- **Validacion:** duracion positiva, sustos no negativos y resenas de 1 a 10.

### Como use arrays tipados

- `map`: crear las fichas y las resenas de prueba.
- `filter`: peliculas validas, aptas para cada espectador y resenas fuera de rango.
- `reduce`: promedio de resenas, minutos acumulados y la seleccion del maraton.
- `sort`: ranking por nota, preferencia del espectador y orden de proyeccion, siempre sobre copias.

### Casos probados

- **Valeria (normal):** ve sus favoritas (slasher y zombis) y llena 295 de 300 minutos.
- **Tomas, 15 anios (limite):** tiene **exactamente** la edad minima de B15, asi que si puede ver "El Espejo Roto". Las C (18+) quedan fuera. Ademas llena **exactamente** sus 200 minutos.
- **Rocio (evita gore):** se excluyen las peliculas con gore 2 y 3.
- **Estreno Misterioso:** tiene notas altas pero solo 2 resenas, asi que no se recomienda a nadie.
- **Invalida:** "Datos Rotos" tiene resenas de 12 y -1.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/14-catalogo-terror/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
====================== CATALOGO DE TERROR ======================
X Datos Rotos: 2 resena(s) fuera de 1-10
1. El Espejo Roto          2018 psicologico   B15 115 min | nota  9.0 (4 res.) | miedo 1.6
2. La Casa del Pozo        2019 sobrenatural  B15  98 min | nota  8.0 (4 res.) | miedo 5.3
3. Ciudad Infectada        2022 zombis        C   105 min | nota  8.0 (4 res.) | miedo 5.4
4. Grabacion 47            2020 found footage B    85 min | nota  7.0 (3 res.) | miedo 7.0
5. Cuchillo de Medianoche  2021 slasher       C    92 min | nota  6.8 (5 res.) | miedo 8.9
6. Susurros                2023 sobrenatural  B    90 min | nota  6.7 (3 res.) | miedo 3.3
7. Estreno Misterioso      2026 psicologico   B    95 min | nota  s/c (2 res.) | miedo 2.5
La que mas asusta: Cuchillo de Medianoche (8.9/10)

--- Maraton para Valeria (27 anios, 300 min) ---
  1. La Casa del Pozo         98 min | miedo 5.3
  2. Ciudad Infectada        105 min | miedo 5.4
  3. Cuchillo de Medianoche   92 min | miedo 8.9
  Total: 295 de 300 min
  - Estreno Misterioso: solo 2 resena(s)
  - El Espejo Roto: no alcanza el tiempo
  - Grabacion 47: no alcanza el tiempo
  - Susurros: no alcanza el tiempo

--- Maraton para Tomas (15 anios, 200 min) ---
  1. El Espejo Roto          115 min | miedo 1.6
  2. Grabacion 47             85 min | miedo 7.0
  Total: 200 de 200 min
  - Cuchillo de Medianoche: clasificacion C (18+)
  - Ciudad Infectada: clasificacion C (18+)
  - Estreno Misterioso: solo 2 resena(s)
  - La Casa del Pozo: no alcanza el tiempo
  - Susurros: no alcanza el tiempo

--- Maraton para Rocio (34 anios, 210 min, sin gore) ---
  1. El Espejo Roto          115 min | miedo 1.6
  2. Grabacion 47             85 min | miedo 7.0
  Total: 200 de 210 min
  - Cuchillo de Medianoche: gore nivel 3
  - Ciudad Infectada: gore nivel 2
  - Estreno Misterioso: solo 2 resena(s)
  - La Casa del Pozo: no alcanza el tiempo
  - Susurros: no alcanza el tiempo
```
