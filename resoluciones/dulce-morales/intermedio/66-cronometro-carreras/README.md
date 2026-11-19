# Intermedio 66: Cronometro de vueltas

**Tematica:** carreras
**Alumna:** Dulce Morales

## Problema

Un cronometro de vueltas para una sesion de practica en pista. Recibe eventos con la **marca de tiempo exacta** (en milisegundos):

- arrancar;
- marcar vuelta;
- pausar por **bandera roja** y reanudar;
- invalidar la ultima vuelta (por salirse de la pista);
- detener.

Es una **maquina de estados** con un **reducer puro**. El tiempo en pausa no cuenta para la vuelta. Al final muestra los tiempos por vuelta, la mejor vuelta, la diferencia contra la mejor y la consistencia del piloto.

## Que hice

### Estado (union discriminada)

| Fase | Datos que guarda |
|---|---|
| en espera | nada |
| corriendo | cuando empezo la vuelta, cuanto tiempo en pausa lleva, vueltas |
| bandera roja | lo mismo, mas desde cuando esta en pausa |
| finalizado | vueltas |

### Eventos y reducer

`reducer(estado, evento)` devuelve el estado nuevo y un mensaje. No modifica nada: las vueltas son listas nuevas en cada paso.

- **VUELTA:** tiempo = marca actual - inicio de la vuelta - tiempo en pausa. Si dura menos de 1 minuto se ignora (en este circuito es imposible: es un doble toque del boton).
- **BANDERA_ROJA / REANUDAR:** al reanudar, la duracion de la pausa se suma a `pausadoMs`, para descontarla de la vuelta.
- **INVALIDAR_ULTIMA:** marca la ultima vuelta como invalida (no se borra: queda en la lista).
- **DETENER:** termina la sesion; la vuelta en curso se descarta.

Cada evento fuera de su fase devuelve un mensaje de error y deja el estado igual.

### Estadisticas (solo vueltas validas)

- **Mejor vuelta** y diferencia de cada vuelta contra ella.
- **Promedio.**
- **Consistencia:** la desviacion estandar de los tiempos. Mientras mas chica, mas parejo es el piloto.

### Casos probados

- **Antes de arrancar:** marcar vuelta da error.
- **Doble toque:** una "vuelta" de 0.49 s se ignora.
- **Invalida:** la vuelta 3 se invalida por limites de pista. Era rapida, pero no cuenta para la mejor vuelta ni para el promedio. Invalidarla dos veces da error.
- **Bandera roja:** con bandera roja no se marcan vueltas. La pausa de 4:30 **no cuenta**: la vuelta 4 marca 1:31.500.
- **Final:** despues de detener, reanudar da error.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/66-cronometro-carreras/index.ts
```

## Salida esperada

```text
==================== SESION DE PRACTICA ====================
[ 0:05.000] VUELTA           X no se marca vuelta en "en espera"
[ 0:00.000] ARRANCAR         sesion iniciada
[ 1:32.410] VUELTA           vuelta 1: 1:32.410
[ 1:32.900] VUELTA           X vuelta de 0:00.490: demasiado corta, se ignora (doble toque)
[ 3:03.120] VUELTA           vuelta 2: 1:30.710
[ 4:33.300] VUELTA           vuelta 3: 1:30.180
[        -] INVALIDAR_ULTIMA vuelta 3 invalidada (limites de pista)
[        -] INVALIDAR_ULTIMA X la vuelta 3 ya estaba invalidada
[ 5:10.000] BANDERA_ROJA     BANDERA ROJA: el reloj se detiene
[ 6:00.000] VUELTA           X no se marca vuelta en "bandera roja"
[ 9:40.000] REANUDAR         se reanuda (pausa de 4:30.000 que no cuenta)
[10:34.800] VUELTA           vuelta 4: 1:31.500
[12:04.500] VUELTA           vuelta 5: 1:29.700
[13:35.100] VUELTA           vuelta 6: 1:30.600
[14:10.000] DETENER          sesion finalizada con 6 vuelta(s); la vuelta en curso se descarta
[14:20.000] REANUDAR         X no hay bandera roja que levantar

==================== VUELTAS ====================
V1  1:32.410  +2.710
V2  1:30.710  +1.010
V3  1:30.180  INVALIDA
V4  1:31.500  +1.800
V5  1:29.700  MEJOR VUELTA
V6  1:30.600  +0.900

Mejor vuelta: V5 1:29.700 | promedio (validas) 1:30.984 | consistencia: +-0.913 s
```
