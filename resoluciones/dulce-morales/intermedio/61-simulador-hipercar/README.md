# Intermedio 61: Simulador de aceleracion hypercar

**Tematica:** autos hiperdeportivos
**Alumna:** Dulce Morales

## Problema

Simular una prueba de aceleracion con una **maquina de estados**. El auto pasa por:

**detenido -> launch armado -> acelerando -> (cambiando de marcha) -> frenando -> detenido**

- Cada accion (armar el launch control, soltar el freno, avanzar el tiempo, frenar) entra a un **reducer puro** que devuelve el estado nuevo.
- Las acciones que no tienen sentido en el estado actual se **rechazan** y se registran.
- Se miden los tiempos de 0-100, 0-200 y 0-300 km/h desde que se suelta el freno.

## Que hice

### Estado: union discriminada

`type Estado` tiene una variante por `fase`, y cada una guarda **solo** los datos que tienen sentido:

- "detenido" y "launch armado": solo el tiempo;
- "acelerando": velocidad y marcha;
- "cambiando": ademas, cuanto falta para terminar el cambio;
- "frenando": la velocidad.

Asi es imposible, por ejemplo, tener una marcha mientras el auto esta detenido.

### Acciones y reducer

- `type Accion`: `ARMAR_LAUNCH`, `SOLTAR_FRENO`, `TICK` (con `dt`) y `FRENAR`.
- `reducer(auto, registro, accion)` es una **funcion pura**: no modifica nada, siempre devuelve un objeto nuevo con *spread* (`...`). Usa un `switch` por tipo de accion y, dentro de `TICK`, otro `switch` por fase.

### Transiciones permitidas

| Accion | Solo desde | Pasa a |
|---|---|---|
| ARMAR_LAUNCH | detenido | launch armado |
| SOLTAR_FRENO | launch armado | acelerando (marcha 1) |
| TICK | acelerando | sube la velocidad; al llegar al punto de cambio pasa a "cambiando" |
| TICK | cambiando | cuando termina el cambio, vuelve a acelerando con la siguiente marcha |
| TICK | frenando | baja 45 km/h por segundo; al llegar a 0 queda detenido |
| FRENAR | acelerando o cambiando | frenando |

### Fisica simplificada

- Cada marcha tiene una aceleracion maxima. La aceleracion baja a medida que el auto se acerca a su velocidad maxima.
- Durante un cambio de marcha el auto **no acelera**.
- Un auto electrico con cambio instantaneo (0 s) pasa directo a la siguiente marcha.

### Casos probados

- **Acciones rechazadas:**
  - soltar el freno sin haber armado el launch;
  - armar el launch dos veces;
  - frenar estando detenido.
- **Tres autos:**
  - el Rimac Nevera (electrico, sin perdida en el cambio) es el mas rapido;
  - el Bugatti Chiron pierde 0.1 s en cada uno de sus 7 cambios;
  - el deportivo comun no llega a 200 en 15 s.
- **Correccion que hice:** al principio los tiempos se contaban desde el inicio de la prueba e incluian 0.5 s de espera. Ahora se miden desde que se suelta el freno (`salida`).

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/61-simulador-hipercar/index.ts
```

## Salida esperada

```text
================ Rimac Nevera ================
  t=0s detenido -> launch armado
  t=0.5s launch armado -> acelerando a 0 km/h (marcha 1)
  t=4.3s acelerando -> acelerando a 183 km/h (marcha 2)
  t=15.5s acelerando -> frenando a 357 km/h
  t=23.5s frenando -> detenido
  X t=0s SOLTAR_FRENO en "detenido": primero hay que armar el launch control
  X t=0.5s ARMAR_LAUNCH en "launch armado": solo se arma con el auto detenido
  X t=27.5s FRENAR en "detenido": el auto no esta en movimiento
  0-100: 1.9 s | 0-200: 4.5 s | 0-300: 9.8 s

================ Bugatti Chiron ================
  t=0s detenido -> launch armado
  t=0.5s launch armado -> acelerando a 0 km/h (marcha 1)
  t=2.3s acelerando -> cambiando a 82 km/h (marcha 1)
  t=2.4s cambiando -> acelerando a 82 km/h (marcha 2)
  t=4s acelerando -> cambiando a 133 km/h (marcha 2)
  t=4.1s cambiando -> acelerando a 133 km/h (marcha 3)
  t=6.3s acelerando -> cambiando a 181 km/h (marcha 3)
  t=6.4s cambiando -> acelerando a 181 km/h (marcha 4)
  t=9.8s acelerando -> cambiando a 230 km/h (marcha 4)
  t=9.9s cambiando -> acelerando a 230 km/h (marcha 5)
  t=15.5s acelerando -> frenando a 280 km/h
  t=21.8s frenando -> detenido
  X t=0s SOLTAR_FRENO en "detenido": primero hay que armar el launch control
  X t=0.5s ARMAR_LAUNCH en "launch armado": solo se arma con el auto detenido
  X t=27.5s FRENAR en "detenido": el auto no esta en movimiento
  0-100: 2.5 s | 0-200: 7.2 s | 0-300: no llega en 15 s

================ Deportivo comun ================
  t=0s detenido -> launch armado
  t=0.5s launch armado -> acelerando a 0 km/h (marcha 1)
  t=3.3s acelerando -> cambiando a 55 km/h (marcha 1)
  t=3.6s cambiando -> acelerando a 55 km/h (marcha 2)
  t=7.4s acelerando -> cambiando a 96 km/h (marcha 2)
  t=7.7s cambiando -> acelerando a 96 km/h (marcha 3)
  t=14.8s acelerando -> cambiando a 135 km/h (marcha 3)
  t=15.1s cambiando -> acelerando a 135 km/h (marcha 4)
  t=15.5s acelerando -> frenando a 137 km/h
  t=18.6s frenando -> detenido
  X t=0s SOLTAR_FRENO en "detenido": primero hay que armar el launch control
  X t=0.5s ARMAR_LAUNCH en "launch armado": solo se arma con el auto detenido
  X t=27.5s FRENAR en "detenido": el auto no esta en movimiento
  0-100: 7.9 s | 0-200: no llega en 15 s | 0-300: no llega en 15 s

================ COMPARATIVA 0-200 km/h ================
1. Rimac Nevera     4.5 s
2. Bugatti Chiron   7.2 s
```
