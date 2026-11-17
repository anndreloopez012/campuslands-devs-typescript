# Intermedio 17: Pedidos de food truck

**Tematica:** comida
**Alumna:** Dulce Morales

## Problema

Un food truck recibe pedidos en fila. Cada platillo usa ingredientes de un inventario limitado. El programa:

- valida cada pedido: que el platillo exista, que alcancen los ingredientes y que no tenga alergenos del cliente;
- calcula el total con descuento de combo y propina;
- estima a que minuto queda listo cada pedido;
- cierra el dia con un resumen.

## Que hice

### Modelo (objetos anidados)

- `interface Platillo` con su `receta` anidada (`Partial<Record<Ingrediente, number>>`: cuantas unidades usa de cada ingrediente) y su lista de `alergenos`.
- `interface Pedido` con un `cliente` anidado (nombre y alergias) y sus `LineaPedido`.
- `type Inventario = Record<Ingrediente, number>`: unidades disponibles de cada ingrediente.
- `type Resultado`: union discriminada (pedido atendido con su ticket y el inventario **nuevo**, o un error).

### Reglas de negocio

- **Validacion**, en este orden:
  1. el platillo existe en el menu;
  2. la cantidad es mayor que 0;
  3. la propina esta entre 0 y 30%;
  4. el pedido no tiene alergenos del cliente;
  5. alcanzan **todos** los ingredientes del pedido completo.
- **Combo:** si el pedido tiene principal + acompanante + bebida, 10% de descuento.
- **Propina:** se calcula sobre el total despues del descuento.
- **Tiempo:** la cocina prepara un pedido a la vez. Cada pedido tarda lo que el platillo mas lento + 1 minuto por cada unidad extra.
- **Inventario:** solo se descuenta si el pedido se acepta. Se avisa cuando un ingrediente queda en 3 o menos (stock bajo) o en 0 (agotado).

### Como use arrays tipados

- `find` y `some`: buscar platillos, platillos desconocidos y cantidades invalidas.
- `filter` y `map`: ingredientes faltantes y alergenos en conflicto.
- `flatMap`: juntar los alergenos de todas las lineas del pedido.
- `reduce`: subtotal, unidades, ventas y propinas.
- `sort`: platillos mas vendidos (por unidades y luego por nombre).

### Casos probados

| Pedido | Caso | Resultado |
|---|---|---|
| #1 Ana | Combo completo | 10% de descuento |
| #2 Luis | Normal | Atendido |
| #3 Marta | Alergica al gluten pide hamburguesa | Rechazado |
| #4 Jorge | Limite: usa **exactamente** los 2 camarones que quedan | Atendido; el camaron queda agotado |
| #5 Rosa | Pide camaron despues | Rechazado: no hay |
| #6 Pablo | Pide 2 hamburguesas con 1 pan | Rechazado: no alcanza |
| #7 Elena | Combo con varias unidades | Atendido |
| #8 / #9 | Platillo inexistente, cantidad 0 y propina de 50% | Rechazados |

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/17-pedidos-foodtruck/index.ts
```

## Salida esperada

```text
==================== FOOD TRUCK - SERVICIO ====================
#1 Ana    OK subtotal $21.00 - combo $2.10 + propina $1.89 = $20.79 | 9 min, listo en el minuto 9
#2 Luis   OK subtotal $18.50 + propina $2.78 = $21.28 | 10 min, listo en el minuto 19
#3 Marta  X  alergia: Hamburguesa (gluten)
#4 Jorge  OK subtotal $21.00 + propina $1.05 = $22.05 | 9 min, listo en el minuto 28
#5 Rosa   X  no alcanza: camaron (necesita 1, hay 0)
#6 Pablo  X  no alcanza: pan (necesita 2, hay 1)
#7 Elena  OK subtotal $19.50 - combo $1.95 + propina $3.51 = $21.06 | 10 min, listo en el minuto 38
#8 Error  X  el platillo PIZ no esta en el menu
#9 Error  X  hay cantidades invalidas

==================== CIERRE DEL DIA ====================
Pedidos atendidos: 4 de 9
Ventas: $75.95 | Propinas: $9.23 | Ticket promedio: $18.99
Mas vendidos:
  Limonada             4
  Papas fritas         4
  Hamburguesa          2
  Quesadilla de pollo  2
  Tacos al pastor      2
  Tacos de camaron     2
Inventario al cierre:
  tortilla  20 ->  4
  pan        3 ->  1  stock bajo
  carne      6 ->  2  stock bajo
  pollo      4 ->  2  stock bajo
  camaron    2 ->  0  AGOTADO
  queso      5 ->  1  stock bajo
  papas      6 ->  2  stock bajo
  salsa      8 ->  4
```
