# Intermedio 72 - Menu interactivo comida

**Tematica:** comida
**Alumna:** Dulce Morales

## Problema

La app de menu de un restaurante: filtrar platillos, armar un carrito con tamanos y extras, confirmar
pedidos y sacar un reporte de ventas del dia.

## Que hice

Arquitectura simple en capas:

- **`RepoMemoria<T>`**: un repositorio generico en memoria. Se usa para el menu y para los extras.
- **`AgregarDTO`**: el DTO de entrada, es decir lo que manda la pantalla al tocar "Agregar".
  `tamano`, `extras` y `nota` son opcionales.
- **`Carrito`**: el servicio que valida el DTO y lo convierte en una `LineaCarrito`. Devuelve
  `Resultado<T>`, una union discriminada por `ok`, para que los errores sean explicitos.
- **`TicketDTO`**: el DTO de salida con todo lo que la pantalla necesita para dibujar el ticket: lineas,
  subtotal, descuento, propina, total y alergenos.
- **`Pedidos`**: un repositorio de pedidos confirmados que tambien genera el reporte del dia.
- **`filtrarMenu`**: combina categoria, alergenos a evitar y horario.

## Reglas

| Regla | Valor |
|---|---|
| Desayunos | solo antes de las 12:00 (a las 12:00 en punto ya no) |
| Agotados | no aparecen en el menu ni se pueden agregar |
| Cantidad por linea | 1 a 10 |
| Tamanos | solo para bebidas: chico x0.8, normal x1, grande x1.3 |
| Extras | solo los permitidos para cada platillo y sin repetir |
| Combo | cada plato fuerte con una bebida tiene 10 % de descuento en esa bebida |
| Propina | 10 % sobre el subtotal ya con descuento |
| Alergenos | el ticket junta los del platillo y los de sus extras |

## Casos probados

- **Filtros:** menu a las 11:00 y a las 12:00 (caso limite), sin gluten, y bebidas sin lacteos.
- **Pedido 1:** un extra no permitido, un extra repetido, bebidas en tamano grande y una nota. No hay
  combo porque no lleva plato fuerte.
- **Pedido 2:** se rechazan un desayuno fuera de horario, un platillo agotado, uno inexistente y
  cantidades de 0 y 11. Tambien se rechaza un tamano en un platillo sin tamanos. Se quita una linea
  y se aplican 3 combos: (45 + 28 + 28) x 10 % = $10.10.
- **Pedido 3:** un carrito vacio se rechaza.
- **Reporte:** ventas, ticket promedio, unidades por categoria y el mas vendido. Si hay empate, gana
  el primero en orden alfabetico.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/72-menu-comida-app/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
=== Filtros del menu ===
  11:00 todo:             Chilaquiles, Hot cakes, Hamburguesa, Ensalada cesar, Limonada, Cafe latte, Brownie
  12:00 todo (limite):    Hamburguesa, Ensalada cesar, Limonada, Cafe latte, Brownie
  14:00 sin gluten:       Ensalada cesar, Limonada, Cafe latte
  14:00 bebidas sin lact: Limonada

=== Pedido 1 (10:30) ===
  + 2x Chilaquiles
  x extra "queso" no disponible para Hot cakes
  + 2x Cafe latte
  x extra "nuez" repetido
  + 1x Hot cakes
  --- Ticket #1 ---
  2x Chilaquiles + aguacate, tocino [salsa verde]        $266.00
  2x Cafe latte (grande)                                 $117.00
  1x Hot cakes + crema batida                             $90.00
  Subtotal                                               $473.00
  Propina 10%                                             $47.30
  TOTAL                                                  $520.30
  Contiene: gluten, huevo, lacteos

=== Pedido 2 (14:00) ===
  x Chilaquiles solo se sirve antes de las 12:00
  x Aguachile esta agotado
  x platillo "pizza" no existe
  x cantidad debe ser de 1 a 10
  x cantidad debe ser de 1 a 10
  + 3x Hamburguesa
  x Ensalada cesar no tiene tamanos
  + 1x Ensalada cesar
  + 2x Limonada
  + 1x Cafe latte
  + 2x Brownie
  quitar linea 9: false, quitar linea 1: true
  --- Ticket #2 ---
  3x Hamburguesa + queso extra                           $465.00
  2x Limonada (chico)                                     $56.00
  1x Cafe latte (normal)                                  $45.00
  2x Brownie + crema batida                              $140.00
  Subtotal                                               $706.00
  Descuento combo                                        -$10.10
  Propina 10%                                             $69.59
  TOTAL                                                  $765.49
  Contiene: gluten, huevo, lacteos, nueces

=== Pedido 3 (vacio) ===
  x el carrito esta vacio

=== Reporte del dia ===
  Pedidos: 2 | Ventas: $1285.79 | Ticket promedio: $642.89
  Unidades por categoria: desayuno=3, plato=3, bebida=5, postre=2
  Mas vendido: Cafe latte (3)
```
