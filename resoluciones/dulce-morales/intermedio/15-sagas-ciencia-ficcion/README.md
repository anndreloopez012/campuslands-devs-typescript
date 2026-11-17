# Intermedio 15: Analizador de sagas sci-fi

**Tematica:** ciencia ficcion
**Alumna:** Dulce Morales

## Problema

Un club de fans quiere comparar sagas de ciencia ficcion. Las sagas son inventadas para el ejercicio. Cada saga tiene entregas (peliculas o temporadas de serie) con anio de estreno, anio dentro de la historia, duracion y calificacion. El programa:

- calcula estadisticas por saga;
- detecta si la saga mejora o empeora con el tiempo;
- arma dos ordenes para verla: por estreno y cronologico (segun la historia).

## Que hice

### Modelo (objetos anidados)

- `interface Saga` con un `universo` anidado (creador y ambientacion) y una lista de `Entrega`.
- `interface Entrega` con dos anios distintos: `estreno` (anio real) y `anioHistoria` (anio dentro del universo).
- Union types: `Formato` (pelicula, serie) y `Tendencia` (mejora, empeora, estable, sin datos).
- `interface Estadisticas`: el resultado calculado de cada saga.

### Reglas de negocio

- **Tendencia:**
  - se ordenan las entregas por estreno y se compara el promedio de la primera mitad con el de la segunda;
  - si sube 0.5 o mas, mejora; si baja 0.5 o mas, empeora; si no, es estable;
  - con una sola entrega no hay tendencia.
- **Precuela:** una entrega estrenada **despues** de otra pero que ocurre **antes** en la historia. Si hay precuelas, se muestra el orden cronologico aparte.
- **Ranking:** por promedio, solo sagas con **al menos 2 entregas**. Una pelicula suelta no se compara con una saga completa.
- **Validacion:** calificacion de 0 a 10, duracion positiva, estreno entre 1900 y 2030, sin titulos repetidos y al menos una entrega.

### Como use arrays tipados

- `map`: notas, anios de estreno y textos de cada orden.
- `filter`: titulos repetidos, precuelas, series y sagas del ranking.
- `reduce`: mejor y peor entrega, minutos totales y promedio.
- `sort`: orden por estreno, orden cronologico y ranking, siempre sobre copias.
- `flatMap`: juntar los errores de todas las entregas y todas las entregas de todas las sagas.

### Casos probados

| Saga | Caso | Resultado |
|---|---|---|
| Cronicas de Andromeda | Las notas bajan y hay una precuela (Origenes) | Empeora; el orden cronologico es distinto al de estreno |
| Proyecto Helix | Mezcla peliculas y series, las notas suben | Mejora |
| Ecos de Marte | Notas parecidas | Estable |
| Horizonte Cero | Limite: una sola entrega | Sin tendencia y fuera del ranking |
| Saga Rota | Nota 11, duracion 0 y titulo repetido | Descartada |

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/15-sagas-ciencia-ficcion/index.ts
```

## Salida esperada

```text
==================== ANALIZADOR DE SAGAS SCI-FI ====================

=== Cronicas de Andromeda (Elena Vasquez - guerra entre colonias espaciales) ===
Entregas: 4 | 9.22 h en total | 16 anios de estrenos | promedio 7.18
Mejor: Andromeda: El Despertar (8.6) | Peor: Andromeda: El Juicio (5.8)
Tendencia: empeora
Orden por estreno:  Andromeda: El Despertar [1998] -> Andromeda: La Flota Perdida [2002] -> Andromeda: Origenes [2009] -> Andromeda: El Juicio [2014]
Orden cronologico:  Andromeda: Origenes [anio 2280] -> Andromeda: El Despertar [anio 2310] -> Andromeda: La Flota Perdida [anio 2315] -> Andromeda: El Juicio [anio 2320]
  (1 precuela(s): el orden cronologico es distinto al de estreno)

=== Proyecto Helix (Marcus Obi - inteligencia artificial y clones) ===
Entregas: 4 | 20.47 h en total | 12 anios de estrenos | promedio 8.13
Mejor: Helix: Convergencia (9.1) | Peor: Helix (6.9)
Tendencia: mejora
Orden por estreno:  Helix [2011] -> Helix: Temporada 1 [2016] -> Helix: Temporada 2 [2018] -> Helix: Convergencia [2023]
Orden cronologico:  igual al de estreno

=== Ecos de Marte (Sofia Lund - colonizacion de Marte) ===
Entregas: 3 | 6.07 h en total | 9 anios de estrenos | promedio 7.40
Mejor: Ecos de Marte II (7.6) | Peor: Ecos de Marte III (7.2)
Tendencia: estable
Orden por estreno:  Ecos de Marte [2015] -> Ecos de Marte II [2019] -> Ecos de Marte III [2024]
Orden cronologico:  igual al de estreno

=== Horizonte Cero (Ken Arata - viaje en el tiempo) ===
Entregas: 1 | 1.82 h en total | 0 anios de estrenos | promedio 8.20
Mejor: Horizonte Cero (8.2) | Peor: Horizonte Cero (8.2)
Tendencia: sin datos
Orden por estreno:  Horizonte Cero [2021]
Orden cronologico:  igual al de estreno

X Saga Rota descartada:
  - "Parte 1": calificacion 11 fuera de 0-10
  - "Parte 1": duracion invalida
  - titulos repetidos: Parte 1

==================== RANKING DE SAGAS (minimo 2 entregas) ====================
1. Proyecto Helix         promedio 8.13 | 4 entrega(s) | 20.47 h | mejora
2. Ecos de Marte          promedio 7.40 | 3 entrega(s) |  6.07 h | estable
3. Cronicas de Andromeda  promedio 7.18 | 4 entrega(s) |  9.22 h | empeora
Fuera del ranking por tener pocas entregas: Horizonte Cero (1 entrega)

Total: 12 entregas (10 peliculas, 2 temporadas de serie)
Ver todo seguido tomaria 37 h 34 min
```
