# Intermedio 35: Estrategia de pit stop

**Tematica:** carreras
**Alumna:** Dulce Morales

## Problema

Antes de una carrera de 50 vueltas, el equipo compara estrategias de paradas en pits:

- cada compuesto de llanta tiene un **ritmo base**, se **degrada** (pierde tiempo) en cada vuelta y tiene una **vida maxima**;
- cada parada cuesta 22 segundos;
- el reglamento obliga a usar al menos **dos compuestos distintos**.

El programa valida cada estrategia, simula su tiempo total y recomienda la mejor.

## Que hice

### Clases

- **`Estrategia`:** guarda una lista de *stints* (tramos con un mismo compuesto).
  - `validar()`: devuelve una `Validacion` con todos los errores encontrados.
  - `tiempoTotal()`: suma el tiempo de cada stint (con un metodo **privado** `tiempoStint`) mas el tiempo de las paradas.
  - `vueltasDeParada()`: en que vuelta se hace cada parada.
- **`Comparador<T>`:** clase **generica** que recibe una funcion de puntaje y ordena cualquier lista por ese puntaje.

### Tipos y type guards

- `type Compuesto`: literal type ("blando" | "medio" | "duro").
- `type Validacion`: union discriminada (`valida: true` o `valida: false` con la lista de errores).
- **Type guard** `esValida`.
- `Record<Compuesto, DatosLlanta>`: la tabla de cada compuesto.

### Reglas

| Compuesto | Ritmo base | Degradacion por vuelta | Vida maxima |
|---|---|---|---|
| blando | 90.0 s | +0.12 s | 18 vueltas |
| medio | 90.6 s | +0.06 s | 30 vueltas |
| duro | 91.2 s | +0.03 s | 45 vueltas |

- **Tiempo de un stint:** suma de (ritmo base + degradacion x vueltas de uso).
- **Validacion:**
  - las vueltas deben sumar 50;
  - minimo 2 compuestos distintos;
  - cada stint debe tener vueltas validas y no pasar la vida maxima del compuesto.

### Casos probados

- **Limite:** la estrategia "blando -> medio -> blando" usa el blando **exactamente** 18 vueltas (su vida maxima), y es valida.
- **Invalidas:**
  - sin parar (un solo compuesto y 50 vueltas de duro, mas que su vida);
  - blando de 25 vueltas;
  - vueltas mal contadas (suman 45).
- **Resultado:** las estrategias validas quedan muy parejas (diferencias de 1 a 2 s). La de 3 paradas pierde mas de 10 s por el tiempo extra en pits.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/35-pitstop-carreras/index.ts
```

## Salida esperada

```text
================ ESTRATEGIAS PARA 50 VUELTAS (parada = 22 s) ================
X Sin parar con duros
    - debe usar al menos 2 compuestos distintos
    - stint 1: 50 vueltas con duro (maximo 45)
X Blando demasiado largo
    - stint 1: 25 vueltas con blando (maximo 18)
X Mal contada
    - suma 45 vueltas y la carrera tiene 50

================ RANKING DE ESTRATEGIAS VALIDAS ================
1. 2 paradas: blando -> blando -> medio  76:32.900  mejor       paradas en vuelta 14, 28
     blando 14v | blando 14v | medio 22v
2. 1 parada: medio -> duro               76:34.000  +1.100 s    paradas en vuelta 22
     medio 22v | duro 28v
3. 1 parada: blando -> duro              76:34.450  +1.550 s    paradas en vuelta 15
     blando 15v | duro 35v
4. 2 paradas: blando -> medio -> blando  76:34.820  +1.920 s    paradas en vuelta 18, 40
     blando 18v | medio 22v | blando 10v
5. 3 paradas: casi todo blando           76:43.680  +10.780 s   paradas en vuelta 13, 26, 38
     blando 13v | medio 13v | blando 12v | blando 12v

Recomendada: 2 paradas: blando -> blando -> medio. Gana 10.780 s sobre la peor estrategia valida.
```
