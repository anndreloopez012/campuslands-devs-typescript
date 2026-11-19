# Intermedio 05: Ranking de jugadores de futbol

**Tematica:** futbol
**Alumna:** Dulce Morales

## Problema

Comparar jugadores de posiciones distintas de forma justa. Un portero no mete goles y un delantero no ataja, asi que cada posicion tiene su propia formula, y todo se mide **por cada 90 minutos** (asi no gana quien solo jugo mas partidos).

## Que hice

### Modelo

- `type Posicion`: portero, defensa, mediocampista, delantero.
- `interface EstadisticasTemporada` e `interface Jugador`, todo `readonly`.
- `type Pesos` y `PESOS: Record<Posicion, Pesos>`: cuanto vale cada estadistica segun la posicion. Por ejemplo, un gol vale 6 para un delantero y 3 para un defensa. Los goles recibidos restan al portero.
- `type Evaluacion`: union discriminada con tres estados: `clasificado`, `pocos minutos` o `invalido`.

### Reglas de negocio

- **Rating** = 5 + suma de (estadistica por 90 min x peso de su posicion) - 0.5 por cada tarjeta roja.
- **Minimo de 900 minutos** (10 partidos completos) para entrar al ranking.
- **Datos invalidos:** valores negativos o decimales, o mas minutos de los posibles (mas de 120 por partido).
- **Desempate**, en este orden: rating, goles + asistencias, mas minutos jugados y nombre (alfabetico).

### Funciones separadas

- **Validar:** `validarStats`.
- **Calcular (puras):** `porNoventa`, `calcularRating`, `evaluarJugador`, `compararFilas`, `rankingGeneral` (ordena una copia) y `mejorPorPosicion` (usa un `Map`).
- **Mostrar:** `formatearFila` y `main`.
- `stats(...)` es un helper que rellena con 0 las estadisticas que no se usan, para que los datos de prueba sean cortos.

### Casos probados

- **Normal:** 9 jugadores de las cuatro posiciones entran al ranking.
- **Limite de minutos:**
  - Nico Bravo tiene muy buenos numeros pero solo 420 minutos: queda fuera.
  - Ines Duarte tiene **exactamente** 900 minutos: si entra.
- **Empate:** Bruno Rey y Hugo Vera tienen las mismas estadisticas. Empatan en rating, G+A y minutos, y se desempatan por nombre.
- **Invalido:** Error Data tiene 1200 minutos en 3 partidos.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/05-ranking-futbol-pro/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
====================== RANKING GENERAL ======================
 1. Lucia Ortega  Real Norte      mediocampista  rating 11.91 | G+A 21 | 2950 min
 2. Mateo Cruz    Deportivo Este  mediocampista  rating 11.78 | G+A 12 | 2300 min
 3. Valeria Rios  Atletico Sur    delantero      rating 11.20 | G+A 27 | 2520 min
 4. Diego Paz     Real Norte      delantero      rating 10.12 | G+A 27 | 2700 min
 5. Sara Molina   Atletico Sur    defensa        rating 10.08 | G+A  5 | 2970 min
 6. Ines Duarte   Deportivo Este  delantero      rating  9.94 | G+A  8 | 900 min
 7. Bruno Rey     Real Norte      defensa        rating  8.81 | G+A  4 | 2650 min
 8. Hugo Vera     Deportivo Este  defensa        rating  8.81 | G+A  4 | 2650 min
 9. Ana Salas     Real Norte      portero        rating  7.74 | G+A  0 | 3060 min
10. Tomas Leon    Atletico Sur    portero        rating  7.02 | G+A  1 | 2790 min

================= MEJOR DE CADA POSICION =================
portero        Ana Salas (7.74)
defensa        Sara Molina (10.08)
mediocampista  Lucia Ortega (11.91)
delantero      Valeria Rios (11.20)

==================== FUERA DEL RANKING ====================
- Nico Bravo: solo 420 minutos (minimo 900)
- Error Data: datos invalidos, 1200 minutos es imposible en 3 partidos

Clasificados: 10 de 12 jugadores
```
