# Intermedio 34: Subasta de autos de lujo

**Tematica:** autos de lujo
**Alumna:** Dulce Morales

## Problema

Una casa de subastas vende autos de lujo en lotes. Cada lote sigue estas reglas:

- cada puja debe superar a la anterior por un **incremento minimo**, que depende del precio;
- solo pueden pujar postores **verificados** y dentro de su credito;
- si alguien puja en el **ultimo minuto**, la subasta se alarga 2 minutos (*anti-sniping*);
- al cerrar, el auto se vende solo si se alcanzo el **precio de reserva**, y el comprador paga 10% de comision.

## Que hice

### Clases

- **`Lote`:**
  - el precio de reserva, la hora de cierre y el estado son **privados**;
  - el constructor valida que la reserva no sea menor que el precio de salida;
  - `pujar()` evalua la puja con un metodo privado `evaluar()` y, si corresponde, extiende el cierre;
  - getters `precioActual`, `ganador` y `cierre`;
  - `cerrar()` decide si se vende o no.
- **`Historial<T>`:** clase **generica** de solo agregar, que guarda todas las respuestas a las pujas.

### Tipos y type guards

- `type EstadoLote`: literal type ("abierto" | "vendido" | "sin vender").
- `type Respuesta`: union discriminada (puja aceptada, con `extendio`, o rechazada, con `motivo`).
- **Type guard** `esAceptada`: se usa para encontrar la ultima puja aceptada y para mostrar el resultado.

### Reglas

| Precio actual | Incremento minimo |
|---|---|
| menos de $100,000 | $2,000 |
| menos de $500,000 | $5,000 |
| $500,000 o mas | $10,000 |

Se rechaza una puja si:

- el lote ya cerro o la puja llego tarde;
- el postor no existe o no esta verificado;
- supera su credito;
- ese postor ya va ganando;
- no alcanza el minimo.

### Casos probados

- **Lote 1 (Ferrari F40):**
  - limite: la puja de $305,000 es **exactamente** el incremento minimo y se acepta; antes, una de $302,000 se rechazo;
  - pujas rechazadas por postor no verificado, por "ya va ganando" y por superar el credito;
  - dos pujas en el ultimo minuto extienden el cierre (600 s, luego 720 s, luego 840 s), y una puja en el segundo 900 llega tarde.
- **Lote 2 (Countach):** la mejor puja no alcanza la reserva, asi que queda sin vender.
- **Lote 3 (Porsche 959):** limite: la ultima puja es **exactamente** la reserva, asi que se vende.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/34-subasta-autos-lujo/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
Validacion: lote 99: la reserva no puede ser menor que la salida

========== Lote 1: Ferrari F40 1990 (18,000 km) | salida $300,000 ==========
   30s Marco    $300,000  OK
   90s Ines     $302,000  X minimo $305,000
   95s Ines     $305,000  OK
  200s Hugo     $350,000  X Hugo no esta verificado
  300s Marco    $400,000  OK
  320s Marco    $410,000  X Marco ya va ganando
  580s Ines     $420,000  OK  (puja en el ultimo minuto: cierre extendido a 720s)
  650s Marco    $470,000  X supera el credito de Marco
  700s Lena     $440,000  OK  (puja en el ultimo minuto: cierre extendido a 840s)
  900s Ines     $460,000  X llego en el segundo 900, cerro en el 840
  VENDIDO a Lena por $440,000 + comision $44,000 = $484,000

========== Lote 2: Lamborghini Countach 1988 (32,000 km) | salida $250,000 ==========
   60s Marco    $250,000  OK
  240s Lena     $300,000  OK
  400s Marco    $350,000  OK
  SIN VENDER: la mejor puja ($350,000 de Marco) no alcanzo la reserva

========== Lote 3: Porsche 959 1987 (25,000 km) | salida $600,000 ==========
  100s Lena     $600,000  OK
  200s Ines     $700,000  OK
  300s Lena     $800,000  OK
  VENDIDO a Lena por $800,000 + comision $80,000 = $880,000

Total cobrado a compradores: $1,364,000
```
