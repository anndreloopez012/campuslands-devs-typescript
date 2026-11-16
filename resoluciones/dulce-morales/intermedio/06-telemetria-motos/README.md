# Intermedio 06: Telemetria de motos deportivas

**Tematica:** motos y mecanica de motos
**Alumna:** Dulce Morales

## Problema

Durante una sesion en pista, cada moto envia lecturas de sus sensores. El programa descarta las lecturas con error de sensor, calcula el rendimiento y avisa a los mecanicos de problemas: motor caliente, presion de llantas y sobre-revolucion.

## Que hice

### Modelo

- Union types: `Severidad` (info, advertencia, critico) y `EstadoMoto` (OK, Revisar, Detener).
- `interface Moto` (con su `rpmLimite`, la linea roja), `Lectura`, `Alerta` y `ResumenTelemetria`, todo `readonly`.
- `type Rango` y `RANGOS_SENSOR` (un `Record`): los valores fisicamente posibles de cada sensor.

### Reglas de negocio

- **Error de sensor:** una lectura con cualquier valor fuera de lo fisicamente posible (por ejemplo, 999 km/h) se descarta.
- **Temperatura del motor:** advertencia desde 105 C, critico desde 115 C.
- **Presion de llantas:** correcta entre 28 y 36 psi. Fuera de ese rango, advertencia.
- **Linea roja:** si la moto pasa mas del 10% del tiempo sobre su `rpmLimite`, es critico. Menos que eso, solo informativo.
- **Estado final:** cualquier alerta critica significa Detener; si hay alguna advertencia, Revisar; si no, OK.
- **Ranking de ritmo:** por velocidad promedio, solo motos con lecturas validas.

### Funciones separadas

- **Validar:** `dentroDeRango`, `esLecturaValida`.
- **Calcular (puras):** `maximo`, `promedio`, `porcentajeSobreLimite`, `alertasTemperatura`, `alertasPresion`, `alertasRpm`, `alertasDescartes`, `decidirEstado`, `analizarMoto`, `rankingRitmo`.
- **Mostrar:** `imprimirResumen` y `main`.
- `maximo` y `promedio` devuelven 0 con listas vacias, para evitar `-Infinity` o `NaN`.

### Casos probados

| Piloto | Caso | Resultado |
|---|---|---|
| Carla Diaz | Sesion limpia | OK |
| Leo Santos | Motor a 117 C y llanta a 26.8 psi | Detener |
| Rita Gomez | 50% del tiempo sobre la linea roja y 1 lectura de 999 km/h | Detener |
| Tito Ruiz | Limite: todas las lecturas fallan (sensor desconectado) | Detener, sin calculos |
| Ivan Mora | Limite: temperatura **exacta** de 105 C | Revisar |
| Noa Vidal | Limite: presion **exacta** de 28 psi | OK, sin alerta |

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/06-telemetria-motos/index.ts
```

## Salida esperada

```text
=============== TELEMETRIA DE SESION ===============

[OK] Carla Diaz - Yamaha R1
  Vel. max 288 km/h | Vel. prom 192.6 km/h | Inclinacion max 52 grados
  Temp. max 101 C | Sobre linea roja 0% | Lecturas 5 validas, 0 descartadas

[Detener] Leo Santos - Ducati Panigale V4
  Vel. max 301 km/h | Vel. prom 203.6 km/h | Inclinacion max 55 grados
  Temp. max 117 C | Sobre linea roja 0% | Lecturas 5 validas, 0 descartadas
  X critico: motor a 117 C (critico >= 115)
  ! advertencia: presion baja: 26.8 psi (minimo 28)

[Detener] Rita Gomez - Kawasaki ZX-10R
  Vel. max 250 km/h | Vel. prom 171.5 km/h | Inclinacion max 50 grados
  Temp. max 104 C | Sobre linea roja 50% | Lecturas 4 validas, 1 descartadas
  ! advertencia: 1 de 5 lecturas con error de sensor
  X critico: 50% del tiempo sobre 14000 rpm (maximo 10%)

[Detener] Tito Ruiz - Honda CBR1000RR
  Sin lecturas validas: no se puede evaluar el rendimiento
  X critico: 2 de 2 lecturas con error de sensor

[Revisar] Ivan Mora - BMW S1000RR
  Vel. max 280 km/h | Vel. prom 204.8 km/h | Inclinacion max 49 grados
  Temp. max 105 C | Sobre linea roja 0% | Lecturas 4 validas, 0 descartadas
  ! advertencia: motor a 105 C (advertencia >= 105)

[OK] Noa Vidal - Aprilia RSV4
  Vel. max 270 km/h | Vel. prom 192.5 km/h | Inclinacion max 46 grados
  Temp. max 98 C | Sobre linea roja 0% | Lecturas 4 validas, 0 descartadas

=============== RANKING DE RITMO ===============
1. Ivan Mora   204.8 km/h promedio [Revisar]
2. Leo Santos  203.6 km/h promedio [Detener]
3. Carla Diaz  192.6 km/h promedio [OK]
4. Noa Vidal   192.5 km/h promedio [OK]
5. Rita Gomez  171.5 km/h promedio [Detener]

Estado del box: 2 OK, 1 revisar, 3 detener
```
