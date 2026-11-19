# Intermedio 70 - Terminal sci-fi

**Tematica:** ciencia ficcion
**Alumna:** Dulce Morales

## Problema

Simular la terminal de mando de una nave espacial. La persona escribe comandos de texto. La terminal
los interpreta, revisa permisos y cambia el estado de la nave y de la propia terminal.

## Que hice

- **Parser:** `parsear(linea)` convierte el texto en un `Parseo`, una union discriminada por `ok`.
  Devuelve un `Comando` valido, o bien un error de sintaxis. La logica nunca recibe texto suelto.
- **Comando:** es una union discriminada por `cmd`. Por ejemplo, `salto` siempre trae un `Sector`
  valido gracias al type guard `esSector`.
- **Terminal:** es una maquina de estados con cuatro modos: `bloqueada` (con intentos), `cerrojo`
  (bloqueo temporal), `sesion` y `alerta`. Solo `sesion` y `alerta` tienen usuario.
- **Reducer:** `reducer(estado, comando)` es puro. Devuelve el estado nuevo y el texto de salida.
- **Permisos:** se definen con un `Record<Comando["cmd"], Nivel | "publico">`. Si se agrega un comando
  nuevo y no se le asigna permiso, TypeScript marca error.

## Reglas

| Regla | Detalle |
|---|---|
| Login | codigo de 4 digitos; 3 fallos activan un cerrojo de 2 turnos |
| Niveles | tripulante < oficial < capitan |
| Permisos | `estado` y `escanear`: tripulante; `motor` y `escudos`: oficial; `salto`: capitan |
| Alerta | escanear un sector hostil (GAMMA) entra en alerta |
| Durante la alerta | no se puede cerrar sesion ni bajar escudos; subir escudos la resuelve |
| Salto | requiere motor encendido, otro sector y al menos 30 % de combustible; a un sector hostil solo con escudos |

## Casos probados

- Comando sin sesion, codigo mal escrito y comando inexistente.
- Tres codigos incorrectos activan el cerrojo. Durante el cerrojo se rechaza incluso un codigo
  correcto, y despues se puede entrar.
- Un tripulante no puede encender el motor y un oficial no puede saltar.
- Flujo de alerta: entrar en alerta, intentar salir, intentar bajar escudos y resolverla.
- Salto a un sector hostil sin escudos (abortado) y con escudos (completado).
- Salto al mismo sector y salto con el motor apagado.
- Caso limite: despues de dos saltos queda 10 % de combustible y el tercero se aborta.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/70-sci-fi-terminal/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
[----]>     estado           acceso denegado: inicia sesion
[----]>     login 12         ERROR: uso: login <codigo de 4 digitos>
[----]>     login 0000       codigo incorrecto (1/3)
[----]>     login 9999       codigo incorrecto (2/3)
[----]>     login 5555       codigo incorrecto (3/3). CERROJO ACTIVADO
[LOCK]>     login 7741       TERMINAL BLOQUEADA (2 turno(s) restantes)
[LOCK]>     ayuda            TERMINAL BLOQUEADA (1 turno(s) restantes)
[LOCK]>     login 1111       bienvenida/o, Tomas [tripulante]
[Tomas]>    motor on         acceso denegado: requiere nivel oficial
[Tomas]>    escanear beta    escaneo BETA: despejado
[Tomas]>    logout           sesion cerrada
[----]>     login 3020       bienvenida/o, Bruno [oficial]
[Bruno]>    motor on         motor ON
[Bruno]>    salto beta       acceso denegado: requiere nivel capitan
[Bruno]>    escanear gamma   escaneo GAMMA: FLOTA HOSTIL DETECTADA -> modo alerta
[!Bruno!]>  logout           no se puede cerrar sesion durante una alerta
[!Bruno!]>  hiperespacio     ERROR: comando no reconocido "hiperespacio"
[!Bruno!]>  escudos off      no se pueden bajar escudos durante una alerta
[!Bruno!]>  escudos on       escudos arriba, alerta controlada
[Bruno]>    logout           sesion cerrada
[----]>     login 7741       bienvenida/o, Ixchel [capitan]
[Ixchel]>   escudos off      escudos OFF
[Ixchel]>   salto gamma      salto abortado: GAMMA es hostil y los escudos estan abajo
[Ixchel]>   escudos on       escudos ON
[Ixchel]>   salto gamma      salto completado a GAMMA (-30% combustible)
[Ixchel]>   salto gamma      ya estamos en GAMMA
[Ixchel]>   motor off        motor OFF
[Ixchel]>   salto delta      salto abortado: motor apagado
[Ixchel]>   motor on         motor ON
[Ixchel]>   salto delta      salto completado a DELTA (-30% combustible)
[Ixchel]>   salto beta       salto abortado: combustible 10% (< 30%)
[Ixchel]>   estado           sector DELTA | combustible 10% | motor ON | escudos ON
```
