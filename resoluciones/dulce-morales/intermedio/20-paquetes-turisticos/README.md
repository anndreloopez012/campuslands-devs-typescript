# Intermedio 20: Comparador de turismo

**Tematica:** turismo
**Alumna:** Dulce Morales

## Problema

Una agencia ofrece paquetes turisticos y cada grupo de viajeros tiene sus propias necesidades. El programa:

- calcula el **precio real** del paquete para ese grupo (adultos, ninos, temporada y descuento de grupo);
- descarta los que no cumplen lo que el grupo pide, explicando por que;
- ordena los que si cumplen por la mejor relacion **precio / valor**.

## Que hice

### Modelo (objetos anidados)

- `interface Paquete` con varios objetos anidados:
  - `destino` (ciudad y tipo);
  - `hotel` (nombre, estrellas `1 | 2 | 3 | 4 | 5` y noches);
  - una lista de `tours` y la lista de lo que `incluye`.
- `interface Grupo` con sus `requisitos` anidados. `destinos?` es opcional: si no se indica, sirve cualquier destino.
- Union types: `Temporada`, `Incluye` y `Destino`.
- `type Evaluacion`: union discriminada (`ok: true` con la cotizacion u `ok: false` con el motivo del descarte).

### Reglas de negocio

| Regla | Valor |
|---|---|
| Temporada alta (dic, ene, jul) | +35% |
| Temporada media (mar, abr, jun, ago) | +15% |
| Temporada baja (resto) | +0% |
| Nino | paga el 60% del precio de adulto |
| Descuento de grupo | 8% desde 4 personas |

- **Descartes**, en este orden:
  1. minimo de personas del paquete;
  2. destino no buscado;
  3. menos estrellas de las pedidas;
  4. falta algo que el grupo exige (vuelo, seguro...);
  5. se pasa del presupuesto.
- **Puntaje:** el valor del paquete (calificacion x 2 + estrellas + horas de tours / 4 + cosas incluidas) dividido entre el costo por persona por noche. Mayor puntaje = mejor relacion precio/valor.

### Como use arrays tipados

- `map`: evaluar cada paquete para un grupo.
- `filter` e `includes`: ver que le falta a un paquete y si el destino esta entre los buscados.
- `flatMap`: separar en un paso las opciones validas de los descartes.
- `reduce`: sumar las horas de tours.
- `sort`: ordenar por puntaje y, en empate, por precio.

### Casos probados

- **Familia Ortiz (2 adultos + 2 ninos, julio):** temporada alta, ninos al 60% y descuento de grupo. Gana Eje Cafetero, que esta pensado para familias.
- **Pareja Diaz (limite):** su presupuesto es **exactamente** $1,560, lo mismo que cuesta Caribe Total, y si entra. Amazonas se descarta porque pide minimo 4 personas.
- **Sol Ramirez:** sus requisitos son tan estrictos que **ningun** paquete cumple. Se explica el motivo de cada descarte.
- **Grupo invalido:** sin adultos y con mes 13.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/20-paquetes-turisticos/index.ts
```

## Salida esperada

```text
====================== COMPARADOR DE TURISMO ======================

### Familia Ortiz: 2 adulto(s) + 2 nino(s), mes 7, presupuesto $6,000.00
  Temporada: alta (+35%)
  1. Eje Cafetero Familiar  4* 6n | $2,980.80 - grupo $238.46 = $2,742.34 | $114.26/persona-noche | puntaje 18.3
  2. Caribe Total           4* 5n | $3,369.60 - grupo $269.57 = $3,100.03 | $155.00/persona-noche | puntaje 12.2
  3. San Andres Premium     5* 7n | $6,264.00 - grupo $501.12 = $5,762.88 | $205.82/persona-noche | puntaje 10.2
  - Santa Marta Express: hotel de 3 estrellas (pide 4+)
  - Amazonas Aventura: hotel de 3 estrellas (pide 4+)
  - Bogota Cultural: no incluye vuelo
  Recomendado: Eje Cafetero Familiar (Salento); sobran $3,257.66

### Pareja Diaz: 2 adulto(s), mes 10, presupuesto $1,560.00
  Temporada: baja (+0%)
  1. Santa Marta Express    3* 4n | $780.00 = $780.00 | $97.50/persona-noche | puntaje 14.5
  2. Caribe Total           4* 5n | $1,560.00 = $1,560.00 | $156.00/persona-noche | puntaje 12.2
  - Eje Cafetero Familiar: destino montana no buscado
  - Amazonas Aventura: minimo 4 personas (son 2)
  - Bogota Cultural: destino ciudad no buscado
  - San Andres Premium: cuesta $2,900.00 y el presupuesto es $1,560.00
  Recomendado: Santa Marta Express (Santa Marta); sobran $780.00

### Sol Ramirez: 1 adulto(s), mes 12, presupuesto $900.00
  Temporada: alta (+35%)
  Ningun paquete cumple los requisitos.
  - Caribe Total: no incluye seguro
  - Santa Marta Express: hotel de 3 estrellas (pide 4+)
  - Eje Cafetero Familiar: minimo 2 personas (son 1)
  - Amazonas Aventura: minimo 4 personas (son 1)
  - Bogota Cultural: no incluye vuelo, seguro
  - San Andres Premium: cuesta $1,957.50 y el presupuesto es $900.00

### Grupo sin adultos: 0 adulto(s) + 3 nino(s), mes 13, presupuesto $2,000.00
  X debe viajar al menos 1 adulto
  X mes 13 invalido
```
