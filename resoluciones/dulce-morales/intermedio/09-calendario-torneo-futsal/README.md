# Intermedio 09: Calendario de torneo futsal

**Tematica:** futbol sala
**Alumna:** Dulce Morales

## Problema

Armar el calendario de un torneo "todos contra todos": cada equipo juega una vez contra cada rival, nadie juega dos veces en la misma jornada y los partidos se reparten en canchas y horarios. Si los equipos son impares, uno descansa en cada jornada. Con los resultados se arma la tabla de posiciones.

## Que hice

### Modelo

- Union types: `Cancha` y `Horario`.
- Interfaces `Equipo`, `Partido`, `Jornada` (con `descansa: Equipo | null`), `Resultado` y `FilaTabla`, todo `readonly`.
- `type Validacion`: union discriminada (`ok: true` u `ok: false` con la lista de errores).

### Como se genera el calendario (metodo del circulo)

1. Si hay un numero impar de equipos, se agrega un hueco (`null`). Al que le toque jugar contra el hueco, descansa.
2. En cada jornada se emparejan los equipos de los extremos de la lista: primero con ultimo, segundo con penultimo, etc.
3. Se rota la lista dejando fijo el primer equipo, y se repite. Con `n` equipos salen `n - 1` jornadas (o `n` si son impares).
4. `rotar<T>` es una funcion **generica** que devuelve una lista nueva sin modificar la original.
5. Cada partido recibe una cancha y un horario en orden (A 18:00, B 18:00, A 19:00...).

### Reglas de negocio

- Se necesitan al menos 2 equipos y sin ids repetidos.
- Los partidos de una jornada deben caber en los espacios disponibles (2 canchas x 3 horarios).
- **Verificacion:** despues de generar, `verificarCalendario` comprueba que cada pareja se enfrente **exactamente una vez** y que nadie juegue dos veces en la misma jornada.
- **Tabla:** 3 puntos por victoria, 1 por empate. Desempate: puntos, diferencia de goles, goles a favor y nombre.
- Los resultados con goles negativos o equipos inexistentes se ignoran.

### Funciones separadas

- **Validar:** `validarEquipos`, `verificarCalendario`, `esResultadoValido`.
- **Generar y calcular (puras):** `rotar`, `asignarEspacio`, `generarCalendario`, `filaVacia`, `sumarPartido` (devuelve una fila nueva), `calcularTabla`.
- **Mostrar:** `imprimirCalendario`, `imprimirTabla` y `main`.

### Casos probados

- **Normal:** 6 equipos, 5 jornadas, 15 partidos verificados.
- **Limite:** 5 equipos (impar). Cada jornada descansa un equipo distinto y salen 10 partidos verificados.
- **Invalido:** dos equipos con el mismo id. No se genera calendario.
- **Tabla:** 6 resultados validos y 1 con goles negativos que se ignora.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/09-calendario-torneo-futsal/index.ts
```

## Salida esperada

```text
================ TORNEO PAR (6 equipos) ================
Jornada 1
  18:00 Cancha A: Leones FS vs Toros
  18:00 Cancha B: Tiburones vs Lobos
  19:00 Cancha A: Halcones  vs Cobras
Jornada 2
  18:00 Cancha A: Lobos     vs Leones FS
  18:00 Cancha B: Cobras    vs Toros
  19:00 Cancha A: Halcones  vs Tiburones
Jornada 3
  18:00 Cancha A: Leones FS vs Cobras
  18:00 Cancha B: Lobos     vs Halcones
  19:00 Cancha A: Toros     vs Tiburones
Jornada 4
  18:00 Cancha A: Halcones  vs Leones FS
  18:00 Cancha B: Tiburones vs Cobras
  19:00 Cancha A: Toros     vs Lobos
Jornada 5
  18:00 Cancha A: Leones FS vs Tiburones
  18:00 Cancha B: Halcones  vs Toros
  19:00 Cancha A: Cobras    vs Lobos
Verificado: 15 partidos, cada pareja juega una sola vez y nadie repite jornada.

================ TORNEO IMPAR (5 equipos) ================
Jornada 1
  18:00 Cancha A: Panteras  vs Bufalos
  18:00 Cancha B: Zorros    vs Osos
  Descansa: Aguilas
Jornada 2
  18:00 Cancha A: Bufalos   vs Aguilas
  18:00 Cancha B: Zorros    vs Panteras
  Descansa: Osos
Jornada 3
  18:00 Cancha A: Aguilas   vs Osos
  18:00 Cancha B: Bufalos   vs Zorros
  Descansa: Panteras
Jornada 4
  18:00 Cancha A: Zorros    vs Aguilas
  18:00 Cancha B: Panteras  vs Osos
  Descansa: Bufalos
Jornada 5
  18:00 Cancha A: Aguilas   vs Panteras
  18:00 Cancha B: Osos      vs Bufalos
  Descansa: Zorros
Verificado: 10 partidos, cada pareja juega una sola vez y nadie repite jornada.

================ TORNEO INVALIDO (2 equipos) ================
X id repetido: X1

================ TABLA (tras 6 resultados validos, 1 ignorado) ================
Pos Equipo     PJ  G  E  P  GF GC  DG  Pts
 1. Cobras     2  2  0  0  10  2  +8  6
 2. Leones FS  2  1  1  0   7  4  +3  4
 3. Halcones   2  1  0  1   4  6  -2  3
 4. Lobos      2  0  2  0   5  5   0  2
 5. Tiburones  2  0  1  1   5  6  -1  1
 6. Toros      2  0  0  2   3 11  -8  0
```
