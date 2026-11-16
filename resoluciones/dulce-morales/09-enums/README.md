# Ejercicio 09: Enums

**Contexto:** Generos musicales
**Alumna:** Dulce Morales

## Que hice

- Cree un `enum GeneroMusical` real con seis generos: Rock, Pop, Reggaeton, Jazz, Electronica y Salsa. Cada uno tiene un valor de texto para imprimirlo facil.
- El tipo `Cancion` tiene `genero: GeneroMusical`, asi que solo acepta valores del enum. Un texto suelto como `"Cumbia"` marca error (hay una linea comentada de ejemplo).
- Todas las canciones se clasifican con `GeneroMusical.Rock`, `GeneroMusical.Pop`, etc., nunca con strings sueltos.
- Recorro el enum con `Object.values(GeneroMusical)` para contar cuantas canciones hay de cada genero.
- Reto extra: `filtrarPorGenero(canciones, genero)` devuelve solo las canciones del genero elegido. La playlist final muestra las de Rock con su duracion total.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/09-enums/index.ts
```

## Salida esperada

```text
====== CANCIONES POR GENERO ======
Rock         3
Pop          2
Reggaeton    1
Jazz         1
Electronica  1
Salsa        1

====== PLAYLIST: ROCK ======
1. Bohemian Rhapsody - Queen (5:54)
2. Back in Black - AC/DC (4:15)
3. Smells Like Teen Spirit - Nirvana (5:01)
Canciones: 3 | Duracion total: 15:10
```
