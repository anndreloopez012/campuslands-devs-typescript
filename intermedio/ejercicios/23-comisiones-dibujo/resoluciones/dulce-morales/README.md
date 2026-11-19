# Intermedio 23: Comisiones de dibujo

**Tematica:** dibujo e ilustracion
**Alumna:** Dulce Morales

## Problema

Una ilustradora recibe pedidos de dibujos por encargo (comisiones). El programa:

- cotiza cada pedido: tipo de dibujo, personajes extra, fondo, revisiones extra y uso comercial;
- rechaza lo que ella no acepta;
- organiza la cola de trabajo segun cuantos dias tarda cada dibujo;
- avisa cuales no llegan a la fecha que pidio el cliente;
- resume las ganancias.

## Que hice

### Modelo

- Union types: `TipoDibujo` (boceto, lineart, color plano, full render), `Fondo` (ninguno, simple, detallado) y `Estado`.
- `interface Comision`, `Cotizacion` y `Planificada`. En `Planificada`, `inicioDia` es `null` si la comision aun no entra a la cola.

### Uso de `Record`, `Map` y `Set`

- **`Record`** para todas las tablas de precios y tiempos: precio base, dias base y revisiones incluidas por tipo, y precio y dias por fondo. Tambien para sumar las ganancias por tipo.
- **`Map`** para agrupar las ganancias por cliente con `reduce`.
- **`Set`** para los temas que la ilustradora no acepta (`has` para revisar).

### Reglas de negocio

| Tipo | Precio | Dias | Revisiones incluidas |
|---|---|---|---|
| boceto | $25 | 1 | 1 |
| lineart | $45 | 2 | 2 |
| color plano | $80 | 3 | 2 |
| full render | $150 | 5 | 3 |

- **Personaje extra:** +60% del precio base y +1 dia cada uno.
- **Fondo:** simple +$20 y medio dia; detallado +$60 y 2 dias.
- **Revision extra:** $15 cada una.
- **Uso comercial:** +100% del precio base.
- **Anticipo:** 50%. Solo las comisiones con anticipo pagado entran a la cola.
- **Cola:** primero la fecha limite mas cercana. Se trabaja una tras otra.
- **Rechazo:** temas no aceptados, mas de 5 personajes o revisiones negativas.

### Casos probados

- **Normales:** Bruno, Andrea y Estudio Nube entregan a tiempo.
- **Limite:** la comision C04 se entrega el dia 8.5 y su fecha limite es **exactamente** 8.5, asi que llega a tiempo.
- **Atrasada:** Diego pide un full render con 4 personajes y fondo detallado en 12 dias. La cola lo entrega el dia 18.5 y el programa avisa del atraso.
- **Sin anticipo:** Carla queda cotizada pero fuera de la cola.
- **Rechazadas:** un tema no aceptado (gore), y otra con 8 personajes y revisiones negativas.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/23-comisiones-dibujo/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
====================== COLA DE COMISIONES ======================
1. C03 Bruno        boceto      3 pj, fondo ninguno   | dias    0 ->    3 (limite 4) a tiempo
     base $25.00 + extras $30.00 = $55.00 (anticipo $27.50 pagado)
2. C01 Andrea       color plano 1 pj, fondo simple    | dias    3 ->  6.5 (limite 7) a tiempo
     base $80.00 + extras $20.00 = $100.00 (anticipo $50.00 pagado)
3. C04 Andrea       lineart     1 pj, fondo ninguno   | dias  6.5 ->  8.5 (limite 8.5) a tiempo
     base $45.00 = $45.00 (anticipo $22.50 pagado)
4. C06 Diego        full render 4 pj, fondo detallado | dias  8.5 -> 18.5 (limite 12) ATRASADA 6.5 dia(s)
     base $150.00 + extras $330.00 + comercial $150.00 = $630.00 (anticipo $315.00 pagado)
5. C02 Estudio Nube full render 2 pj, fondo detallado | dias 18.5 -> 26.5 (limite 30) a tiempo
     base $150.00 + extras $150.00 + revisiones $15.00 + comercial $150.00 = $465.00 (anticipo $232.50 pagado)

--- Cotizadas sin anticipo (no entran a la cola) ---
C05 Carla: $170.00, necesita anticipo de $85.00

--- Rechazadas ---
C07 Eva: no acepta el tema "gore"
C08 Fede: personajes: 8 (1-5); revisiones invalidas

--- Ganancias confirmadas ---
Diego         $630.00
Estudio Nube  $465.00
Andrea        $145.00
Bruno         $55.00
Por tipo: boceto $55.00 | lineart $45.00 | color plano $100.00 | full render $1095.00
Total $1295.00 | anticipos cobrados $647.50 | 1 comision(es) no llegan a la fecha
```
