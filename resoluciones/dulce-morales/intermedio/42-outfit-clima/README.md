# Intermedio 42: Outfit segun clima

**Tematica:** ropa y clima
**Alumna:** Dulce Morales

## Problema

Con el pronostico de la semana y el closet de una persona, un servicio arma el outfit de cada dia:

- capas segun la temperatura;
- prenda impermeable si va a llover;
- ropa formal si hay un evento;
- sin repetir la misma prenda en dias seguidos (se esta lavando).

Al final, un reporte de que prendas se usaron mas y cuales nunca.

## Que hice

### Clases

- **`Closet<T extends { id }>`:** clase **generica** con tres `Map` **privados**: las prendas, el ultimo uso de cada una y cuantas veces se uso.
  - `estado(id, dia)` devuelve "disponible" o "en lavanderia";
  - `disponibles(dia)`, `usar()` y `conteoDeUsos()`.
- **`OutfitService`:** recibe el closet por constructor (inyeccion de dependencia).
  - `armar(pronostico)` arma el outfit;
  - `elegir()` (**privado**) elige la mejor prenda de cada capa.

### Fechas

Cada pronostico tiene un `Date`. El closet calcula los dias desde el ultimo uso con `getTime()` y muestra el dia de la semana con `getDay()`.

### Reglas

| Condicion | Que se agrega |
|---|---|
| Siempre | Base y calzado |
| Minima **menor** a 18 C | Capa media |
| Minima **menor** a 10 C, o lluvia de 50% o mas | Exterior (impermeable si llueve) |
| Lluvia de 50% o mas | Calzado impermeable |
| Evento formal | Todas las prendas deben ser formales |

- **Lavanderia:** una prenda usada no se puede usar al dia siguiente.
- **Preferencia:** primero la prenda de la formalidad del dia (casual en dias casuales), luego la de abrigo mas cercano al necesario.
- Si ninguna prenda disponible cumple, se avisa que **falta** esa capa.

### Casos probados

- **Limite de temperatura:** el lunes la minima es **exactamente** 18 C, asi que no lleva capa media (la regla es "menor a 18").
- **Limite de lluvia:** el martes la lluvia es **exactamente** 50%, asi que lleva chamarra y botas impermeables.
- **Evento formal:** el miercoles y el viernes llevan camisa, saco y zapatos formales; el viernes, ademas, abrigo largo por el frio.
- **Lavanderia:** las prendas se van alternando. La camiseta blanca se usa lunes, jueves y sabado, nunca en dias seguidos.
- **Falta una prenda:** el domingo hay una boda con lluvia y no existe ningun exterior formal e impermeable, asi que se avisa que falta.
- **Reporte:** cuenta los usos y lista las prendas que nunca se usaron.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/42-outfit-clima/index.ts
```

## Salida esperada

```text
===================== OUTFITS DE LA SEMANA =====================

lun 16/11 | 18-26 C, lluvia 10%, casual
  base      Camiseta blanca       (base)
  calzado   Tenis                 (calzado)

mar 17/11 | 14-21 C, lluvia 50%, casual
  base      Camiseta negra        (base)
  medio     Sueter de lana        (minima 14 C (< 18))
  exterior  Chamarra impermeable  (lluvia 50%)
  calzado   Botas                 (calzado impermeable)

mie 18/11 | 12-19 C, lluvia 20%, formal
  base      Camisa celeste        (base formal por el evento)
  medio     Saco azul             (minima 12 C (< 18))
  calzado   Zapatos               (calzado)

jue 19/11 | 7-15 C, lluvia 70%, casual
  base      Camiseta blanca       (base)
  medio     Sueter de lana        (minima 7 C (< 18))
  exterior  Chamarra impermeable  (lluvia 70%)
  calzado   Botas                 (calzado impermeable)

vie 20/11 | 8-16 C, lluvia 0%, formal
  base      Camisa celeste        (base formal por el evento)
  medio     Saco azul             (minima 8 C (< 18))
  exterior  Abrigo largo          (minima 8 C (< 10))
  calzado   Zapatos               (calzado)

sab 21/11 | 20-29 C, lluvia 0%, casual
  base      Camiseta blanca       (base)
  calzado   Tenis                 (calzado)

dom 22/11 | 16-24 C, lluvia 60%, formal
  base      Camisa celeste        (base formal por el evento)
  medio     Saco azul             (minima 16 C (< 18))
  calzado   Botines               (calzado impermeable)
  ! falta exterior (lluvia 60%): ninguna prenda disponible cumple (o esta en lavanderia)

===================== REPORTE DE USO =====================
Camiseta blanca       *** 3
Camisa celeste        *** 3
Saco azul             *** 3
Tenis                 ** 2
Botas                 ** 2
Zapatos               ** 2
Chamarra impermeable  ** 2
Sueter de lana        ** 2
Camiseta negra        * 1
Botines               * 1
Abrigo largo          * 1
Nunca usadas esta semana: Polo gris, Camisa blanca, Sandalias, Rompevientos, Hoodie
```
