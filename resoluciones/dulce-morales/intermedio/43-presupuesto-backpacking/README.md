# Intermedio 43: Presupuesto backpacking

**Tematica:** viajes de mochilero
**Alumna:** Dulce Morales

## Problema

Una mochilera recorre cuatro paises con un presupuesto total de $900. Cada pais tiene su moneda y un presupuesto diario. Ella registra los gastos en moneda local, y un servicio:

- valida cada gasto: fecha dentro del viaje, moneda correcta y monto positivo;
- lo convierte a dolares;
- arma reportes: dias que se paso del presupuesto, gasto por pais y por categoria;
- calcula cuanto puede gastar por dia en lo que queda del viaje.

## Que hice

### Servicio `PresupuestoService` (encapsulamiento)

- Los tramos del viaje, el presupuesto total y la lista de gastos son **privados**.
- `registrar()`: valida, busca el tramo de esa fecha (con el metodo **privado** `tramoDe`), convierte a USD y guarda.
- `totalGastado()` y `porCategoria()`: sumas con `reduce` y un `Record<Categoria, number>`.
- `dias()`: agrupa el gasto de cada dia en un `Map`.
- `porPais()`: gastado contra presupuesto de cada tramo.
- `proyeccion(hoy)`: cuanto queda y cuanto se puede gastar por dia hasta el final.

### Fechas

- Cada tramo tiene `desde` y `hasta` (los dos dias incluidos) como `Date`.
- Un gasto pertenece al tramo si su fecha esta entre esos dos dias.
- Los dias de cada tramo y los dias restantes se calculan con milisegundos (`getTime()` / 86,400,000).

### Reglas

| Pais | Moneda | 1 USD = | Presupuesto diario |
|---|---|---|---|
| Peru | PEN | 3.75 | $45 |
| Bolivia | BOB | 6.9 | $35 |
| Chile | CLP | 940 | $60 |
| Argentina | ARS | 1000 | $50 |

- En cada pais se acepta su moneda o dolares, nada mas.
- Un dia esta **excedido** si se gasto mas que su presupuesto. Gastar exactamente el presupuesto queda "justo en el limite".

### Casos probados

- **Limite diario:** el 03/03 el tren cuesta 168.75 PEN = **$45.00 exactos**, el presupuesto del dia, asi que queda "justo en el limite".
- **Limite de fecha:** el bus del 05/03 es el **ultimo dia** del tramo de Peru y se acepta.
- **Excedidos:** el 02/03 por Machu Picchu, el 07/03 por el tour al salar y el 11/03 en Chile.
- **Pago en dolares:** la entrada a Machu Picchu se paga en USD dentro de Peru y se acepta.
- **Invalidos:** soles en Chile, una fecha fuera del viaje y un monto de 0.
- **Proyeccion:** al 12/03 quedan $535.67 para 7 dias, o sea $76.52 por dia.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/43-presupuesto-backpacking/index.ts
```

## Salida esperada

```text
==================== REGISTRO DE GASTOS ====================
OK 01/03 Peru      Hostal en Cusco (2 noches)     120 PEN = $32.00
OK 01/03 Peru      Menu del dia                    45 PEN = $12.00
OK 02/03 Peru      Entrada a Machu Picchu          70 USD = $70.00
OK 02/03 Peru      Cena                            30 PEN = $8.00
OK 03/03 Peru      Tren                        168.75 PEN = $45.00
OK 05/03 Peru      Bus a La Paz                    90 PEN = $24.00
OK 06/03 Bolivia   Hostal La Paz                  140 BOB = $20.29
OK 07/03 Bolivia   Tour Salar de Uyuni            350 BOB = $50.72
OK 08/03 Bolivia   Comidas del tour                60 BOB = $8.70
OK 10/03 Chile     Hostal en San Pedro          28000 CLP = $29.79
OK 11/03 Chile     Geiseres del Tatio           45000 CLP = $47.87
OK 11/03 Chile     Almuerzo y cena              15000 CLP = $15.96
X  12/03 Soles en Chile                        -> en Chile se paga en CLP o USD, no en PEN
X  25/03 Fuera del viaje                       -> el 25/03 no esta dentro del viaje
X  12/03 Monto cero                            -> el monto debe ser mayor que 0

==================== DIAS SOBRE PRESUPUESTO ====================
01/03 Peru      $ 44.00 de $45 -> ok
02/03 Peru      $ 78.00 de $45 -> EXCEDIDO por $33.00
03/03 Peru      $ 45.00 de $45 -> justo en el limite
05/03 Peru      $ 24.00 de $45 -> ok
06/03 Bolivia   $ 20.29 de $35 -> ok
07/03 Bolivia   $ 50.72 de $35 -> EXCEDIDO por $15.72
08/03 Bolivia   $  8.70 de $35 -> ok
10/03 Chile     $ 29.79 de $60 -> ok
11/03 Chile     $ 63.83 de $60 -> EXCEDIDO por $3.83

==================== POR PAIS ====================
Peru      5 dias | gastado $ 191.00 de $225 | sobran $34.00
Bolivia   4 dias | gastado $  79.71 de $140 | sobran $60.29
Chile     4 dias | gastado $  93.62 de $240 | sobran $146.38
Argentina 5 dias | gastado $   0.00 de $250 | sobran $250.00

==================== POR CATEGORIA ====================
actividades  $ 168.59 (46%)
hospedaje    $  82.08 (23%)
transporte   $  69.00 (19%)
comida       $  44.66 (12%)
otros        $   0.00 (0%)

Al 12/03: gastado $364.33 de $900. Quedan $535.67 para 7 dias -> $76.52 por dia
```
