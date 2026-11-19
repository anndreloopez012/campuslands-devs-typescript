# Intermedio 78 - Canvas de dibujo basico

**Tematica:** dibujo
**Alumna:** Dulce Morales

## Problema

Una app de dibujo sencilla tipo `<canvas>`: lineas, rectangulos, circulos y cubeta de relleno, con
deshacer y rehacer, guardado y carga del dibujo, y un reporte de lo pintado. Como corre en Node, el
canvas se simula con una matriz de caracteres donde cada caracter es un pixel.

## Que hice

- **`Figura`**: una union discriminada por `tipo` (`linea`, `rect`, `circulo`, `cubeta`). Cada variante
  tiene solo sus propios datos.
- **Modelo del dibujo**: el dibujo es la lista de figuras, no los pixeles. Por eso deshacer es tan
  simple como quitar la ultima figura.
- **Rasterizado (funciones puras sobre el lienzo)**:
  - lineas con el algoritmo de **Bresenham** (solo enteros);
  - circulos con el algoritmo del **punto medio** (simetria de 8 octantes);
  - cubeta con **flood fill** iterativo (pila, 4 vecinos);
  - lo que sale del lienzo se recorta, como en un canvas real.
- **`Editor`**: guarda el historial con dos pilas (hechas y deshechas). Una accion nueva vacia la pila
  de rehacer.
- **`DibujoDTO`**: lo que se guarda en el storage simulado (`version`, tamano y figuras). Al cargar se
  valida con type guards (`esFigura`, `esPunto`, `esColor`) porque el JSON puede venir danado.
- **Reporte**: pixeles por color, figuras por tipo y fondo sin pintar.

## Reglas

| Regla | Detalle |
|---|---|
| Rectangulo | ancho y alto >= 1; puede ser solo borde o relleno |
| Circulo | radio >= 1 |
| Linea | se rechaza solo si ambos extremos estan fuera; si no, se recorta |
| Cubeta | el punto debe estar dentro del lienzo (0 <= x < ancho) |
| Orden | las figuras se pintan en el orden en que se agregaron |
| Carga | solo version 1; se rechaza si hay alguna figura invalida |

## Casos probados

- Dibujo de una casa con techo, puerta rellena, sol con cubeta y pasto.
- Circulo verde que se sale del borde y se recorta.
- Rechazos: rectangulo de ancho 0, circulo de radio 0 y linea totalmente fuera.
- Caso limite: cubeta en `x = 32` con un lienzo de ancho 32, que queda fuera.
- Historial: deshacer dos veces, rehacer una, y despues de una accion nueva ya no se puede rehacer.
- La cubeta rellena el interior de la casa sin salirse de las paredes ni pintar la puerta.
- Guardar y cargar: el dibujo recargado se ve identico al original.
- Cargas fallidas: dibujo inexistente, JSON corrupto, version 2 y figura desconocida.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/78-canvas-dibujo-basico/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
=== Dibujando una casa ===
  + rect negro
  + linea rojo
  + linea rojo
  + linea rojo
  + rect azul
  + circulo amarillo
  + cubeta amarillo
  + linea verde
  + circulo verde
  x rect: el rectangulo necesita ancho y alto >= 1
  x circulo: el radio debe ser >= 1
  x linea: la linea esta completamente fuera del lienzo
  x cubeta: la cubeta debe usarse dentro del lienzo
    ................................
    .........RR.............YYY.....
    ........R..R...........YYYYY....
    .......R....R..........YYYYY....
    ......R......R.........YYYYY....
    .....R........R.........YYY.....
    ....R##########R.............VVV
    ....#..........#...........VV...
    ....#..........#...........V....
    ....#...AAA....#..........V.....
    ....#...AAA....#..........V.....
    ....#...AAA....#..........V.....
    ....####AAA#####...........V....
    VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV

=== Historial ===
  deshacer circulo
  deshacer linea
  rehacer linea
  + cubeta amarillo
  nada que rehacer
    ................................
    .........RR.............YYY.....
    ........R..R...........YYYYY....
    .......R....R..........YYYYY....
    ......R......R.........YYYYY....
    .....R........R.........YYY.....
    ....R##########R................
    ....#YYYYYYYYYY#................
    ....#YYYYYYYYYY#................
    ....#YYYAAAYYYY#................
    ....#YYYAAAYYYY#................
    ....#YYYAAAYYYY#................
    ....####AAA#####................
    VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV

=== Guardar y cargar ===
  guardado: 9 figuras en 723 caracteres de JSON
  cargado: 9 figuras, identico al original: true
  cargar inexistente: no hay dibujo guardado
  cargar corrupto: JSON invalido
  cargar version 2: version no soportada
  cargar figura rara: 1 figura(s) invalida(s)

=== Reporte ===
  Figuras: 9 (rect x2, linea x4, circulo x1, cubeta x2)
  Pixeles por color: negro 29 px (6.5%), rojo 12 px (2.7%), azul 12 px (2.7%), verde 32 px (7.1%), amarillo 62 px (13.8%)
  Fondo sin pintar: 301 de 448 px
```
