# Ejercicio 14: Async/Await

**Contexto:** Consulta de API de peliculas
**Alumna:** Dulce Morales

## Que hice

- No uso ninguna API real: las peliculas vienen de `datos.json` (los tres datos base mas tres peliculas nuevas).
- `esperar(ms)` simula la latencia de red con `setTimeout` dentro de una `Promise<void>`.
- Funciones `async` que simulan la API, cada una retorna una promesa tipada:
  - `obtenerPeliculas(servidorDisponible)`: `Promise<Pelicula[]>`. Si el servidor esta caido, lanza un error 503.
  - `obtenerPeliculaPorId(id)`: `Promise<Pelicula>`. Si el id no existe, lanza un error 404.
  - `obtenerCienciaFiccion()` (reto extra): espera el catalogo y filtra el genero ciencia ficcion.
- `ErrorApi` es una clase de error propia con un `codigo`, para distinguir los fallos de la API.
- Cada consulta esta dentro de `try/catch`. `describirError(error: unknown)` convierte cualquier error en un mensaje claro, asi la app nunca se cae.
- `main()` es `async` y usa `await` en cada consulta, en orden.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/14-async-await/index.ts
```

## Salida esperada

```text
Consultando catalogo...
=== CATALOGO (6 peliculas) ===
#1 Nebula 9           | ciencia ficcion | 4.7
#2 Gol Final          | deportes        | 4.1
#3 Motores de Acero   | accion          | 4.4
#4 Orbita Silenciosa  | ciencia ficcion | 4.2
#5 La Casa del Eco    | terror          | 3.9
#6 Protocolo Marte    | ciencia ficcion | 4.8

Consultando ciencia ficcion...
=== CIENCIA FICCION (3) ===
#1 Nebula 9           | ciencia ficcion | 4.7
#4 Orbita Silenciosa  | ciencia ficcion | 4.2
#6 Protocolo Marte    | ciencia ficcion | 4.8

Buscando pelicula con id 6...
Encontrada: #6 Protocolo Marte    | ciencia ficcion | 4.8

Buscando pelicula con id 42...
Error 404: No existe una pelicula con id 42

Consultando con el servidor caido...
Error 503: El servidor de peliculas no responde
```
