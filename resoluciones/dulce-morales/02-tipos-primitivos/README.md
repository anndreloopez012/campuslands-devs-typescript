# Ejercicio 02: Tipos primitivos

**Contexto:** Motos
**Alumna:** Dulce Morales

## Que hice

- Use los cinco tipos primitivos que pide el ejercicio:
  - `string`: `marca` y `modelo`.
  - `number`: `cilindrada` y `kilometraje`.
  - `boolean`: `estaEncendida`.
  - `null`: `placa`, un valor vacio a proposito (la moto aun no tiene placa).
  - `undefined`: `proximoMantenimiento`, que empieza sin asignar.
- Como `strictNullChecks` esta activo, uso el operador `??` para dar un texto por defecto cuando el valor es `null` o `undefined`.
- Reto extra: `necesitaMantenimiento` es `true` cuando el kilometraje supera los 3000 km, y en ese caso se imprime un aviso.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/02-tipos-primitivos/index.ts
```

## Salida esperada

```text
========= FICHA TECNICA =========
Marca:                 Yamaha
Modelo:                MT-07
Cilindrada:            689 cc
Kilometraje:           3450 km
Motor:                 Apagado
Placa:                 Sin placa asignada
Proximo mantenimiento: Lo antes posible
=================================
AVISO: la moto supera los 3000 km (450 km de mas). Necesita mantenimiento.
```
