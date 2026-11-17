# Intermedio 28: Mercado de skins

**Tematica:** videojuegos (mercado de skins)
**Alumna:** Dulce Morales

## Problema

Un mercado de skins de un shooter recibe publicaciones de venta y ordenes de compra. El desgaste (un numero de 0 a 1) define la condicion de cada skin. El programa:

- calcula el precio de referencia de cada skin con su historial de ventas;
- marca como no validas las publicaciones sospechosas:
  - muy caras;
  - de vendedores bloqueados;
  - con bloqueo de intercambio;
- empareja cada orden de compra con la publicacion valida mas barata;
- cobra la comision del mercado segun la rareza.

## Que hice

### Modelo

- Union types: `Rareza` y `Condicion`.
- `interface Publicacion` y `OrdenCompra`.
- `type Revision`: union discriminada (`valida: true` o `valida: false` con el motivo).
- `interface Venta`.

### Uso de `Record`, `Map` y `Set`

- **`Record<Rareza, number>`:** la comision por rareza (comun 5%, rara 8%, mitica 10%, legendaria 12%).
- **`Map`:** el historial de precios por skin y el total que recibe cada vendedor (con `reduce`).
- **`Set`:** los vendedores bloqueados y las publicaciones ya vendidas (para no vender dos veces la misma).

### Reglas de negocio

| Condicion | Desgaste |
|---|---|
| Recien fabricada | menor a 0.07 |
| Casi nueva | menor a 0.15 |
| Algo desgastada | menor a 0.38 |
| Bastante desgastada | menor a 0.45 |
| Deplorable | hasta 1 |

- **Precio de referencia:** el promedio del historial. Una publicacion que cuesta **mas de 50%** por encima es sospechosa.
- **Emparejar:** la publicacion debe ser de la misma skin, con condicion **igual o mejor** que la minima pedida, y precio menor o igual al maximo. Gana la mas barata; en empate, la de menor desgaste.
- **Pago al vendedor:** precio menos la comision.

### Casos probados

- **Limite de condicion:** la publicacion L3 tiene desgaste **0.07 exacto**, asi que ya no es "Recien fabricada" (el limite es menor a 0.07) y queda como "Casi nueva".
- **Limite de precio:** Rita paga **exactamente** su maximo de $299.
- **Diego** pide "Casi nueva" o mejor: L3 ($41) le gana a L1 ($48).
- **Sofia** se lleva L1, la unica "Recien fabricada". Despues **Pablo** ya no encuentra ninguna.
- **Rechazos:**
  - L5 tiene sobreprecio;
  - L7 es de un vendedor bloqueado;
  - L8 tiene bloqueo de intercambio;
  - L9 tiene un desgaste de 1.3.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/28-mercado-skins/index.ts
```

## Salida esperada

```text
==================== PUBLICACIONES ====================
OK L1 AK | Neon Tide ST     0.03 Recien fabricada    $  48
OK L2 AK | Neon Tide        0.21 Algo desgastada     $  36
OK L3 AK | Neon Tide        0.07 Casi nueva          $  41
OK L4 AWP | Dragon Ash      0.12 Casi nueva          $ 299
X  L5 AWP | Dragon Ash      0.05 Recien fabricada    $ 480  $480 es mas de 50% sobre la referencia ($307.5)
OK L6 Pistola | Coral       0.40 Bastante desgastada $ 3.9
X  L7 Cuchillo | Aurora ST  0.01 Recien fabricada    $ 860  vendedor bloqueado (scammer_99)
X  L8 Cuchillo | Aurora     0.09 Casi nueva          $ 870  bloqueo de intercambio por 3 dia(s)
X  L9 Pistola | Coral       1.30 ?                   $   2  desgaste 1.3 fuera de 0-1

==================== PRECIOS DE REFERENCIA ====================
AK | Neon Tide     $42 (promedio de 5 ventas)
AWP | Dragon Ash   $307.5 (promedio de 4 ventas)
Pistola | Coral    $3.88 (promedio de 4 ventas)
Cuchillo | Aurora  $876.67 (promedio de 3 ventas)

==================== VENTAS ====================
Diego  compra L3 AK | Neon Tide (Casi nueva) por $41.00 | comision 10% $4.10 | mara recibe $36.90
Sofia  compra L1 AK | Neon Tide (Recien fabricada) por $48.00 | comision 10% $4.80 | lucia_fps recibe $43.20
Rita   compra L4 AWP | Dragon Ash (Casi nueva) por $299.00 | comision 12% $35.88 | toni recibe $263.12
Leo    compra L6 Pistola | Coral (Bastante desgastada) por $3.90 | comision 5% $0.20 | kenji recibe $3.70
Pablo  sin compra (AK | Neon Tide, Recien fabricada, max $60): ninguna publicacion cumple condicion y precio
Vale   sin compra (Cuchillo | Aurora, Casi nueva, max $1000): ninguna publicacion cumple condicion y precio

Comisiones del mercado: $44.98 | pagos: mara $36.90, lucia_fps $43.20, toni $263.12, kenji $3.70
```
