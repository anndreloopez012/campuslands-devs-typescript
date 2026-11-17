# Intermedio 48: Render farm 3D

**Tematica:** animacion y render 3D
**Alumna:** Dulce Morales

## Problema

Una granja de render tiene 3 nodos (2 GPU y 1 CPU) y recibe trabajos durante la noche. Cada trabajo tiene prioridad, frames, minutos por frame (en GPU es mas rapido) y una hora limite. Un planificador:

- asigna trabajos a los nodos libres, primero por prioridad y luego por la hora limite mas cercana;
- si un nodo falla a mitad de un trabajo, ese trabajo vuelve a la cola.

Al final muestra a que hora termino cada trabajo, si cumplio su hora limite y que tan ocupado estuvo cada nodo.

## Que hice

### Cola de prioridad generica

`ColaPrioridad<T>` recibe una funcion de comparacion y mantiene ordenada una lista **privada**:

- `agregar()` y `sacar()`;
- `sacarPrimero(condicion)`: saca el primero, en orden de prioridad, que cumpla una condicion. Sirve para saltar trabajos que conviene mandar a otro nodo.

### Clase `RenderFarm`

- Los nodos, los trabajos, las fallas y la bitacora son **privados**.
- `simular(hasta)` avanza minuto a minuto: llegan trabajos, ocurren fallas, terminan trabajos y se asignan nuevos.
- `mejorTerminarAqui()` (**privado**): decide si un trabajo conviene en este nodo.

### Estados

`en cola` -> `renderizando` -> `terminado`. Si el nodo falla mientras renderiza, el trabajo vuelve a `en cola`, se cuenta un reintento y el nodo queda fuera hasta que lo reparen.

### Fechas

La simulacion trabaja en minutos desde las 20:00 del 16/11/2026. Para mostrar las horas, cada minuto se convierte a `Date`. Por eso un trabajo que termina despues de medianoche se ve como 00:00 o 03:45.

### Reglas para asignar

1. Orden de la cola: urgente, normal, baja; luego la hora limite mas cercana; luego el que llego primero.
2. Un nodo libre toma el primer trabajo de la cola que **conviene en ese nodo**:
   - es donde terminaria **antes**, comparado con esperar a que se libere otro nodo; o
   - el trabajo **no es urgente** y en ese nodo igual termina antes de su hora limite (asi el CPU no queda ocioso).

### Ajustes que hice al probar

- **Primera version:** el trabajo urgente CM-05 se mandaba al CPU (300 min) en vez de esperar media hora por una GPU (120 min), y terminaba muy tarde.
- **Segunda version:** cada trabajo esperaba siempre el nodo mas rapido, y el CPU quedaba casi sin uso.
- **Version final:** combina las dos reglas de arriba.

### Casos probados

- **Limite:** CM-06 termina a las **23:50 exactas**, su hora limite, asi que "cumple justo en el limite".
- **Falla:** gpu-02 falla a las 21:40 con CM-05 adentro. El trabajo vuelve a la cola, lo toma gpu-01 a las 22:00 y termina atrasado 60 min por culpa de la falla.
- **Sin nodo ocioso:** SH030 (baja prioridad y con margen hasta las 06:00) usa el CPU aunque sea mas lento, y cumple.
- **Uso de nodos:** el porcentaje de tiempo ocupado de cada nodo.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/48-render-farm/index.ts
```

## Salida esperada

```text
================ BITACORA DE LA NOCHE (desde 20:00) ================
20:00 "SH010" (normal) empieza en gpu-01 [GPU], 120 min
20:00 "SH020" (normal) empieza en gpu-02 [GPU], 90 min
20:05 "TEST" (baja) empieza en cpu-01 [CPU], 60 min
21:05 "SH030" (baja) empieza en cpu-01 [CPU], 400 min
21:30 "CM-05" (urgente) empieza en gpu-02 [GPU], 120 min
21:40 FALLA en gpu-02: "CM-05" vuelve a la cola
22:00 "CM-05" (urgente) empieza en gpu-01 [GPU], 120 min
22:10 "CM-06" (urgente) empieza en gpu-02 [GPU], 100 min

================ TRABAJOS ================
TEST   baja     30 frames | 20:05 -> 21:05 (limite 22:00) cumple
SH020  normal   90 frames | 20:00 -> 21:30 (limite 02:00) cumple
SH010  normal   120 frames | 20:00 -> 22:00 (limite 01:00) cumple
CM-06  urgente  50 frames | 22:10 -> 23:50 (limite 23:50) cumple justo en el limite
CM-05  urgente  60 frames | 21:30 -> 00:00 (limite 23:00) ATRASADO 60 min | 1 reintento(s)
SH030  baja     200 frames | 21:05 -> 03:45 (limite 06:00) cumple

================ USO DE NODOS ================
gpu-01 [GPU] 240 min de 465 -> 52% ocupado
gpu-02 [GPU] 200 min de 465 -> 43% ocupado
cpu-01 [CPU] 460 min de 465 -> 99% ocupado
```
