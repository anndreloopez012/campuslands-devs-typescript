# Intermedio 19: Itinerario de viaje

**Tematica:** viajes
**Alumna:** Dulce Morales

## Problema

Revisar un itinerario de varios dias **antes** del viaje. Cada actividad tiene hora, duracion, lugar y costo. El programa detecta:

- choques de horario;
- falta de tiempo para moverse entre zonas distintas;
- actividades fuera del horario del lugar;
- dias que se pasan del presupuesto.

Al final muestra el gasto por dia y por categoria.

## Que hice

### Modelo (objetos anidados)

- `interface Dia` con su `ciudad` anidada (nombre y pais), su presupuesto y sus actividades.
- `interface Actividad` con su `Lugar` anidado (nombre, zona y horario de apertura y cierre).
- Union types: `Categoria` (transporte, comida, cultura, aventura, descanso) y `Severidad` (error o aviso).
- `interface Problema` y `ResumenDia` para los resultados.

### Reglas de negocio

- **Horario del lugar:** la actividad debe empezar despues de que abre y terminar antes de que cierra.
- **Choque:** una actividad no puede empezar antes de que termine la anterior.
- **Traslado:** si dos actividades seguidas son en **zonas distintas**, se necesitan al menos **30 minutos** entre ellas. En la misma zona puede ser seguida.
- **Presupuesto:** el gasto del dia no puede superar su presupuesto.
- **Dia cargado:** mas de 12 horas de actividades genera un aviso (no es error).
- **Validacion:** horas en formato `HH:MM` valido, duracion positiva y costo no negativo.

### Como use arrays tipados

- `sort`: ordenar las actividades por hora de inicio, sobre una copia.
- `slice` y `flatMap`: comparar cada actividad con la anterior y juntar todos los problemas.
- `reduce`: gasto, minutos ocupados, totales del viaje y conteo de errores.
- `map`, `filter` y `some`: resumen por dia, categorias con gasto y estado de cada dia.

### Casos probados

- **Dia 1 (normal, todo OK).** Dos casos limite:
  - el museo termina a las 12:00 y el almuerzo empieza a las 12:00 en la misma zona, y se acepta;
  - el almuerzo termina a las 13:15 y la subida al cerro (otra zona) empieza a las 13:45, **justo** los 30 min de traslado, y se acepta.
- **Dia 2 (errores):**
  - la caminata empieza a las 05:00 y el cerro abre a las 05:30;
  - solo hay 20 min para cambiar de zona;
  - el desayuno y el cafe se cruzan 20 min;
  - el gasto supera el presupuesto.
- **Dia 3:** el gasto supera el presupuesto y hay 12.3 h de actividades (aviso de dia cargado).

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/19-itinerario-viaje/index.ts
```

## Salida esperada

```text
====================== REVISION DEL ITINERARIO ======================

Dia 1 - Bogota, Colombia [OK]
  08:00-09:30 Tour a pie             Centro      $ 15  cultura
  10:00-12:00 Museo del Oro          Centro      $  5  cultura
  12:00-13:15 Almuerzo               Centro      $ 25  comida
  13:45-16:15 Subida al cerro        Cerros      $ 20  aventura
  Gasto $65 de $80 | 7.3 h ocupadas

Dia 2 - Bogota, Colombia [CON ERRORES]
  05:00-07:00 Caminata al amanecer   Cerros      $  0  aventura
  07:20-08:20 Desayuno tipico        Centro      $ 12  comida
  08:00-08:45 Cafe de especialidad   Centro      $  8  comida
  15:00-16:30 Vuelo a Cartagena      Aeropuerto  $ 95  transporte
  Gasto $115 de $60 | 5.3 h ocupadas
  X Caminata al amanecer (05:00-07:00) esta fuera del horario de Cerro Monserrate (05:30-17:00)
  X de Cerros a Centro solo hay 20 min (se necesitan 30)
  X Desayuno tipico y Cafe de especialidad se cruzan 20 min
  X gasto $115 supera el presupuesto del dia ($60)

Dia 3 - Cartagena, Colombia [CON ERRORES]
  07:00-08:00 Lancha a Baru          Baru        $ 45  transporte
  08:00-11:00 Snorkel                Baru        $ 60  aventura
  11:00-16:00 Descanso en la playa   Baru        $ 10  descanso
  16:30-17:45 Castillo San Felipe    San Felipe  $ 25  cultura
  18:15-20:15 Cena en la muralla     Centro CTG  $ 40  comida
  Gasto $180 de $120 | 12.3 h ocupadas
  X gasto $180 supera el presupuesto del dia ($120)
  ! 12.3 h de actividades: dia muy cargado

====================== RESUMEN DEL VIAJE ======================
Gasto total: $360 de $260 (faltan $100)
Por categoria:
  transporte  $140 (39%)
  comida      $ 85 (24%)
  aventura    $ 80 (22%)
  cultura     $ 45 (13%)
  descanso    $ 10 (3%)

Por corregir: 5 error(es) y 1 aviso(s)
```
