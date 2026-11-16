# Ejercicio 07: Objetos avanzados

**Contexto:** Biblioteca de peliculas
**Alumna:** Dulce Morales

## Que hice

- **Objeto anidado:** cada `Pelicula` tiene un `director` de tipo `Director`, con nombre, pais y Oscar ganados.
- **Propiedades `readonly`:** `id` y `anio` de la pelicula, `nombre` y `pais` del director, y `calificaciones` como `readonly number[]` (no se le puede hacer `push`). En el codigo nunca se modifican; hay lineas comentadas que muestran el error si se intenta.
- **Propiedades opcionales:** `subtitulo?` en la pelicula y `premiosOscar?` en el director.
- **Metodos con tipo de retorno:** `calcularPromedio(): number` y `esRecomendada(): boolean`.
- La funcion `crearPelicula` agrega los metodos a cada pelicula, asi no se repiten en cada objeto. Uso `Omit` para que los datos de entrada no incluyan los metodos.
- Para mostrar que las propiedades normales si se pueden cambiar, cambio el `titulo` de una pelicula.
- Reto extra: una pelicula es recomendada cuando su promedio es mayor a 4.5.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/07-objetos-avanzados/index.ts
```

## Salida esperada

```text
========== BIBLIOTECA DE PELICULAS ==========
[PEL-001] El viaje de Chihiro - 2001
  Director: Hayao Miyazaki (Japon, 2 Oscar)
  Promedio: 4.86 / 5   RECOMENDADA
[PEL-002] Roma - 2018
  Director: Alfonso Cuaron (Mexico, 5 Oscar)
  Promedio: 4.42 / 5   -
[PEL-003] Parasitos (Gisaengchung) - 2019
  Director: Bong Joon-ho (Corea del Sur, 4 Oscar)
  Promedio: 4.85 / 5   RECOMENDADA
[PEL-004] La invencion de Cronos - 1993
  Director: Guillermo del Toro (Mexico, sin datos de Oscar)
  Promedio: 3.80 / 5   -
=============================================
Recomendadas (promedio > 4.5): El viaje de Chihiro, Parasitos
```
