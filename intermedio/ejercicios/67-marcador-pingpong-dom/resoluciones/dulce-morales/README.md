# Intermedio 67: Marcador pingpong DOM

**Tematica:** pingpong
**Alumna:** Dulce Morales

## Problema

Un marcador electronico de pingpong con botones: **"+1 Ana"**, **"+1 Beto"**, **"Deshacer"** y **"Nuevo partido"**. El marcador lleva:

- el puntaje del set y los sets ganados;
- **quien saca:** cambia cada 2 puntos, y desde el 10-10 cambia en cada punto;
- cuando se gana un set (11 con 2 de ventaja) o el partido (mejor de 5);
- un **historial** para deshacer el ultimo punto.

## Sobre el DOM

Se ejecuta con Node, sin navegador. Cada boton se simula como un evento, y `render()` devuelve lo que mostraria la pantalla del marcador. En una pagina real, cada boton haria `estado = reducer(estado, evento)` y volveria a pintar.

## Que hice

### Tipos

- `type Jugador = "A" | "B"`.
- `Marcador`: puntos, sets, quien saca, quien empezo sacando el set, historial de sets y ganador.
- `Estado`: el marcador actual, una **pila** de marcadores anteriores (para deshacer) y un mensaje.
- `type Evento`: `PUNTO` (con jugador), `DESHACER` y `NUEVO_PARTIDO`.

Uso `satisfies Record<Jugador, number>` al crear los puntos y sets nuevos: TypeScript revisa que tengan las dos claves, sin perder el tipo exacto.

### Reglas (funciones puras)

- `ganoSet(puntos, jugador)`: llego a 11 o mas, con 2 de ventaja.
- `quienSaca(puntos, empieza)`: cuenta los turnos de saque (cada 2 puntos, o cada punto desde el 10-10).
- `marcarPunto()`: suma el punto y decide si se gano el set o el partido. Al empezar un set nuevo, empieza sacando el otro jugador y cambian de lado.

### Deshacer con una pila

Cada `PUNTO` guarda el marcador anterior en la pila. `DESHACER` saca el ultimo y lo vuelve a poner como actual. Asi se puede deshacer incluso el punto que gano el partido.

### Casos probados

- **Deshacer sin puntos:** da error.
- **Iguales:** en el set 2 llegan a 10-10, Beto se pone 11-10 y Ana iguala 11-11.
- **Correccion:** se marca un punto de mas y se deshace.
- **Limite de 2 de ventaja:** Ana gana el set 13-11, no en 12-11.
- **Partido:** Ana gana 3-1 (11-6, 13-11, 3-11, 11-9).
- **Despues del final:** un punto mas da error.
- **Deshacer el punto ganador:** el marcador vuelve a 10-9 en el set 4, con el partido abierto otra vez.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/67-marcador-pingpong-dom/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
* = quien saca

Deshacer sin puntos
  * Ana   sets 0  puntos  0 |   Beto  sets 0  puntos  0  -> X no hay nada que deshacer

Set 1: Ana gana 11-6
    Ana   sets 1  puntos  0 | * Beto  sets 0  puntos  0  [sets: 11-6]  -> set para Ana 11-6 (cambio de lado)

Set 2: llegan a 10-10 (desde aqui el saque cambia en cada punto)
    Ana   sets 1  puntos 10 | * Beto  sets 0  puntos 10  [sets: 11-6]  -> IGUALES

Beto se pone 11-10 (ventaja); Ana iguala 11-11
    Ana   sets 1  puntos 11 | * Beto  sets 0  puntos 11  [sets: 11-6]  -> IGUALES

Se marca un punto de mas para Beto y se corrige con Deshacer
    Ana   sets 1  puntos 11 | * Beto  sets 0  puntos 11  [sets: 11-6]  -> se deshizo el ultimo punto

Ana gana el set 13-11 (limite: 2 de ventaja)
  * Ana   sets 2  puntos  0 |   Beto  sets 0  puntos  0  [sets: 11-6, 13-11]  -> set para Ana 13-11 (cambio de lado)

Set 3: Beto gana 11-3
    Ana   sets 2  puntos  0 | * Beto  sets 1  puntos  0  [sets: 11-6, 13-11, 3-11]  -> set para Beto 3-11 (cambio de lado)

Set 4: Ana gana 11-9 y el partido
    Ana   sets 3  puntos 11 |   Beto  sets 1  puntos  9  [sets: 11-6, 13-11, 3-11, 11-9]  -> Ana GANA EL PARTIDO 3-1

Punto despues de terminar
    Ana   sets 3  puntos 11 |   Beto  sets 1  puntos  9  [sets: 11-6, 13-11, 3-11, 11-9]  -> X el partido ya termino (usar Nuevo partido o Deshacer)

Deshacer el punto ganador (vuelve a 10-9)
  * Ana   sets 2  puntos 10 |   Beto  sets 1  puntos  9  [sets: 11-6, 13-11, 3-11]  -> se deshizo el ultimo punto
```
