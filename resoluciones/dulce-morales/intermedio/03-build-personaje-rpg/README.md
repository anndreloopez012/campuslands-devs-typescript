# Intermedio 03: Builder de personaje RPG

**Tematica:** videojuegos RPG
**Alumna:** Dulce Morales

## Que hice

### Modelo

- Union types: `Atributo`, `ClaseRPG`, `Ranura` y `Arquetipo`.
- `type Atributos = Readonly<Record<Atributo, number>>`: obliga a tener los cuatro atributos y no deja cambiarlos.
- `Partial<Atributos>`: para los bonus del equipo y los puntos asignados, donde solo aparecen algunos atributos.
- `interface DefinicionClase`, `Equipo` (con `requisito?` opcional), `PlanBuild` (lo que elige el jugador) y `BuildFinal` (lo que calcula el builder).
- `type ResultadoBuild`: union discriminada, una build valida o una lista de errores.

### Reglas de negocio

- Cada clase empieza con atributos base distintos y tiene un **atributo principal** que vale doble en el poder.
- Se ganan **3 puntos por nivel** a partir del nivel 2. El nivel va de 1 a 50.
- No se puede gastar mas puntos de los disponibles ni asignar puntos negativos.
- Solo una pieza por ranura (arma, armadura, accesorio).
- El **requisito** de un equipo se revisa sin contar los bonus del equipo (no vale usar la tunica para llegar al requisito del baston).
- **Vida** = 50 + vitalidad x 12 + nivel x 5.
- **Arquetipo:** Tanque, Danio fisico, Danio magico o Hibrido, segun los atributos finales.

### Funciones separadas

- **Validar:** `validarNivel`, `validarPuntos`, `validarRanuras`, `validarRequisitos`.
- **Transformar (puras):** `sumarAtributos` y `aplicarEquipo` crean objetos nuevos.
- **Calcular:** `calcularVida`, `calcularPoder`, `clasificarArquetipo`, `construirBuild`, `rankingPorPoder` (sobre una copia).
- **Mostrar:** `formatearAtributos` y `main`.

### Casos probados

- **Normal:** Brakka (guerrero) y Vex (picaro) son builds validas.
- **Limite:** Lyra gasta exactamente sus 12 puntos (queda en 0) y llega justo a inteligencia 25, el minimo del baston.
- **Invalidos:**
  - Torp: usa 12 puntos teniendo 9 y lleva dos armas.
  - Nim: no llega al requisito del baston.
  - Glitch: nivel 0.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/03-build-personaje-rpg/index.ts
```

## Salida esperada

```text
================ BUILDER RPG ================

OK  Brakka - guerrero nivel 10 [Tanque]
    FUE 30 | DES 4 | INT 3 | VIT 32
    Vida 484 | Poder 64 | Puntos libres 5
    Equipo: Espada runica, Cota de malla, Anillo de vida

OK  Lyra - mago nivel 5 [Danio magico]
    FUE 3 | DES 5 | INT 38 | VIT 9
    Vida 183 | Poder 80 | Puntos libres 0
    Equipo: Baston arcano, Tunica de seda

OK  Vex - picaro nivel 12 [Danio fisico]
    FUE 16 | DES 37 | INT 5 | VIT 20
    Vida 350 | Poder 85 | Puntos libres 0
    Equipo: Dagas gemelas, Amuleto sombra, Cota de malla

X   Torp - build invalida:
    - usa 12 puntos pero solo tiene 9
    - ranura "arma" repetida (Dagas gemelas)

X   Nim - build invalida:
    - Baston arcano requiere inteligencia 25 (tiene 20)

X   Glitch - build invalida:
    - nivel 0 fuera de rango (1-50)

================ RANKING POR PODER ================
1. Vex     picaro    Poder  85 | Vida 350
2. Lyra    mago      Poder  80 | Vida 183
3. Brakka  guerrero  Poder  64 | Vida 484
Builds validas: 3 de 6
```
