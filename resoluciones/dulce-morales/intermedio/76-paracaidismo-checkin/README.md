# Intermedio 76 - Check-in de salto

**Tematica:** paracaidismo
**Alumna:** Dulce Morales

## Problema

El mostrador de check-in de un centro de paracaidismo. Hay que validar a cada persona segun su tipo de
salto y el clima del dia, y despues armar los vuelos del avion (loads) sin pasarse del cupo ni del peso.

## Que hice

- `CheckinFormDTO` es el formulario, con los numeros como texto y las casillas como booleanos.
- `Participante` es una union discriminada por `tipo`. Un `tandem` no tiene licencia, un `aff` tiene
  nivel y un `licenciado` tiene licencia, saltos y dias desde su ultimo salto.
- `Checkin` es otra union: `aprobado` (con notas) o `rechazado` (con todos los motivos juntos).
- `validar(dto, clima)` aplica las reglas generales y las propias de cada tipo.
- `RepoCheckins` es un repositorio en memoria. Usa `flatMap` con la union para separar aprobados y
  rechazados sin casts.
- `slotsDe` calcula cuantos lugares ocupa cada persona en el avion (instructores incluidos).
  `armarLoads` reparte con *first fit*: cada grupo entra completo en el primer vuelo donde quepa por
  cupo y por peso.
- El reporte muestra totales por tipo y agrupa los motivos de rechazo.

## Reglas

| Regla | Valor |
|---|---|
| Edad minima | 18 |
| Peso maximo | tandem 100 kg, AFF 110 kg, licenciado 120 kg (inclusivo) |
| Documentos | deslinde siempre; certificado medico para tandem y AFF |
| Viento maximo | tandem 25, AFF 22, licencia A 25, B 30, C 35, D 40 km/h |
| Nubes | base minima de 4000 pies |
| Licencias | A >= 25 saltos, B >= 50, C >= 200, D >= 500 |
| Recurrencia | mas de 60 dias sin saltar obliga a saltar con coach (60 exactos no) |
| Instructores | tandem +1, AFF niveles 1-2 +2, AFF 3-7 +1, recurrencia +1 (85 kg cada uno) |
| Avion | 10 lugares y 750 kg |

## Casos probados

- **Sabado (viento 24):**
  - Rechazos: 101 kg en tandem (sobrepeso), menor de edad, faltan documentos, alumno AFF con viento
    alto, licencia B con pocos saltos y tipo de salto desconocido.
  - Limites aprobados: tandem de 100 kg justos y licenciados con 60 dias (sin coach) y con 61 (con coach).
  - Load 1 se llena por peso. Despues, Fer cabe en el hueco del load 1 gracias a *first fit*.
- **Domingo (calma):** AFF nivel 1 con 2 instructores, AFF nivel 5 con 1, un nivel invalido y un
  sobrepeso de 111 kg.
- **Lunes (nublado):** nubes a 3500 pies, nadie salta y no hay vuelos.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/76-paracaidismo-checkin/index.ts
```

## Salida esperada

```text

########## Sabado: viento 24 km/h, nubes a 6500 pies ##########
=== Check-in ===
  OK  Lucia   tandem
  NO  Ramon   peso 101 kg supera el maximo de 100 kg para tandem
  OK  Sofi    tandem
  NO  Mateo   menor de 18 anios
  NO  Eva     falta firmar el deslinde; falta certificado medico
  NO  Diego   viento 24 km/h > 22 para alumnos
  OK  Karla   licenciado
  NO  Hugo    licencia B requiere 50 saltos (tiene 40)
  OK  Ines    licenciado  (90 dias sin saltar: salto de recurrencia con coach)
  OK  Pablo   licenciado
  NO  Toni    tipo de salto "base jump" desconocido
  OK  Ana     tandem
  OK  Beto    tandem
  OK  Caro    tandem
  OK  Dani    licenciado  (61 dias sin saltar: salto de recurrencia con coach)
  OK  Fer     licenciado

=== Manifiesto (cupo 10, peso max 750 kg) ===
  Load 1: 9/10 lugares, 697 kg
     Lucia (tandem)               62 kg
       instructor TI de Lucia     85 kg
     Sofi (tandem)                100 kg
       instructor TI de Sofi      85 kg
     Karla (lic A)                58 kg
     Ines (lic C)                 64 kg
       coach de Ines              85 kg
     Pablo (lic D)                88 kg
     Fer (lic C)                  70 kg
  Load 2: 8/10 lugares, 630 kg
     Ana (tandem)                 55 kg
       instructor TI de Ana       85 kg
     Beto (tandem)                95 kg
       instructor TI de Beto      85 kg
     Caro (tandem)                68 kg
       instructor TI de Caro      85 kg
     Dani (lic B)                 72 kg
       coach de Dani              85 kg

=== Reporte ===
  Check-ins: 16 | aprobados: 10 (tandem=5, aff=0, licenciado=5) | rechazados: 6
  Motivos de rechazo: "peso 101..." x1, "menor de..." x1, "falta firmar..." x1, "falta certificado..." x1, "viento 24..." x1, "licencia B..." x1, "tipo de..." x1

########## Domingo (calma): viento 12 km/h, nubes a 7000 pies ##########
=== Check-in ===
  OK  Diego   aff  (niveles 1-2 saltan con 2 instructores)
  OK  Mia     aff
  NO  Leo     nivel AFF debe ser 1 a 7
  NO  Rita    peso 111 kg supera el maximo de 110 kg para aff

=== Manifiesto (cupo 10, peso max 750 kg) ===
  Load 1: 5/10 lugares, 395 kg
     Diego (AFF 1)                80 kg
       JM1 de Diego               85 kg
       JM2 de Diego               85 kg
     Mia (AFF 5)                  60 kg
       JM de Mia                  85 kg

=== Reporte ===
  Check-ins: 4 | aprobados: 2 (tandem=0, aff=2, licenciado=0) | rechazados: 2
  Motivos de rechazo: "nivel AFF..." x1, "peso 111..." x1

########## Lunes (nublado): viento 8 km/h, nubes a 3500 pies ##########
=== Check-in ===
  NO  Pablo   nubes a 3500 pies (minimo 4000)

=== Manifiesto (cupo 10, peso max 750 kg) ===
  (sin vuelos: nadie aprobado)

=== Reporte ===
  Check-ins: 1 | aprobados: 0 (tandem=0, aff=0, licenciado=0) | rechazados: 1
  Motivos de rechazo: "nubes a..." x1
```
