# Intermedio 22: Agenda de tatuajes

**Tematica:** tatuajes
**Alumna:** Dulce Morales

## Problema

Un estudio de tatuajes recibe solicitudes de cita. Cada artista trabaja ciertos estilos y tiene su propio horario por dia. El programa acepta o rechaza cada solicitud y arma la agenda semanal de cada artista con lo que se va a cobrar.

## Que hice

### Modelo

- Union types: `Estilo`, `Tamano`, `DiaSemana` y `Horario` (una tupla `[inicio, fin]` o `null` si ese dia no trabaja).
- `interface Artista`, `Solicitud` y `Cita`.
- `type Respuesta`: union discriminada (`ok: true` con la cita u `ok: false` con el motivo).

### Uso de `Record`, `Map` y `Set`

- **`Record<DiaSemana, Horario>`:** el horario de cada artista, con los 6 dias obligatorios.
- **`Record<Tamano, number>`:** cuantas horas toma cada tamano (mini 1 h, mediano 2 h, grande 4 h, manga 6 h).
- **`Set<Estilo>`:** los estilos que hace cada artista (`has` para revisar rapido) y los estilos agendados en la semana.
- **`Map<string, Cita[]>`:** la agenda de cada artista por id, y otro `Map` para buscar artistas.

### Reglas de negocio

Se revisan en este orden:

1. el artista existe;
2. el cliente tiene **18 anios o mas**;
3. el artista hace ese estilo;
4. las sesiones de **3 h o mas** necesitan anticipo pagado;
5. el artista trabaja ese dia y la cita cabe **completa** en su horario;
6. no se cruza con otra cita (terminar a la hora en que otra empieza **no** es cruce);
7. el artista no pasa de **6 h** de trabajo en el dia.

**Costo** = horas x tarifa del artista.

### Casos probados

| # | Cliente | Caso | Resultado |
|---|---|---|---|
| 3 | Ines | Limite: tiene **18 anios exactos** | Aceptada |
| 4 | Mateo | 17 anios | Rechazada |
| 5 | Sara | Se cruza con la cita de Tomas | Rechazada |
| 6 | Diego | Luna no hace realismo | Rechazada |
| 7 | Paula | Manga de 6 h sin anticipo | Rechazada |
| 8 | Camilo | Limite: con esta cita Rex llega **exacto** a 6 h el martes | Aceptada |
| 9 | Lucia | Rex ya tiene 6 h ese dia | Rechazada |
| 10 | Marta | Luna no trabaja el miercoles | Rechazada |
| 11 | Bruno | Se pasa del cierre del sabado | Rechazada |
| 13 | Nico | Artista que no existe | Rechazada |
| 14 | Gabi | Limite: termina **exacto** a la hora de cierre | Aceptada |

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/22-agenda-tatuajes/index.ts
```

## Salida esperada

```text
====================== AGENDA DE LA SEMANA ======================

Luna (fine line, acuarela) - $60/h
  lun (3 h):
    10:00-11:00 Valeria  fine line   mini     $60
    11:00-13:00 Ines     acuarela    mediano  $120
  sab (1 h):
    13:00-14:00 Gabi     fine line   mini     $60
  Total de la semana: 3 cita(s), $240

Rex (blackwork, tradicional, realismo) - $80/h
  mar (6 h):
    11:00-15:00 Tomas    realismo    grande   $320
    16:00-18:00 Camilo   tradicional mediano  $160
  sab (6 h):
    12:00-18:00 Elena    realismo    manga    $480
  Total de la semana: 3 cita(s), $960

====================== SOLICITUDES RECHAZADAS ======================
# 4 Mateo   cliente de 17 anios (minimo 18)
# 5 Sara    se cruza con la cita de Tomas (11:00-15:00)
# 6 Diego   Luna no hace realismo (hace fine line, acuarela)
# 7 Paula   sesion de 6 h requiere anticipo
# 9 Lucia   Rex ya tiene 6 h el mar (maximo 6)
#10 Marta   Luna no trabaja el mie
#11 Bruno   12:00-16:00 fuera del horario (10:00-14:00)
#13 Nico    artista A9 no existe

Aceptadas 6 de 14 | estilos agendados: acuarela, fine line, realismo, tradicional
```
