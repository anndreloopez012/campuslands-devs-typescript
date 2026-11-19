# Ejercicio 06: Funciones tipadas

**Contexto:** Sistema de puntuacion deportiva
**Alumna:** Dulce Morales

## Que hice

- Todas las funciones tienen sus parametros y su retorno tipados, y siempre usan `return` explicito.
- Funciones pequenas, cada una nombrada por lo que hace:
  - `calcularPuntosPorVictorias`: 3 puntos por victoria.
  - `calcularPuntosPorEmpates`: 1 punto por empate.
  - `calcularBonusOfensivo`: 1 punto extra por cada 10 goles a favor.
  - `calcularPuntajeTotal`: suma las tres anteriores.
  - `describirPuntaje`: arma la linea de texto de cada equipo.
- No hay variables globales para el calculo: los valores de puntos llegan como parametros con valor por defecto, y los datos viven dentro de `main()`.
- Reto extra: `obtenerMejorEquipo(equipos)` recibe varios equipos y retorna el de mejor puntaje, o `null` si la lista esta vacia.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/06-funciones-tipadas/index.ts
```

## Salida esperada

```text
============ TABLA DE PUNTOS ============
Tigres FC        V:24 + E:3 + Bonus:3 = 30 pts
Halcones         V:27 + E:1 + Bonus:1 = 29 pts
Deportivo Sur    V:21 + E:5 + Bonus:2 = 28 pts
=========================================
Equipo lider: Tigres FC con 30 puntos
```
