# Intermedio 33: Plan de mantenimiento moto

**Tematica:** motos y mecanica de motos
**Alumna:** Dulce Morales

## Problema

Cada tarea de mantenimiento de una moto se hace cada cierto kilometraje, cada cierto tiempo, o "lo que ocurra primero". Con el historial de servicios y los km que la moto recorre cada mes, el programa:

- dice que tareas estan **vencidas**, **proximas** o **al dia**;
- arma el plan de los proximos 12 meses;
- estima el costo total y por sistema.

## Que hice

### Tipos y type guards

- `type Intervalo`: union discriminada por `regla`:
  - `"km"` (cada X km);
  - `"meses"` (cada X meses);
  - `"lo que ocurra primero"` (ambos).
- **Type guards** `usaKm` y `usaMeses`: con ellos TypeScript sabe cuando el intervalo tiene `cadaKm` o `cadaMeses`, sin casteos.
- Literal types: `Sistema` y `Estado`.

### Clases

- **`Moto`:** km, mes e historial son **privados**.
  - El constructor valida que el kilometraje sea correcto.
  - `registrar(servicio)` rechaza servicios con fecha o km en el futuro.
  - `ultimo(tarea)`: el ultimo servicio de esa tarea (si nunca se hizo, cuenta desde la compra).
  - `mesDeVencimiento(tarea)`: convierte los km que faltan en meses segun el ritmo de uso, y se queda con el que ocurra **primero**.
  - `estado(tarea)`: vencida, proxima (vence en 1 mes) o al dia.
- **`Agenda<T>`:** clase **generica** que agrupa elementos por mes (con un `Map`) y los devuelve en orden.

### Reglas

- Llegar **exactamente** al intervalo ya cuenta como vencida.
- Para el plan, cada tarea se repite desde la fecha en que se haria, hasta completar 12 meses.

### Casos probados

- **Limite:** el aceite se cambio en el mes 18 y toca cada 6 meses. Hoy es el mes **24 exacto**, asi que esta vencido. (Por km todavia faltaban 200, pero manda lo que ocurra primero.)
- **Nunca hecha:** el liquido de frenos nunca se cambio y toca a los 24 meses, asi que tambien esta vencido.
- **Validacion:** registrar un servicio con fecha futura lanza un error controlado.
- **Plan del ano:**
  - la cadena se lubrica cada 2 meses (800 km a 500 km/mes);
  - en el mes 36 se juntan varias tareas.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/33-mantenimiento-moto/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
Validacion: servicio T4 en el futuro

=========== Yamaha MT-03: mes 24, 12300 km (500 km/mes) ===========
VENCIDA  Cambio de aceite    3000 km o 6 meses      ultimo: mes 18 / 9500 km   toca: mes 24
VENCIDA  Liquido de frenos   cada 24 meses          ultimo: nunca              toca: mes 24
PROXIMA  Lubricar cadena     cada 800 km            ultimo: mes 23 / 11900 km  toca: mes 25
PROXIMA  Revision de llantas cada 3 meses           ultimo: mes 22 / 11400 km  toca: mes 25
AL DIA   Filtro de aire      cada 12000 km          ultimo: mes 12 / 6200 km   toca: mes 36
AL DIA   Pastillas de freno  cada 10000 km          ultimo: mes 15 / 7900 km   toca: mes 36
AL DIA   Bateria             30000 km o 36 meses    ultimo: nunca              toca: mes 36
AL DIA   Kit de arrastre     cada 20000 km          ultimo: nunca              toca: mes 40

=========== PLAN DE LOS PROXIMOS 12 MESES ===========
Mes 24 (~12300 km): Cambio de aceite, Liquido de frenos -> $65
Mes 25 (~12800 km): Lubricar cadena, Revision de llantas -> $8
Mes 27 (~13800 km): Lubricar cadena -> $8
Mes 28 (~14300 km): Revision de llantas -> $0
Mes 29 (~14800 km): Lubricar cadena -> $8
Mes 30 (~15300 km): Cambio de aceite -> $35
Mes 31 (~15800 km): Lubricar cadena, Revision de llantas -> $8
Mes 33 (~16800 km): Lubricar cadena -> $8
Mes 34 (~17300 km): Revision de llantas -> $0
Mes 35 (~17800 km): Lubricar cadena -> $8
Mes 36 (~18300 km): Cambio de aceite, Filtro de aire, Pastillas de freno, Bateria -> $195

Costo estimado del ano: $343
Por sistema: motor $130, transmision $48, frenos $75, electrico $90
```
