# Intermedio 01: Dashboard K/D de squad shooter

**Tematica:** videojuegos shooters
**Alumna:** Dulce Morales

## Que hice

### Modelo

- `type Rol` y `type Rango`: union types para los roles (asalto, francotirador, soporte, medico) y los rangos (Elite, Veterano, Regular, Novato).
- `interface Jugador` y `interface EstadisticaPartida`: los datos de entrada, todos `readonly`.
- `interface ResumenJugador` y `interface ResumenSquad`: los resultados ya calculados.
- `type Validacion`: union discriminada (`valida: true` o `valida: false` con `motivo`), para no devolver valores ambiguos.

### Funciones separadas

- **Validar:** `validarPartida` descarta partidas de jugadores que no existen o con valores negativos o decimales.
- **Calcular (funciones puras):** `calcularKd`, `calcularKda`, `clasificarRango`, `resumirJugador`, `resumirSquads`.
- **Ordenar:** `rankingPorKd` y `rankingSquads` ordenan numeros como numeros, sobre una copia (`[...lista]`), sin mutar el arreglo original.
- **Mostrar:** `formatearFila` e `imprimirDashboard` son las unicas que se encargan de la salida por consola.

### Reglas de negocio

- **K/D** = kills / muertes. **KDA** = (kills + asistencias) / muertes.
- **Rango:** Elite (K/D >= 3), Veterano (>= 1.5), Regular (>= 1), Novato (< 1).
- **Minimo de partidas:** para entrar al ranking se necesitan al menos 2 partidas. Asi alguien con una sola partida suerte no queda como MVP.
- **K/D del squad:** kills totales / muertes totales del squad (no el promedio de los K/D individuales, que se inflaria con un caso extremo).

### Casos probados

- **Caso normal:** cinco jugadores con 2 partidas cada uno entran al ranking.
- **Caso limite:** Rookie_Max tiene 0 muertes. En vez de dividir entre 0 (que da `Infinity`), se divide entre 1, asi su K/D es 7.00. Ademas, como solo jugo 1 partida, queda fuera del ranking.
- **Datos invalidos:** una partida con kills negativas y otra de un jugador inexistente (J99) se descartan y se informan.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/01-dashboard-kd-shooter/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
================ DASHBOARD K/D ================
Partidas validas: 11 | descartadas: 2
  - Descartada: J4 tiene valores negativos o decimales
  - Descartada: jugador J99 no existe

--- Ranking individual (por K/D, minimo 2 partidas) ---
1.  | SilentOwl   | Alfa   | francotirador  | K 26 | D  7 | A  3 | K/D  3.71 | KDA  4.14 | Elite
2.  | NovaStrike  | Alfa   | asalto         | K 42 | D 22 | A 10 | K/D  1.91 | KDA  2.36 | Veterano
3.  | Ghost404    | Bravo  | asalto         | K 42 | D 24 | A  8 | K/D  1.75 | KDA  2.08 | Veterano
4.  | IronWall    | Bravo  | soporte        | K 21 | D 19 | A 24 | K/D  1.11 | KDA  2.37 | Regular
5.  | PatchUp     | Alfa   | medico         | K  9 | D 16 | A 39 | K/D  0.56 | KDA  3.00 | Novato

--- Fuera del ranking (menos de 2 partidas) ---
Rookie_Max  | 1 partida(s) | K/D 7.00

--- Squads ---
Alfa   | 3 jugadores | K/D del squad 1.71 | MVP: SilentOwl
Bravo  | 3 jugadores | K/D del squad 1.63 | MVP: Ghost404

--- Resumen ---
MVP general: SilentOwl (K/D 3.71)
Caso limite: Rookie_Max tiene 0 muertes y su K/D es 7.00 (no Infinity).
```
