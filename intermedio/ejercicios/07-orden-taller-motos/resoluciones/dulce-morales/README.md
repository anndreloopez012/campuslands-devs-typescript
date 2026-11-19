# Intermedio 07: Ordenes de taller de motos

**Tematica:** motos y mecanica de motos
**Alumna:** Dulce Morales

## Problema

Un taller recibe ordenes de trabajo. Cada orden tiene servicios (horas de mano de obra) y repuestos que deben estar en bodega. El programa valida el stock, calcula el total a cobrar, mueve las ordenes por sus estados sin saltarse pasos y revisa la carga de cada mecanico.

## Que hice

### Modelo

- Union types: `EstadoOrden` (recibida, esperando repuesto, en reparacion, lista, entregada) y `TipoCliente` (particular, frecuente, flota).
- Interfaces `Repuesto`, `LineaRepuesto`, `Servicio`, `Orden` y `Cotizacion`, todo `readonly`.
- `type Bodega = ReadonlyMap<string, number>`: stock por codigo de repuesto.
- `Resultado<T>`: union discriminada para operaciones que pueden fallar.
- `TRANSICIONES: Record<EstadoOrden, EstadoOrden[]>`: de que estado se puede pasar a cual.

### Reglas de negocio

- **Mano de obra:** $25 por hora.
- **Descuento** segun cliente (particular 0%, frecuente 10%, flota 15%). **Solo aplica a la mano de obra**, no a los repuestos.
- **Impuesto:** 12% sobre el subtotal.
- **Stock:** las ordenes se atienden por orden de llegada. Si hay repuestos, se apartan y la orden pasa a "en reparacion". Si faltan, la orden queda en "esperando repuesto".
- **Estados:** no se puede saltar pasos (por ejemplo, de "en reparacion" directo a "entregada").
- **Carga:** un mecanico no deberia pasar de 8 horas en reparacion. Si pasa, se marca como sobrecargado.

### Funciones separadas

- **Validar:** `validarOrden`, `faltantes`.
- **Transformar sin mutar:** `cambiarEstado` devuelve una orden nueva. `apartarRepuestos` devuelve una bodega **nueva** (al final se compara la bodega inicial con la del cierre).
- **Calcular (puras):** `horasDeOrden`, `cotizar`, `cargaPorMecanico`.
- **Procesar:** `procesarDia` aplica todo en orden.
- **Mostrar:** `dinero` y `main`.

### Casos probados

| Orden | Caso | Resultado |
|---|---|---|
| OT-101 | Normal | En reparacion, $92.40 |
| OT-102 | Cliente flota (15% en mano de obra) | En reparacion, aparta las 2 ultimas pastillas |
| OT-103 | Repuesto agotado (kit de cadena) | Esperando repuesto |
| OT-104 | Limite: pide 2 pastillas, pero OT-102 ya se llevo las ultimas | Esperando repuesto |
| OT-105 | Invalida: horas negativas y repuesto inexistente | Rechazada |
| OT-106 | Raul suma 10 horas | Raul queda sobrecargado |

Ademas se prueba el flujo de estados: saltar de "en reparacion" a "entregada" se rechaza, y el camino correcto (en reparacion, lista, entregada) funciona.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/07-orden-taller-motos/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
================= ORDENES DEL DIA =================

OT-101 | Andrea Lopez (particular) | Yamaha MT-07 | mecanico: Raul
  Estado: en reparacion
  Mano de obra $37.50 + repuestos $45.00 - descuento $0.00 + impuesto $9.90 = $92.40

OT-102 | Mensajeria Veloz (flota) | Honda CB190R | mecanico: Raul
  Estado: en reparacion
  Mano de obra $87.50 + repuestos $91.00 - descuento $13.13 + impuesto $19.85 = $185.22

OT-103 | Pablo Ruiz (frecuente) | KTM Duke 390 | mecanico: Sofia
  Estado: esperando repuesto
  Mano de obra $50.00 + repuestos $120.00 - descuento $5.00 + impuesto $19.80 = $184.80
  ! falta R-CAD (pide 1, hay 0)

OT-104 | Marta Gil (particular) | Suzuki GSX-S750 | mecanico: Sofia
  Estado: esperando repuesto
  Mano de obra $37.50 + repuestos $76.00 - descuento $0.00 + impuesto $13.62 = $127.12
  ! falta R-PAS (pide 2, hay 0)

OT-105 | Error (particular) | ? | mecanico: Raul
  Estado: recibida
  ! rechazada: "Servicio mal capturado" tiene -2 horas
  ! rechazada: repuesto R-XXX no existe en el catalogo

OT-106 | Mensajeria Veloz (flota) | Bajaj Pulsar NS200 | mecanico: Raul
  Estado: en reparacion
  Mano de obra $125.00 + repuestos $51.00 - descuento $18.75 + impuesto $18.87 = $176.12

================= CARGA DE MECANICOS =================
Raul   10 h  << sobrecargado (max 8 h)
Sofia  0 h

================= BODEGA AL CIERRE =================
R-ACE  10 ->  4
R-FIL   3 ->  2
R-PAS   2 ->  0  (agotado)
R-CAD   0 ->  0  (agotado)
R-BUJ   4 ->  2

================= FLUJO DE ESTADOS =================
X OT-101: no puede pasar de "en reparacion" a "entregada"
OK OT-101: en reparacion -> lista -> entregada

Ingreso esperado de ordenes en reparacion: $453.74
```
