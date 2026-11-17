# Intermedio 59: Comparador de autos premium

**Tematica:** autos de lujo
**Alumna:** Dulce Morales

## Problema

Un comparador junta los datos de cada auto desde tres servicios remotos (simulados):

- **ficha tecnica** del fabricante;
- **calificacion** de resenas;
- **precio** de varios concesionarios.

La ficha y las resenas se piden en paralelo. Si un servicio falla, se usa lo que llego y se avisa. El precio se toma del **primer** concesionario que responda bien; si todos fallan, se informa. Al final se ordenan los autos segun las prioridades de cada tipo de comprador.

## Que hice

### Tres formas de combinar promesas

| Para que | Metodo | Por que |
|---|---|---|
| Ficha y resenas de un auto | `Promise.allSettled` | Se quiere todo lo que llegue, aunque algo falle |
| Precio entre concesionarios | `Promise.any` | Basta con el primero que responda bien. Si **todos** fallan lanza un `AggregateError`, que se atrapa y se convierte en aviso |
| Todos los autos a la vez | `Promise.all` | `armarAuto` nunca falla: convierte los errores en avisos |

### Errores tipados

`ErrorServicio` guarda que servicio fallo, para que modelo y por que. En el `catch` se revisa con `instanceof`. El `AggregateError` de `Promise.any` trae la lista de errores en `e.errors`.

### Datos parciales

`Auto` tiene `ficha: Ficha | null`, `calificacion: number | null` y `precio: ... | null`. Un dato que no llego queda en `null`, y el auto se marca como "datos incompletos".

### Puntaje segun prioridades

- Cada criterio da de 0 a 10 puntos (`puntos()`, un `switch` sobre `Prioridad`). Un criterio sin dato da 0.
- Cada comprador define cuanto le importa cada criterio con un `Partial<Record<Prioridad, number>>`.
- El puntaje es la suma de los puntos de cada criterio multiplicados por su peso.

### Casos probados

- **Primero que responde:** para el Porsche Taycan, Prestige responde primero ($115,500) y gana, aunque AutoLux tenia un precio menor pero tardo mas. Asi funciona `Promise.any`.
- **Todos fallan:** ningun concesionario tiene precio del Audi RS7, asi que se recibe un `AggregateError` con 2 errores.
- **Servicio caido:**
  - el AMG GT no tiene resenas;
  - el fabricante del Lexus LC no responde, asi que no hay ficha y queda ultimo en los rankings.
- **Rankings distintos:** la familia prefiere el BMW M5 (espacio y precio); quien busca velocidad prefiere el Taycan.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/59-comparador-autos/index.ts
```

## Salida esperada

```text
================ CONSULTANDO SERVICIOS (todos los autos en paralelo) ================

Porsche Taycan: 616 hp, 0-100 en 3.2 s, electrico, 407 L | 4.7 estrellas | $115,500 (Prestige)

BMW M5: 617 hp, 0-100 en 3.3 s, 9 km/L, 530 L | 4.5 estrellas | $120,000 (AutoLux)

Mercedes AMG GT: 577 hp, 0-100 en 3.2 s, 8.2 km/L, 456 L | sin resenas | $136,000 (Elite Motors)
   ! resenas (Mercedes AMG GT): sin resenas publicadas

Audi RS7: 591 hp, 0-100 en 3.6 s, 8.5 km/L, 535 L | 4.4 estrellas | sin precio
   ! ningun concesionario tiene precio (2 fallaron)

Lexus LC: sin ficha | sin resenas | $99,000 (Prestige)
   ! fabricante (Lexus LC): no respondio
   ! resenas (Lexus LC): sin resenas publicadas

================ RANKING: Familia que viaja ================
1. BMW M5           63.9 pts
2. Porsche Taycan   61.4 pts
3. Audi RS7         55 pts  (datos incompletos)
4. Mercedes AMG GT  42.9 pts  (datos incompletos)
5. Lexus LC         16.4 pts  (datos incompletos)

================ RANKING: Amante de la velocidad ================
1. Porsche Taycan   67.2 pts
2. BMW M5           65.8 pts
3. Audi RS7         61.3 pts  (datos incompletos)
4. Mercedes AMG GT  56 pts  (datos incompletos)
5. Lexus LC         0 pts  (datos incompletos)
```
