# Intermedio 65: Timer de rounds kickboxing

**Tematica:** kickboxing
**Alumna:** Dulce Morales

## Problema

El cronometro de una pelea de kickboxing es una **maquina de estados**:

**listo -> round 1 -> descanso -> round 2 -> descanso -> round 3 -> terminado**

- Se puede **pausar**, y al reanudar vuelve exactamente a donde estaba.
- Un **KO** termina la pelea antes.
- El reducer es **puro**: recibe el estado y un evento, y devuelve el estado nuevo junto con los **efectos** que la app debe ejecutar (sonar la campana, dar el aviso de 10 segundos). El reducer solo los describe, no los ejecuta.

## Que hice

### Estado (union discriminada)

- `listo`;
- `round`: numero de round y segundos restantes;
- `descanso`: despues de que round va y segundos restantes;
- `pausado`: guarda el estado `anterior` completo, para volver tal cual;
- `terminado`: con el motivo (decision o KO).

`EnCurso` es la union de `round | descanso`, y se reutiliza en `pausado` y en `avanzar()`.

### Eventos y efectos

- **Eventos:** `INICIAR`, `TICK` (con segundos), `PAUSAR`, `REANUDAR`, `KO` y `REINICIAR`.
- **Efectos:** `campana` (1 o 3 golpes), `aviso` y `error`. Separar los efectos del estado permite probar la logica sin sonidos ni temporizadores reales.

### Reducer

| Evento | Valido en | Resultado |
|---|---|---|
| INICIAR | listo | round 1 + campana |
| TICK | round o descanso | avanza el reloj; en listo, pausado o terminado no hace nada |
| PAUSAR | round o descanso | pausado |
| REANUDAR | pausado | vuelve al estado anterior |
| KO | round (aunque este pausado) | terminado + 3 campanas |
| REINICIAR | cualquiera | listo |

`avanzar()` maneja un `TICK` de cualquier tamano: si el tiempo alcanza para terminar una fase, pasa a la siguiente y sigue descontando. Asi un salto de 250 s cruza un round, un descanso y entra al siguiente round.

### Casos probados

- **Limite del aviso:** cuando quedan **exactamente** 0:10, se da el aviso de los ultimos 10 segundos.
- **Pausa:** un `TICK` de 30 s durante la pausa no cambia el reloj; al reanudar sigue en 0:10.
- **Salto grande:** un `TICK` de 250 s termina el round 2, pasa todo el descanso y deja el round 3 en 0:50.
- **Fin por decision:** al terminar el round 3 suenan 3 campanas.
- **KO:** se marca durante una pausa del round 2; despues `REANUDAR` da error porque la pelea ya termino.
- **Errores:** iniciar una pelea terminada; un `TICK` antes de iniciar no hace nada.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/65-timer-kickboxing/index.ts
```

## Salida esperada

```text
================ Pelea completa (3 rounds de 2:00, descansos de 1:00) ================
TICK +5s       -> LISTO
INICIAR        -> ROUND 1  2:00                 DING
TICK +100s     -> ROUND 1  0:20
TICK +10s      -> ROUND 1  0:10                 [aviso] ultimos 10 segundos del round 1
PAUSAR         -> PAUSA (ROUND 1  0:10)
TICK +30s      -> PAUSA (ROUND 1  0:10)
REANUDAR       -> ROUND 1  0:10
TICK +15s      -> DESCANSO  0:55                DING
TICK +55s      -> ROUND 2  2:00                 DING
TICK +250s     -> ROUND 3  0:50                 [aviso] ultimos 10 segundos del round 2 | DING | DING
TICK +200s     -> TERMINADO: fin de los 3 rounds: decision de los jueces  [aviso] ultimos 10 segundos del round 3 | DING DING DING
INICIAR        -> TERMINADO: fin de los 3 rounds: decision de los jueces  X no se puede iniciar en "terminado"

================ Pelea con KO ================
INICIAR        -> ROUND 1  2:00                 DING
TICK +120s     -> DESCANSO  1:00                [aviso] ultimos 10 segundos del round 1 | DING
TICK +60s      -> ROUND 2  2:00                 DING
TICK +45s      -> ROUND 2  1:15
PAUSAR         -> PAUSA (ROUND 2  1:15)
KO (Camila Torres) -> TERMINADO: KO de Camila Torres en el round 2  DING DING DING
REANUDAR       -> TERMINADO: KO de Camila Torres en el round 2  X el reloj no esta pausado
REINICIAR      -> LISTO

```
