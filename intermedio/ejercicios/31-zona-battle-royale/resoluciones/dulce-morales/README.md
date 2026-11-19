# Intermedio 31: Simulador de zona battle royale

**Tematica:** videojuegos battle royale
**Alumna:** Dulce Morales

## Problema

En un battle royale la zona segura se cierra por fases:

- quien queda fuera recibe dano cada segundo, y el dano sube en cada fase;
- los jugadores corren hacia el centro a su propia velocidad;
- si un jugador baja de 50 de vida y tiene botiquines, se cura.

El programa simula las fases, registra los eventos y muestra en que puesto quedo cada jugador.

## Que hice

### Clases

- **`Zona`:** guarda el centro y un radio **privado**. `contiene(punto)` dice si un punto esta dentro (el borde cuenta como dentro). `cerrar(radio)` valida que el radio nuevo sea **menor** que el actual y lanza un error si no.
- **`Jugador`:** vida, botiquines y posicion son privados. Se usan con:
  - getters: `vivo`, `vidaActual`, `lugar`;
  - metodos: `moverHacia`, `recibirDano`, `intentarCurarse`.
- **`Ranking<T>`:** clase **generica** que ordena cualquier tipo de elemento por un valor numerico.

### Tipos y type guards

- `type Fase = 1 | 2 | 3 | 4`: literal types.
- `type Evento`: union discriminada por `tipo` ("dano", "curacion", "entra a zona", "eliminado"). Cada evento tiene sus propios datos.
- **Type guards** `esEliminacion` y `esDano`: al filtrar con ellos, TypeScript sabe que el resultado tiene, por ejemplo, la propiedad `puesto`. Usan `Extract<Evento, { tipo: "eliminado" }>`.

### Reglas de la simulacion

| Fase | Radio | Duracion | Dano fuera de la zona |
|---|---|---|---|
| 1 | 800 m | 60 s | 1/s |
| 2 | 400 m | 60 s | 2/s |
| 3 | 150 m | 45 s | 5/s |
| 4 | 40 m | 30 s | 10/s |

- Cada segundo, cada jugador vivo avanza hacia el centro segun su velocidad.
- Si queda fuera, recibe el dano de la fase. Con menos de 50 de vida usa un botiquin (+50).
- El puesto de un eliminado es la cantidad de jugadores que quedaban en ese momento.

### Casos probados

- **Limite:** Edge empieza **exactamente** en el borde de la zona de la fase 1 (a 800 m del centro). Cuenta como dentro, asi que en esa fase no recibe dano.
- **Validacion:** intentar "cerrar" una zona a un radio mas grande lanza un error controlado.
- Jugadores lentos o lejanos (Bolt, Raven, Tank) son eliminados por la zona. Los botiquines de Tank lo mantienen vivo hasta la fase 3.
- Nova, que empieza cerca del centro, gana sin recibir dano.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/31-zona-battle-royale/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
Validacion de zona: radio invalido: 200 (no se puede agrandar)

==================== FASES DE LA ZONA ====================

Fase 1: radio 800 m, 60 s, 1 de dano/s fuera
  Ghost entra a la zona
  Raven usa un botiquin (+50)
  Tank usa un botiquin (+50)
  Raven termina la fase fuera de la zona con 90 de vida
  Bolt termina la fase fuera de la zona con 40 de vida
  Tank termina la fase fuera de la zona con 90 de vida

Fase 2: radio 400 m, 60 s, 2 de dano/s fuera
  Ghost usa un botiquin (+50)
  Bolt ELIMINADO por la zona (puesto 6)
  Tank usa un botiquin (+50)
  Ghost entra a la zona
  Raven ELIMINADO por la zona (puesto 5)
  Tank usa un botiquin (+50)
  Edge ELIMINADO por la zona (puesto 4)
  Tank termina la fase fuera de la zona con 70 de vida

Fase 3: radio 150 m, 45 s, 5 de dano/s fuera
  Ghost usa un botiquin (+50)
  Tank ELIMINADO por la zona (puesto 3)
  Ghost ELIMINADO por la zona (puesto 2)

Fase 4: radio 40 m, 30 s, 10 de dano/s fuera
  sin eventos

==================== RESULTADO FINAL ====================
#1 Nova   vivo con 100 de vida
#2 Ghost  eliminado por la zona
#3 Tank   eliminado por la zona
#4 Edge   eliminado por la zona
#5 Raven  eliminado por la zona
#6 Bolt   eliminado por la zona
Fases terminadas fuera de zona: 4 | eliminados: 5 | sobreviven: 1
```
