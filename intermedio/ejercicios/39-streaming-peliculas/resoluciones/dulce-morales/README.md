# Intermedio 39: Recomendador de streaming

**Tematica:** peliculas y series
**Alumna:** Dulce Morales

## Problema

Una plataforma de streaming quiere recomendar contenido a cada perfil:

1. Con lo que el perfil ya vio y las estrellas que le puso, se calcula **cuanto le gusta cada genero**.
2. Se descartan los titulos ya vistos, los no aptos para su edad o los que no caben en el tiempo que tiene.
3. Se ordenan por puntaje, cuidando que el top no repita demasiado el mismo genero.

## Que hice

### Tipos y type guards

- Literal types: `Genero` y `Clasificacion` ("ATP" | "+13" | "+16" | "+18").
- `type Contenido`: union discriminada por `formato`. Una pelicula tiene `duracionMin`; una serie tiene `temporadas` y `minutosPorEpisodio`. Las dos comparten `Base`.
- **Type guard** `esSerie`: para saber que duracion usar (la del episodio o la de la pelicula) y que datos mostrar.

### Clase generica `Recomendador<T extends Base>`

Funciona con cualquier contenido que tenga generos, clasificacion y popularidad. Recibe por constructor una funcion que dice cuantos minutos dura cada item.

- `afinidad(perfil)`: para cada genero, el promedio de (estrellas - 3) de lo que vio. Mayor que 0 = le gusta; menor que 0 = no le gusta. Usa un `Map`.
- `descartar(item, perfil)`: el motivo por el que no se recomienda, o `null`.
- `recomendar(perfil)`: arma el top y la lista de descartados.

### Reglas

- **Edad minima:** ATP 0, +13 13, +16 16, +18 18.
- **Tiempo:** una pelicula debe durar, o un episodio de una serie, como maximo los minutos disponibles.
- **Puntaje:** mejor afinidad entre los generos del titulo x 30 + popularidad / 2.
- **Diversidad:** en el top 5 entran como maximo 2 titulos con el mismo genero principal.
- **Sin historial:** solo cuenta la popularidad.

### Casos probados

- **Lucia:** le encanta la ciencia ficcion (+2) y no le gusta la comedia (-1). Su top empieza con ciencia ficcion.
- **Tomas (limite):** tiene **13 anios exactos**, asi que puede ver contenido +13 pero se le descartan los +16 y +18.
- **Invitado:** no tiene historial y solo tiene 60 min, asi que se descartan todas las peliculas largas. Limite: "Ecos del Pasado" tiene episodios de **exactamente** 60 min y si entra.
- Lo ya visto nunca se recomienda.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/39-streaming-peliculas/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
=============== Lucia (29 anios, 150 min disponibles) ===============
Afinidad: ciencia ficcion +2, drama +1.5, comedia -1
  1. Protocolo Marte       105.5 pts | pelicula, 140 min            | porque le gusta ciencia ficcion
  2. Robots de Bolsillo       94 pts | serie, 4 temp. de 22 min     | porque le gusta ciencia ficcion
  3. Familia Disfuncional   84.5 pts | serie, 5 temp. de 25 min     | porque le gusta drama
  4. Expedientes Ocultos    82.5 pts | serie, 2 temp. de 45 min     | porque le gusta drama
  5. Pixeles Perdidos         44 pts | pelicula, 100 min            | popular en la plataforma

=============== Tomas (13 anios, 120 min disponibles) ===============
Afinidad: comedia +2, animacion +1.5, ciencia ficcion +1
  1. Familia Disfuncional   99.5 pts | serie, 5 temp. de 25 min     | porque le gusta comedia
  2. Risas en la Oficina      92 pts | pelicula, 95 min             | porque le gusta comedia
  3. Estacion Nebula          73 pts | serie, 3 temp. de 50 min     | porque le gusta ciencia ficcion
  4. Oceanos Profundos      27.5 pts | pelicula, 90 min             | popular en la plataforma
  - Orbita Silenciosa: dura 128 min y tiene 120
  - La Casa del Eco: clasificacion +18
  - Protocolo Marte: dura 140 min y tiene 120
  - Velocidad Final: clasificacion +16
  - Ecos del Pasado: clasificacion +16
  - Expedientes Ocultos: clasificacion +16

=============== Invitado (35 anios, 60 min disponibles) ===============
Afinidad: sin historial
  1. Estacion Nebula          43 pts | serie, 3 temp. de 50 min     | popular en la plataforma
  2. Familia Disfuncional   39.5 pts | serie, 5 temp. de 25 min     | popular en la plataforma
  3. Expedientes Ocultos    37.5 pts | serie, 2 temp. de 45 min     | popular en la plataforma
  4. Ecos del Pasado          35 pts | serie, 2 temp. de 60 min     | popular en la plataforma
  5. Robots de Bolsillo       34 pts | serie, 4 temp. de 22 min     | popular en la plataforma
  - Orbita Silenciosa: dura 128 min y tiene 60
  - Risas en la Oficina: dura 95 min y tiene 60
  - La Casa del Eco: dura 102 min y tiene 60
  - Protocolo Marte: dura 140 min y tiene 60
  - Pixeles Perdidos: dura 100 min y tiene 60
  - Oceanos Profundos: dura 90 min y tiene 60
  - Velocidad Final: dura 118 min y tiene 60

```
