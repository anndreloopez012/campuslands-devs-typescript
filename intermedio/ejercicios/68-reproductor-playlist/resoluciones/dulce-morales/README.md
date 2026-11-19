# Intermedio 68 - Playlist interactiva

**Tematica:** musica
**Alumna:** Dulce Morales

## Problema

Modelar un reproductor de musica con su cola de canciones. Cada boton del reproductor es un evento y
el estado cambia solo a traves de un reducer puro (no se modifica nada por fuera).

## Que hice

- `Reproduccion` es una union discriminada por `fase`: `detenido` (sin cancion), `reproduciendo` y
  `pausado` (ambos con `indice` y `segundo`). Asi no puede existir un "pausado sin cancion".
- `Evento` es otra union discriminada: `PLAY`, `PAUSA`, `SIGUIENTE`, `ANTERIOR`, `ADELANTAR`, `TICK`,
  `CAMBIAR_REPETIR`, `ALEATORIO`, `AGREGAR` y `QUITAR`.
- `reducer(estado, evento)` usa un `switch` exhaustivo y siempre devuelve un estado nuevo. Si una accion
  no es valida, devuelve el mismo estado con un `aviso`.
- `TICK` simula el paso del tiempo: en un solo tick pueden terminar varias canciones.
- El orden de reproduccion (`orden`) es independiente de la cola; el modo aleatorio lo mezcla con una
  semilla fija para que la salida sea repetible.

## Reglas

| Evento | Regla |
|---|---|
| PLAY | Desde detenido empieza la primera del orden; desde pausado reanuda; con cola vacia avisa |
| PAUSA | Solo si esta sonando |
| SIGUIENTE | Pasa a la siguiente del orden; al final se detiene (o vuelve al inicio con repetir "todo") |
| ANTERIOR | Si van mas de 3 s reinicia la cancion actual; si no, va a la anterior |
| ADELANTAR | La posicion debe estar entre 0 y la duracion de la cancion |
| TICK | Solo corre si esta sonando; al terminar una cancion aplica el modo repetir (`no` / `todo` / `una`) |
| ALEATORIO | Mezcla el orden; la cancion que suena queda primera para no cortar la musica |
| AGREGAR | No acepta ids repetidos |
| QUITAR | No se puede quitar la cancion que esta sonando; se reajustan los indices |

## Casos probados

- Pausa con el reproductor detenido (aviso).
- El tiempo no avanza mientras esta pausado.
- ANTERIOR a los 60 s reinicia; ANTERIOR en la primera cancion avisa.
- Caso limite: un TICK que llega justo a la duracion pasa a la siguiente cancion en 0:00.
- ADELANTAR fuera de rango.
- Quitar la cancion que suena (rechazado) y quitar otra (indices reajustados).
- Agregar una cancion repetida.
- Repetir "todo" + aleatorio: un TICK de 1000 s da la vuelta completa a la lista.
- Repetir "una": la misma cancion se repite.
- SIGUIENTE varias veces sin repetir hasta llegar al fin de la lista.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/68-reproductor-playlist/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
PAUSA                              [] detenido [repetir: no]  (no hay nada sonando)
PLAY                               > Luz de Neon - Kroma 0:00/3:20 [repetir: no]
TICK 60s                           > Luz de Neon - Kroma 1:00/3:20 [repetir: no]
PAUSA                              || Luz de Neon - Kroma 1:00/3:20 [repetir: no]
TICK 30s (pausado)                 || Luz de Neon - Kroma 1:00/3:20 [repetir: no]
PLAY (reanuda)                     > Luz de Neon - Kroma 1:00/3:20 [repetir: no]
ANTERIOR (a los 60s)               > Luz de Neon - Kroma 0:00/3:20 [repetir: no]  (reinicia la cancion actual)
ANTERIOR (a los 0s)                > Luz de Neon - Kroma 0:00/3:20 [repetir: no]  (ya es la primera)
TICK 200s (limite: termina justo)  > Marea Alta - Sol Lund 0:00/3:05 [repetir: no]
ADELANTAR a 999s                   > Marea Alta - Sol Lund 0:00/3:05 [repetir: no]  (posicion 999s fuera de la cancion (dura 185s))
ADELANTAR a 180s                   > Marea Alta - Sol Lund 3:00/3:05 [repetir: no]
TICK 10s (pasa a la 3)             > Ruta 66 - Los Faros 0:05/4:00 [repetir: no]
QUITAR c3 (suena)                  > Ruta 66 - Los Faros 0:05/4:00 [repetir: no]  (no se puede quitar la cancion que esta sonando)
QUITAR c2                          > Ruta 66 - Los Faros 0:05/4:00 [repetir: no]
AGREGAR Eco (repetida)             > Ruta 66 - Los Faros 0:05/4:00 [repetir: no]  ("Eco" ya esta en la cola)
AGREGAR Orbita                     > Ruta 66 - Los Faros 0:05/4:00 [repetir: no]
REPETIR -> todo                    > Ruta 66 - Los Faros 0:05/4:00 [repetir: todo]
ALEATORIO                          > Ruta 66 - Los Faros 0:05/4:00 [repetir: todo, aleatorio] orden: Ruta 66, Eco, Luz de Neon, Orbita
TICK 1000s (varias canciones)      > Ruta 66 - Los Faros 3:25/4:00 [repetir: todo, aleatorio]
REPETIR -> una                     > Ruta 66 - Los Faros 3:25/4:00 [repetir: una, aleatorio]
TICK 500s (se repite la misma)     > Ruta 66 - Los Faros 3:45/4:00 [repetir: una, aleatorio]
REPETIR -> no                      > Ruta 66 - Los Faros 3:45/4:00 [repetir: no, aleatorio]
SIGUIENTE x4                       [] detenido [repetir: no, aleatorio]  (fin de la lista)

Cola final: Luz de Neon, Ruta 66, Eco, Orbita
```
