# Intermedio 21: Bitacora de paracaidismo

**Tematica:** paracaidismo
**Alumna:** Dulce Morales

## Problema

Una escuela de paracaidismo guarda la bitacora de saltos de sus paracaidistas. El programa:

- revisa cada salto contra las reglas de seguridad: viento, altura minima y licencia necesaria para ese tipo de salto;
- agrupa los saltos validos por paracaidista;
- calcula a que licencia puede aspirar cada uno segun sus saltos y su tiempo de caida libre.

## Que hice

### Modelo

- Union types: `TipoSalto` (tandem, solo, freefly, wingsuit), `Licencia` (ninguna, A, B, C, D) y `MotivoRechazo`.
- `interface Paracaidista`, `Salto`, `Requisito` y `Resumen`.

### Uso de `Record`, `Map` y `Set`

- **`Record`** para las tablas de reglas: requisitos de cada licencia, licencia minima por tipo de salto, altura minima por tipo de salto, conteo de saltos por tipo y conteo de rechazos por motivo.
- **`Map`** para buscar paracaidistas por id, agrupar los saltos validos por paracaidista (con `reduce`) y contar saltos por mes.
- **`Set`** para las zonas de salto distintas de cada paracaidista y del total.
- `Exclude<Licencia, "ninguna">`: la tabla de requisitos solo tiene licencias reales.

### Reglas de negocio

| Licencia | Saltos | Caida libre |
|---|---|---|
| A | 25 | - |
| B | 50 | 30 min |
| C | 200 | 60 min |
| D | 500 | 180 min |

| Tipo de salto | Licencia minima | Altura minima |
|---|---|---|
| tandem | ninguna | 9,000 pies |
| solo | A | 3,500 pies |
| freefly | B | 10,000 pies |
| wingsuit | C | 12,000 pies |

- **Viento maximo:** 25 km/h.
- Los saltos y la caida libre **previos** a la bitacora tambien cuentan para la licencia.

### Casos probados

- **Andrea (limite):** con 3 saltos validos llega **exactamente** a 25 saltos y puede tramitar la licencia A. Uno de sus saltos tiene viento de **justo** 25 km/h y se acepta. Su salto "solo" se rechaza porque todavia no tiene licencia A.
- **Bruno:** llega a 200 saltos y 62 min de caida libre, asi que puede pasar a licencia C. Se le rechazan un salto con viento de 30 km/h y un wingsuit (necesita C, tiene B).
- **Carla:** tiene un wingsuit a 11,000 pies (minimo 12,000) que se rechaza.
- **Dario:** caso normal, sin cambios de licencia.
- **Invalido:** un salto de un paracaidista que no esta registrado.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/21-saltos-paracaidismo/index.ts
```

## Salida esperada

```text
==================== REVISION DE LA BITACORA ====================
X Salto # 4 Andrea  solo      -> licencia: solo requiere licencia A (tiene ninguna)
X Salto # 6 Bruno   freefly   -> viento: viento de 30 km/h (maximo 25)
X Salto # 8 Bruno   wingsuit  -> licencia: wingsuit requiere licencia C (tiene B)
X Salto #12 Carla   wingsuit  -> altura: 11000 pies (minimo 12000 para wingsuit)
X Salto #15 P9      solo      -> datos: paracaidista P9 no registrado
Saltos validos: 10 de 15

==================== RESUMEN POR PARACAIDISTA ====================

Andrea (licencia actual: ninguna)
  Saltos totales: 25 | caida libre: 17.5 min
  En esta bitacora: tandem 3 | zonas: Girardot, Melgar
  Licencia que le corresponde: A  << puede tramitar licencia A
  Para licencia B: faltan 25 saltos y 12.5 min de caida libre

Bruno (licencia actual: B)
  Saltos totales: 200 | caida libre: 62 min
  En esta bitacora: solo 1, freefly 3 | zonas: Girardot, Melgar, Pereira
  Licencia que le corresponde: C  << puede tramitar licencia C
  Para licencia D: faltan 300 saltos y 118 min de caida libre

Carla (licencia actual: C)
  Saltos totales: 342 | caida libre: 166.8 min
  En esta bitacora: freefly 1, wingsuit 1 | zonas: Girardot, Melgar
  Licencia que le corresponde: C
  Para licencia D: faltan 158 saltos y 13.2 min de caida libre

Dario (licencia actual: A)
  Saltos totales: 31 | caida libre: 25.5 min
  En esta bitacora: solo 1 | zonas: Girardot
  Licencia que le corresponde: A
  Para licencia B: faltan 19 saltos y 4.5 min de caida libre

==================== ESTADISTICAS ====================
Saltos validos por mes: mes 3: 4 | mes 4: 2 | mes 5: 4
Zonas de salto usadas: 3 (Girardot, Melgar, Pereira)
Rechazos: viento 1, altura 1, licencia 2, datos 1
```
