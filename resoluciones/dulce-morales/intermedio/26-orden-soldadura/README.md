# Intermedio 26: Control de soldadura

**Tematica:** soldadura
**Alumna:** Dulce Morales

## Problema

Un taller de estructuras metalicas recibe ordenes de soldadura. Cada orden pide un proceso (MIG, TIG o electrodo) sobre un material y un espesor, con un amperaje programado. El programa:

- asigna cada orden a un soldador **certificado** para ese proceso y espesor;
- revisa que el amperaje este dentro del rango correcto;
- descuenta el consumible que usa la orden;
- resume la carga de cada soldador.

## Que hice

### Modelo

- Union types: `Proceso`, `Material` y `Consumible`.
- `interface Soldador`: sus certificaciones son un `Set<Proceso>`, mas el espesor maximo que puede soldar y sus horas disponibles.
- `interface Orden` y `type Resultado`: union discriminada entre una orden asignada (con soldador, horas y consumible) y una rechazada (con su motivo).

### Uso de `Record`, `Map` y `Set`

- **`Record` anidado** (`Record<Proceso, Record<Material, ...>>`): el rango de amperaje y el consumible de cada combinacion. `null` marca una combinacion no permitida.
- **`Record`** para los metros por hora de cada proceso, el inventario de consumibles y los metros soldados por proceso.
- **`Set`:** las certificaciones de cada soldador (`has` para revisar).
- **`Map`:** las horas usadas por soldador y las ordenes de cada soldador (agrupadas con `reduce`).

### Reglas de negocio

1. Espesor y metros de cordon deben ser mayores que 0.
2. La combinacion proceso-material debe estar permitida (el electrodo no se usa en aluminio).
3. El amperaje debe estar dentro del rango de esa combinacion.
4. Debe haber un soldador certificado en el proceso y con espesor maximo suficiente.
5. Debe alcanzar el consumible: 0.2 kg por metro de cordon.
6. **Tiempo:** metros / velocidad del proceso (MIG 6 m/h, TIG 2 m/h, electrodo 3 m/h). Se asigna al certificado con mas horas libres que alcance.

### Casos probados

- **Limite:** la orden S-04 usa **exactamente** 200 A, el maximo del rango TIG-aluminio, y se acepta.
- **Rechazos:**
  - amperaje fuera de rango (S-05);
  - electrodo sobre aluminio (S-06);
  - nadie certificado en TIG para 15 mm (S-07);
  - se acaba la varilla ER308 (S-08);
  - nadie tiene las 5 h libres que pide (S-09);
  - espesor 0 y metros negativos (S-10).
- **Inventario:** la varilla ER308 queda en 0.8 kg y el programa avisa que hay que reabastecer.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/26-orden-soldadura/index.ts
```

## Salida esperada

```text
==================== ORDENES DE SOLDADURA ====================
OK S-01 MIG       acero       8 mm 180 A -> Raul  4 h, alambre ER70S
OK S-02 TIG       inoxidable  4 mm 120 A -> Lina  3 h, varilla ER308
OK S-03 electrodo acero      22 mm 150 A -> Omar  3 h, electrodo E6013
OK S-04 TIG       aluminio    6 mm 200 A -> Lina  2 h, varilla ER4043
X  S-05 MIG       inoxidable  5 mm 230 A -> 230 A fuera del rango 80-200 A
X  S-06 electrodo aluminio    6 mm 100 A -> electrodo no se usa en aluminio
X  S-07 TIG       acero      15 mm 150 A -> nadie certificado en TIG para 15 mm
X  S-08 TIG       inoxidable  3 mm 100 A -> faltan varilla ER308: necesita 1 kg, hay 0.8 kg
X  S-09 MIG       acero      10 mm 200 A -> necesita 5 h y ningun certificado tiene tiempo
X  S-10 MIG       acero       0 mm 150 A -> espesor y metros deben ser mayores que 0

==================== CARGA POR SOLDADOR ====================
Raul  4/8 h | MIG/electrodo hasta 20 mm | ordenes: S-01
Lina  5/8 h | TIG/MIG hasta 12 mm | ordenes: S-02, S-04
Omar  3/6 h | electrodo hasta 25 mm | ordenes: S-03

==================== CONSUMIBLES ====================
alambre ER70S    20 kg -> 15.2 kg
varilla ER308    2 kg -> 0.8 kg  << reabastecer
varilla ER4043   3 kg -> 2.2 kg
electrodo E6013  6 kg -> 4.2 kg

Asignadas 4 de 10 | metros por proceso: MIG 24, TIG 10, electrodo 9
```
