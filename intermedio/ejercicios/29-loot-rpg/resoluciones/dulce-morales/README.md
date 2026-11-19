# Intermedio 29: Sistema de loot RPG

**Tematica:** videojuegos RPG
**Alumna:** Dulce Morales

## Problema

Al derrotar enemigos, el juego tira "dados" para decidir que objetos caen (*loot*). Funciona asi:

- cada rareza tiene un peso de probabilidad;
- existe un **sistema de lastima** (*pity*): si pasan muchas tiradas sin un legendario, la siguiente lo garantiza;
- el loot se reparte en el grupo segun lo que cada clase puede usar;
- lo que nadie puede usar, o que sale repetido, se vende por oro.

## Que hice

### Modelo

- Union types: `Rareza`, `TipoObjeto` y `Clase`.
- `interface Objeto`, `Jugador`, `Tirada` y `Reparto`.

### Uso de `Record`, `Map` y `Set`

- **`Record<Rareza, number>`:** el peso de cada rareza (comun 60, rara 28, epica 10, legendaria 2) y el oro que vale cada una.
- **`Record<Rareza, Objeto[]>`:** el catalogo de objetos por rareza.
- **`Record<Clase, Set<TipoObjeto>>`:** que tipos de objeto puede usar cada clase (`has` para revisar).
- **`Map<string, Objeto[]>`:** el inventario de cada jugador.
- **`reduce`:** la suma de los pesos para elegir una rareza.

### Reglas de negocio

1. **Tirada:**
   - se elige una rareza segun su peso (mas peso, mas probable);
   - luego se elige un objeto de esa rareza.
2. **Lastima:** la tirada numero 10 sin legendario da un legendario seguro. Al salir un legendario, el contador vuelve a 0.
3. **Reparto:**
   - el objeto va a quien lo puede usar y tiene menos objetos;
   - no se reparten objetos repetidos a la misma persona (excepto pociones, que se acumulan).
4. **Venta:** si nadie del grupo puede usar el objeto, o todos los que podrian ya lo tienen, se vende por oro.

### Generador con semilla

Para que el resultado se pueda revisar, en vez de `Math.random()` uso un generador **con semilla** (*Mulberry32*): con la misma semilla (2026) siempre salen las mismas tiradas.

`elegirPorPeso` es una funcion **generica** (`<K extends string>`). Sirve para elegir de cualquier `Record` de pesos.

### Casos probados

- **Limite de lastima:** en las primeras 9 tiradas no sale ningun legendario, asi que la tirada **10 exacta** (Troll) da el Baston del Vacio garantizado.
- **Repetido:** sale una segunda "Espada oxidada". El unico que puede usarla (Thorne) ya la tiene, asi que se vende.
- **Nadie lo usa:** las dos hachas se venden porque ninguna clase del grupo usa hachas.
- **Pociones:** se acumulan (Sena recibe dos).

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/29-loot-rpg/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
==================== LOOT DE LA MAZMORRA (semilla 2026) ====================
 1. Lobo         comun      Espada oxidada
 2. Lobo         rara       Coraza de hierro
 3. Goblin       comun      Pocion menor
 4. Goblin       rara       Baston de roble
 5. Esqueleto    comun      Pocion menor
 6. Orco         comun      Tunica de lino
 7. Orco         comun      Pocion menor
 8. Arana        comun      Espada oxidada
 9. Golem        comun      Hacha de lenador
10. Troll        legendaria Baston del Vacio  << garantizado por lastima
11. Bandido      comun      Pocion menor
12. Bandido      comun      Hacha de lenador
13. Dragon joven epica      Tunica astral
Por rareza: comun 9, rara 2, epica 1, legendaria 1

==================== REPARTO ====================
Thorne  (guerrero) 3 objeto(s): Espada oxidada, Coraza de hierro, Pocion menor
Lyra    (mago    ) 4 objeto(s): Pocion menor, Baston de roble, Baston del Vacio, Tunica astral
Sena    (arquera ) 3 objeto(s): Pocion menor, Tunica de lino, Pocion menor

Vendidos por oro:
  Espada oxidada    +5 oro (repetido)
  Hacha de lenador  +5 oro (nadie del grupo lo usa)
  Hacha de lenador  +5 oro (nadie del grupo lo usa)
Oro total para el grupo: 15
```
