# Ejercicio 08: Union Types

**Contexto:** Vehiculos deportivos e hiperdeportivos
**Alumna:** Dulce Morales

## Que hice

- `VehiculoBase` guarda lo comun: marca, modelo y velocidad maxima.
- Cada variante tiene la propiedad discriminante `tipo` y sus propias propiedades:
  - `Deportivo` (`tipo: "deportivo"`): `traccion` y `usoDiario`.
  - `Hiperdeportivo` (`tipo: "hiperdeportivo"`): `unidadesFabricadas` y `materialChasis`.
  - `ElectricoAltoRendimiento` (`tipo: "electrico"`, reto extra): `autonomiaKm` y `ceroACienSegundos`.
- `Vehiculo = Deportivo | Hiperdeportivo | ElectricoAltoRendimiento` es la union.
- `describirVehiculo(vehiculo: Vehiculo)` acepta la union y usa `switch (vehiculo.tipo)`. Dentro de cada `case` TypeScript ya sabe que variante es, asi que no hacen falta casteos.
- En el `default` uso el tipo `never`: si mas adelante se agrega una variante y se olvida su `case`, el codigo no compila.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/08-union-types/index.ts
```

## Salida esperada

```text
==================== GARAJE ====================
DEPORTIVO      | Porsche 911 Carrera (293 km/h) - traccion trasera, apto para uso diario.
HIPERDEPORTIVO | Bugatti Chiron (420 km/h) - solo 500 unidades, chasis de fibra de carbono.
ELECTRICO      | Rimac Nevera (412 km/h) - 490 km de autonomia, 0-100 en 1.85 s.
DEPORTIVO      | Nissan GT-R (315 km/h) - traccion integral, pensado para pista.
================================================
```
