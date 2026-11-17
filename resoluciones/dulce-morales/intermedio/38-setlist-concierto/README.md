# Intermedio 38: Setlist de concierto

**Tematica:** musica en vivo
**Alumna:** Dulce Morales

## Problema

Una banda arma propuestas de *setlist* (el orden del concierto) que mezclan canciones, solos, momentos de hablar con el publico y un *encore*. El programa:

- valida cada propuesta contra las reglas del show;
- le da un puntaje;
- elige la mejor propuesta valida.

## Que hice

### Tipos y type guards

- Literal types: `TipoCancion` (hit, nueva, balada, cover) y `Afinacion`.
- `type Elemento`: union discriminada por `clase`: una cancion, un solo, un momento de hablar o el encore. Cada uno tiene sus propios datos.
- **Type guard** `esCancion`: con el, `filter` devuelve solo las canciones y TypeScript sabe que tienen `cancion`.
- Para saber cuanto dura cada elemento uso un `switch` sobre `clase`, que cubre los 4 casos.

### Clase `Setlist`

- `elementos` es **privado** y de solo lectura.
- `canciones`: getter que devuelve solo las canciones.
- `cambiosDeAfinacion()`: cuenta cuantas veces cambia la afinacion entre canciones seguidas.
- `duracionTotal()`: suma todo lo anterior, mas 90 s por cada cambio de afinacion.
- `evaluar()`: devuelve errores (la propuesta es invalida), avisos (bajan el puntaje) y el puntaje.

### Reglas

**Errores (la propuesta queda invalida):**

- dura mas de 75 minutos;
- canciones repetidas;
- faltan los sencillos obligatorios del disco nuevo (un `Set`);
- no tiene encore, o el show no cierra con un hit.

**Avisos (restan puntos):**

- mas de 2 baladas seguidas;
- abrir con energia menor a 7;
- mas de 4 cambios de afinacion.

**Puntaje:** energia promedio x 8 + 3 por cada hit + 2 por cada tipo distinto - 5 por aviso - 2 por cambio de afinacion.

### Casos probados

- **A - Clasica (elegida):** tiene **exactamente** 2 baladas seguidas, el maximo permitido, asi que no recibe aviso.
- **B - Todo energia:** valida, pero con 7 cambios de afinacion pierde puntos.
- **C - Acustica:** cierra con una cancion nueva (no un hit), tiene 3 baladas seguidas y abre con poca energia.
- **D - Demasiado larga:** dura 81:20 y repite "Himno".
- **E - Solo los viejos exitos:** faltan las dos canciones obligatorias.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/38-setlist-concierto/index.ts
```

## Salida esperada

```text
================ PROPUESTAS DE SETLIST (maximo 75:00) ================

A - Clasica: 11 canciones, 59:50, 2 cambio(s) de afinacion
  Puntaje: 78

B - Todo energia: 8 canciones, 48:10, 7 cambio(s) de afinacion
  ! 7 cambios de afinacion: muchos tiempos muertos
  Puntaje: 70

C - Acustica: 6 canciones, 29:20, 0 cambio(s) de afinacion
  X el show debe cerrar con un hit
  ! 3 baladas seguidas (hasta "Volver a Empezar"): el publico se enfria
  ! abre con poca energia (4)
  Puntaje: 0 (invalida)

D - Demasiado larga: 8 canciones, 81:20, 0 cambio(s) de afinacion
  X dura 81:20 (maximo 75:00)
  X canciones repetidas: Himno
  Puntaje: 0 (invalida)

E - Solo los viejos exitos: 5 canciones, 24:50, 0 cambio(s) de afinacion
  X faltan las obligatorias: Ciudad de Neon, Ultimo Tren
  Puntaje: 0 (invalida)

================ ELEGIDA: A - Clasica ================
 1. Ciudad de Neon     nueva   energia #########
 2. Fuego Lento        hit     energia ########
 3. Asfalto            hit     energia #########
 4. Ultimo Tren        nueva   energia #######
 5. Marea              balada  energia ####
 6. Siempre Tu         balada  energia ####
 7. Rompe el Silencio  hit     energia #########
 8. Electrico          cover   energia ########
 9. Noches de Agosto   hit     energia ########
10. Volver a Empezar   balada  energia #####
11. Himno              hit     energia ##########
```
