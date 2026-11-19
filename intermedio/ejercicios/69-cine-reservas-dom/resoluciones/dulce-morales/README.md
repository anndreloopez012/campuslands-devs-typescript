# Intermedio 69 - Reservas de cine DOM

**Tematica:** peliculas
**Alumna:** Dulce Morales

## Problema

Simular la pantalla donde se eligen asientos para una funcion de cine. En el navegador cada asiento
seria un boton del DOM; aqui la sala se dibuja en consola y cada clic es un evento que procesa un reducer.

## Que hice

- `Compra` es una union discriminada que funciona como maquina de estados:
  `eligiendo` -> `pagando` -> `confirmada`, o `pagando` -> `expirada` si se acaba el tiempo.
  Cada fase solo guarda los datos que tiene sentido tener (por ejemplo, solo `confirmada` tiene codigo y total).
- `Evento`: `CLIC_ASIENTO`, `CONTINUAR` (con los tipos de boleto), `PAGAR`, `VOLVER` y `TICK` (reloj simulado).
- `IdAsiento` es un template literal type (`` `${Fila}${number}` ``), asi un id como `"Z1"` ni siquiera compila.
- El "DOM" se simula con `claseAsiento` (la clase CSS que tendria cada boton) y `renderSala`, que dibuja la cuadricula.
- Las funciones de validacion, calculo y dibujo estan separadas del reducer.

## Reglas

| Regla | Valor |
|---|---|
| Asientos por compra | maximo 6 |
| Tiempo para pagar | 300 s; al llegar exactamente a 300 s la compra expira |
| Fila VIP | E, precio x1.5 |
| Descuentos | nino 40 %, estudiante 25 % (se aplican a los asientos mas baratos) |
| Ninos | deben ir con al menos un adulto |
| Boletos | la cantidad debe coincidir con los asientos elegidos |
| Asiento suelto | no se puede dejar un asiento libre aislado junto a los elegidos |
| Clic en elegido | lo quita (alterna) |

## Casos probados

- Clic en asiento vendido y en asiento fuera de la sala.
- Continuar sin asientos, con un hueco suelto, con boletos que no cuadran y con solo ninos.
- Compra familiar confirmada: 3 asientos de $80, 1 adulto + 2 ninos = $176.
- No se pueden cambiar asientos mientras se paga.
- Caso limite: a 1 s del vencimiento sigue pagando; `VOLVER` y continuar reinicia el reloj; a los 300 s exactos expira.
- Grupo grande: el septimo asiento se rechaza; quitar A6 y elegir A7 deja A6 suelto y se rechaza.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/69-cine-reservas-dom/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
Nebulosa Roja | Sala 3 | 19:30 | base $80 (VIP x1.5)
  ======= PANTALLA =======
    1 2 3 4 5 6 7 8
  A . . . . . . . .
  B . . . . . X . .
  C . . . X X . . .
  D X X X . . . . .
  E V V V V V V X X
  (. libre  V vip  # elegido  X vendido)

--- Compra familiar ---
clic C4 (vendido)                      eligiendo: []  (C4 ya esta vendido)
clic A9 (no existe)                    eligiendo: []  (el asiento A9 no existe)
CONTINUAR sin asientos                 eligiendo: []  (elige al menos un asiento)
clic C6                                eligiendo: [C6]
clic C7                                eligiendo: [C6, C7]
CONTINUAR (C8 queda suelto)            eligiendo: [C6, C7]  (la fila C quedaria con un asiento suelto)
clic C8                                eligiendo: [C6, C7, C8]
CONTINUAR 3 asientos con 2 boletos     eligiendo: [C6, C7, C8]  (hay 3 asientos pero 2 boletos)
CONTINUAR solo ninos                   eligiendo: [C6, C7, C8]  (los ninos deben ir con al menos un adulto)
CONTINUAR 1 adulto + 2 ninos           pagando: [C6, C7, C8] quedan 300s
clic D5 (ya pagando)                   pagando: [C6, C7, C8] quedan 300s  (no se pueden cambiar asientos en la fase "pagando")
TICK 120s                              pagando: [C6, C7, C8] quedan 180s
PAGAR                                  CONFIRMADA NR-3-79174: [C6, C7, C8] total $176.00
  ======= PANTALLA =======
    1 2 3 4 5 6 7 8
  A . . . . . . . .
  B . . . . . X . .
  C . . . X X # # #
  D X X X . . . . .
  E V V V V V V X X
  (. libre  V vip  # elegido  X vendido)

--- Pago que se vence ---
clic E3 (VIP)                          eligiendo: [E3]
clic E4 (VIP)                          eligiendo: [E3, E4]
CONTINUAR 1 adulto + 1 estudiante      pagando: [E3, E4] quedan 300s
TICK 299s (limite: falta 1s)           pagando: [E3, E4] quedan 1s
VOLVER                                 eligiendo: [E3, E4]
CONTINUAR otra vez (reloj nuevo)       pagando: [E3, E4] quedan 300s
TICK 300s (limite: justo 5 min)        expirada  (se acabo el tiempo, los asientos se liberaron)
PAGAR tarde                            expirada  (no hay nada que pagar)

--- Grupo grande ---
clic A1                                eligiendo: [A1]
clic A2                                eligiendo: [A1, A2]
clic A3                                eligiendo: [A1, A2, A3]
clic A4                                eligiendo: [A1, A2, A3, A4]
clic A5                                eligiendo: [A1, A2, A3, A4, A5]
clic A6                                eligiendo: [A1, A2, A3, A4, A5, A6]
clic A7 (septimo)                      eligiendo: [A1, A2, A3, A4, A5, A6]  (maximo 6 asientos por compra)
clic A6 (lo quita)                     eligiendo: [A1, A2, A3, A4, A5]
clic A7                                eligiendo: [A1, A2, A3, A4, A5, A7]
CONTINUAR (A6 queda suelto)            eligiendo: [A1, A2, A3, A4, A5, A7]  (la fila A quedaria con un asiento suelto)
```
