# Intermedio 32: Temporada modo carrera

**Tematica:** futbol (modo carrera de un videojuego)
**Alumna:** Dulce Morales

## Problema

En el modo carrera diriges un club durante una temporada de 12 partidos. Cada partido se simula segun la media del once titular contra la del rival. Hay goles, lesiones y jugadores jovenes que mejoran. Al final:

- se compara el resultado con el objetivo de la directiva;
- se revisa el presupuesto de salarios.

## Que hice

### Clases

- **`Futbolista`:** la media, las lesiones y los partidos jugados son **privados**.
  - El constructor valida que la media este entre 1 y 99 y que el potencial no sea menor que la media. Si no, lanza un error.
  - `entrenar()`: los menores de 23 suben 1 punto cada 3 partidos jugados, sin pasar su potencial.
  - `lesionar()` y `pasarJornada()` manejan las lesiones.
- **`Club`:** la plantilla es privada.
  - `elegirOnce()` arma un 1-4-3-3 con los mejores **disponibles** de cada puesto (los lesionados no juegan).
  - `mediaDelOnce()` y `masaSalarial()` calculan con `reduce`.

### Tipos y type guards

- Literal types: `Posicion` ("POR" | "DEF" | "MED" | "DEL"), `Objetivo` y `Resultado` ("V" | "E" | "D").
- `type Suceso`: union discriminada (gol, lesion o mejora).
- **Type guards** `esGol` y `esLesion` para filtrar los sucesos de cada partido.

### Reglas de la simulacion

- **Goles:** 1.3 + (media propia - media rival) / 8, mas un azar. Mientras mas media que el rival, mas goles.
- **Autores:** los goles se reparten entre los medios y delanteros del once.
- **Lesion:** cada partido tiene 12% de probabilidad de lesion, de 1 a 3 partidos.
- **Repetible:** uso un generador **con semilla** (32) en vez de `Math.random()`, asi que el resultado siempre es el mismo y se puede revisar.
- **Objetivos de la directiva:** campeonar 30 pts, top 4 22 pts, mitad de tabla 15 pts, no descender 10 pts.

### Casos probados

- **Validacion:** crear un jugador con potencial menor que su media lanza un error controlado.
- **Lesiones:** cuando un titular se lesiona, el once cambia y la media del equipo baja en los partidos siguientes.
- **Jovenes:** Leon y Rojas mejoran durante la temporada. Los suplentes jovenes no suben porque no juegan.
- **Objetivo y presupuesto:** se revisa si se cumplio el objetivo "top 4" y si la masa salarial esta dentro del presupuesto.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/32-temporada-futbol/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
Validacion: Prueba: media o potencial invalidos

==================== TEMPORADA DE ATLETICO ANDINO ====================
J 1 vs Real Pacifico    (79) media 75.5  1-3 D  goles: Diaz
J 2 vs Union Sur        (70) media 75.5  2-1 V  goles: Castro, Herrera
J 3 vs Deportivo Norte  (75) media 75.5  2-1 V  goles: Castro, Diaz
J 4 vs Club Capital     (82) media 75.6  1-2 D  goles: Diaz
J 5 vs Sporting Valle   (72) media 75.6  2-1 V  goles: Rojas, Herrera
J 6 vs Racing Costa     (74) media 75.6  2-2 E  goles: Diaz, Diaz
J 7 vs Atletico Sierra  (68) media 75.8  3-1 V  goles: Navas, Castro, Rojas
J 8 vs Real Pacifico    (79) media 75.8  2-2 E  goles: Navas, Navas | lesion Ruiz (1 p.)
J 9 vs Union Sur        (70) media 74.5  2-1 V  goles: Navas, Castro
J10 vs Club Capital     (82) media 76.0  1-3 D  goles: Herrera
J11 vs Sporting Valle   (72) media 76.0  2-1 V  goles: Herrera, Navas
J12 vs Racing Costa     (74) media 76.0  2-1 V  goles: Rojas, Castro

==================== BALANCE ====================
7V 2E 3D | 23 puntos | goles 22-19
Objetivo "top 4" (22 pts): CUMPLIDO
Goleadores: Castro 5, Diaz 5, Navas 5, Herrera 4
Jovenes que mejoraron: Leon 70->74, Rojas 72->76
Salarios: 179k/semana de 200k (dentro del presupuesto)
```
