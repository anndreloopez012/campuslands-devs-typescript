# Intermedio 44: Rutas turisticas inteligentes

**Tematica:** turismo
**Alumna:** Dulce Morales

## Problema

Un turista tiene un dia libre en la ciudad y una lista de lugares que quiere visitar. Cada lugar tiene horario, tiempo de visita y prioridad (1 a 3, donde 3 es imperdible). Un planificador arma la ruta caminando desde el hotel:

- en cada paso elige el lugar que mas conviene;
- espera si llega antes de que abra;
- descarta los lugares que cierran antes de poder terminar la visita;
- mete una pausa para almorzar;
- vuelve al hotel antes de la hora limite.

## Que hice

### Tipos

- Literal types: `Categoria` y `Prioridad` (`1 | 2 | 3`).
- `interface Lugar`, con su ubicacion (`Punto` en km) y horario en minutos desde medianoche.
- `type Paso`: union discriminada (visita, almuerzo o regreso). Se recorre con un `switch` y se filtran las visitas con un type guard en linea.

### Clase `PlanificadorRuta` (encapsulamiento)

- Los lugares pendientes y los descartados son `Map` **privados**.
- `factible()` (**privado**): revisa si se puede terminar la visita antes del cierre y aun volver al hotel a tiempo. Devuelve el motivo si no se puede.
- `puntaje()` (**privado**): decide cual conviene visitar primero.
- `planear()`: arma la ruta paso a paso y devuelve los pasos y los lugares descartados con su motivo.

### Fechas

Los calculos se hacen en minutos y se convierten a `Date` (15 de julio de 2026) para mostrar las horas con `getHours()` y `getMinutes()`.

### Reglas

- **Caminata:** 4 km/h; la distancia es en linea recta entre coordenadas.
- **Puntaje:** prioridad^2 x 100 / (minutos de traslado + espera + 10), mas un bonus de urgencia si el lugar cierra en menos de 3 horas.
- **Almuerzo:** 1 hora, la primera vez que se esta libre desde las 12:30.
- **Regreso:** al hotel antes de las 19:00.

### Ajuste que hice al probar

Con un puntaje que solo miraba prioridad y distancia, la ruta terminaba a las 16:06 y dejaba fuera lugares cercanos que cerraban temprano. Al agregar urgencia sin balancearla, se perdian dos imperdibles. Con prioridad al cuadrado y una urgencia moderada, la ruta visita los **3 imperdibles** y ademas la Catedral, que cierra a las 12:00.

### Casos probados

- **Espera:** si se llega antes de la apertura, la visita empieza cuando abre (el planificador lo indica).
- **Imposible:** la Feria de Flores cierra a las 9:00 y no da tiempo desde el hotel.
- **No alcanza:** el Mercado Central, el Parque Botanico y el Museo de Ciencias quedan fuera por su horario de cierre. Cada descarte tiene su motivo.
- **Resumen:** lugares visitados, km caminados e imperdibles vistos.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/44-rutas-turisticas/index.ts
```

## Salida esperada

```text
================ RUTA DEL DIA (sale del hotel 09:00, vuelve antes de 19:00) ================
09:05-09:45 Catedral           **  camina 0.36 km, llega 09:05
09:59-11:29 Museo del Oro      *** camina 0.94 km, llega 09:59
11:40-13:40 Museo de Arte      *** camina 0.73 km, llega 11:40
13:40-14:40 Almuerzo
15:13-15:58 Mirador del Cerro  *** camina 2.19 km, llega 15:13
16:50       Regreso al hotel (3.44 km)

Visitados: 4 de 8 | caminado: 7.66 km | imperdibles vistos: 3 de 3
No entraron:
  - Mercado Central: cierra a las 14:00 y no da tiempo de terminar la visita
  - Parque Botanico: cierra a las 17:00 y no da tiempo de terminar la visita
  - Feria de Flores: cierra a las 09:00 y no da tiempo de terminar la visita
  - Museo de Ciencias: cierra a las 16:00 y no da tiempo de terminar la visita
```
