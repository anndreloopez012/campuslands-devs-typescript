# Intermedio 11: Simulador de carrera por vueltas

**Tematica:** carreras
**Alumna:** Dulce Morales

## Problema

Con los tiempos de cada vuelta de cada piloto, reconstruir la carrera: posiciones vuelta a vuelta, tiempo total con penalizaciones, diferencia con el lider, estrategia de neumaticos, vuelta rapida y clasificacion final. Los que abandonan van al final, ordenados por cuantas vueltas completaron.

## Que hice

### Modelo (objetos anidados)

- `Carrera` contiene `Piloto[]`. Cada `Piloto` contiene un `Equipo` y un `Vuelta[]`.
- Union types: `Compuesto` (blando, medio, duro) y `Estado` (termino, abandono).
- `Clasificado` y `FilaFinal`: resultados calculados, sin tocar los datos originales.

### Reglas de negocio

- **Tiempo total** = suma de las vueltas + penalizacion.
- **Orden final:** mas vueltas completadas primero. Con las mismas vueltas, menos tiempo primero.
- **Puntos:** 25-18-15-12-10-8-6-4-2-1 solo para los que terminan. +1 por vuelta rapida si ademas suma puntos.
- **Diferencia:** "Lider", "+X s", "+N vuelta(s)" o "Abandono (vuelta N)".
- **Validacion:** cada vuelta debe durar entre 60 y 300 s y estar numerada en orden. No puede haber mas vueltas que las de la carrera ni penalizaciones negativas. Un piloto con datos invalidos se excluye.

### Como use arrays tipados

- `map`: pasar de vueltas a tiempos, de pilotos a clasificados y de compuestos a la estrategia.
- `filter`: pilotos que completaron una vuelta, paradas en pits, compuestos repetidos y pilotos invalidos.
- `reduce`: sumar tiempos y sumar puntos por equipo.
- `sort`: siempre sobre una copia o sobre un arreglo nuevo, con desempates numericos (nunca como texto).

### Casos probados

- **Penalizacion que cambia el resultado:** Ines Duarte (#44) va primera en pista todas las vueltas, pero sus 5 s de penalizacion la bajan al 3er lugar. Aun asi se lleva el punto de vuelta rapida.
- **Final muy cerrado:** Rossi le gana a Vogel por 0.100 s.
- **Abandonos (limite):** Arce completa 3 vueltas y Lind 1. Ambos van al final, Arce delante por tener mas vueltas, y sin puntos.
- **Invalido:** Error Crono tiene una vuelta de 12 s y se excluye.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/11-circuito-carreras/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
=========== GRAN PREMIO - Autodromo del Valle (6 vueltas) ===========
X Excluido #99 Error Crono: vuelta 2: tiempo 12s fuera de rango

--- Posiciones vuelta a vuelta (dorsales) ---
V1: #44 #16 #3 #7 #21 #11
V2: #44 #16 #3 #7 #21
V3: #44 #7 #3 #21 #16
V4: #44 #16 #7 #21
V5: #44 #16 #7 #21
V6: #44 #16 #7 #21

--- Clasificacion final ---
 1. #16 Mateo Rossi   Nordic Speed      9:30.100               Lider                 medio > duro    25 pts
 2. #7  Lena Vogel    Solaris Racing    9:30.200               +0.100s               medio > duro    18 pts
 3. #44 Ines Duarte   Solaris Racing    9:34.400 (+5s pen.)    +4.300s               blando > duro   16 pts
 4. #21 Kai Nakamura  Andes Motorsport  9:36.100               +6.000s               medio > duro    12 pts
 5. #3  Pablo Arce    Nordic Speed      4:36.000               Abandono (vuelta 4)   medio            0 pts
 6. #11 Sara Lind     Andes Motorsport  1:34.200               Abandono (vuelta 2)   medio            0 pts

Vuelta rapida: Ines Duarte con 1:30.400

--- Puntos por equipo ---
Solaris Racing    34 pts
Nordic Speed      25 pts
Andes Motorsport  12 pts
```
