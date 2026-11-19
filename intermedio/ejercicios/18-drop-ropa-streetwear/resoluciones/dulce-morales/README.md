# Intermedio 18: Drop de ropa streetwear

**Tematica:** ropa
**Alumna:** Dulce Morales

## Problema

Una marca lanza un "drop": pocas unidades por talla que salen a la venta a una hora exacta. Llegan muchas solicitudes de compra. El programa las atiende **en orden de llegada** y respeta estas reglas:

- acceso anticipado solo para miembros;
- 1 unidad por producto por cliente;
- deteccion de bots;
- stock por talla.

Al final muestra un reporte de ventas.

## Que hice

### Modelo (objetos anidados)

- `interface Producto` con su `stock` por talla (`Record<Talla, number>`) y una `colaboracion` anidada opcional (artista y edicion, o `null`).
- `interface Cliente` con su `Nivel` (miembro o general) e `interface Solicitud` (segundo, cliente, producto y talla).
- `type Atencion`: union discriminada por `estado`. Una venta tiene precio; un rechazo tiene `motivo` y `detalle`.
- `type MotivoRechazo`: union con los 5 motivos posibles.

### Reglas de negocio

| Regla | Detalle |
|---|---|
| Apertura | Miembros desde las **09:55:00**, publico general desde las **10:00:00** en punto |
| Limite | 1 unidad por producto por cliente |
| Bots | 3 o mas solicitudes del mismo cliente en 2 segundos: se rechazan **todas** sus solicitudes |
| Stock | Por talla; cada venta crea un stock **nuevo** sin modificar el anterior |
| Precio | Los miembros tienen 5% de descuento |

### Como use arrays tipados

- `sort`: ordenar las solicitudes por segundo de llegada (sobre una copia) y los tiempos de cada cliente para detectar bots.
- `filter` y `some`: contar solicitudes dentro de la ventana de 2 segundos y separar las ventas. Para las ventas uso un type guard con `Extract`.
- `map` y `Object.fromEntries`: copiar el stock inicial y armar el reporte por talla.
- `reduce`: unidades por producto e ingresos.

### Casos probados

- **Acceso anticipado:** Nico y Leo (miembros) compran antes de las 10:00. Sara (general) intenta a las 09:59 y se rechaza.
- **Limite de hora:** Mia compra a las **10:00:00 exactas** y si puede.
- **Ultima unidad:**
  - Leo se lleva la unica hoodie S, y Sara despues la encuentra agotada.
  - Ivan se lleva la ultima chaqueta L, y la chaqueta se agota al 100%.
- **Bot:** Bot_9x manda 3 solicitudes en 2 segundos y se rechazan las 3.
- **Ya compro:** Nico intenta una segunda chaqueta.
- **Talla sin stock:** la chaqueta XL nunca tuvo unidades.
- **Invalido:** un cliente que no esta registrado.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/18-drop-ropa-streetwear/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
===================== DROP STREETWEAR =====================
09:58:00 Nico    Jacket Night Shift  M  VENDIDO  $247.00
09:59:00 Sara    Hoodie Neon Static  S  X antes de tiempo: abre a las 10:00:00 para general
09:59:30 Leo     Hoodie Neon Static  S  VENDIDO  $114.00
10:00:00 Sara    Hoodie Neon Static  S  X agotado: talla S sin unidades
10:00:00 Mia     Hoodie Neon Static  M  VENDIDO  $120.00
10:00:01 Bot_9x  Tee Concrete Logo   M  X bot: 3+ solicitudes en 2 s
10:00:01 Bot_9x  Hoodie Neon Static  L  X bot: 3+ solicitudes en 2 s
10:00:02 Bot_9x  Jacket Night Shift  L  X bot: 3+ solicitudes en 2 s
10:00:03 Nico    Jacket Night Shift  L  X ya compro: maximo 1 unidad por producto
10:00:05 Ivan    Jacket Night Shift  L  VENDIDO  $260.00
10:00:08 Sara    Tee Concrete Logo   S  VENDIDO  $45.00
10:00:09 Mia     Jacket Night Shift  XL X agotado: talla XL sin unidades
10:00:12 C9      Tee Concrete Logo   M  X datos invalidos: cliente C9 no registrado

--- Reporte por producto ---
Hoodie Neon Static x Kroma     vendidas 2/6 (33%) | quedan S:0 M:1 L:2 XL:1
Tee Concrete Logo              vendidas 1/10 (10%) | quedan S:1 M:3 L:3 XL:2
Jacket Night Shift x Vera Moss vendidas 2/2 (100%) | quedan S:0 M:0 L:0 XL:0

Ventas: 5 | Ingresos: $786.00
Rechazos: antes de tiempo (1), agotado (2), bot (3), ya compro (1), datos invalidos (1)
```
