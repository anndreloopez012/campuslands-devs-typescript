# Intermedio 12: Liga de pingpong

**Tematica:** pingpong
**Alumna:** Dulce Morales

## Problema

Llevar la tabla de una liga de pingpong. Cada partido es **al mejor de 5 sets**. Un set se gana llegando a **11 con 2 puntos de ventaja**: si hay 10-10, se sigue hasta sacar 2 de diferencia (12-10, 13-11...). El programa valida cada marcador, decide quien gano cada partido y ordena la tabla con desempates.

## Que hice

### Modelo (objetos anidados)

- `interface Jugador` con un `club` anidado (nombre y ciudad) y su `Division`.
- `type MarcadorSet = readonly [number, number]`: una tupla con los puntos de cada jugador en un set.
- `interface Partido`, `PartidoValidado` y `FilaTabla`, todo `readonly`.
- `type Validacion`: union discriminada (`ok: true` con el partido validado u `ok: false` con el error).

### Reglas de negocio

- **Set valido:** 11-0 a 11-9, o mas de 11 ganando por **exactamente** 2 (12-10, 14-12). No valen 11-10 ni 15-12.
- **Partido valido:** los dos jugadores estan inscritos y son distintos. Alguien llega a 3 sets y no hay sets despues de eso.
- **Desempate**, en este orden:
  1. victorias;
  2. **minitabla entre los empatados** (victorias solo contra los otros empatados);
  3. cociente de sets;
  4. cociente de puntos.

### Por que una minitabla y no "quien le gano a quien"

Con 2 empatados basta ver quien gano el partido entre ellos. Pero con 3 puede formarse un **circulo**: Alejandra le gano a Benjamin, Benjamin a Carolina y Carolina a Alejandra. Comparar de dos en dos daria un orden distinto segun que pareja se compare primero. La minitabla cuenta las victorias dentro de todo el grupo: aqui cada uno tiene 1, asi que decide el cociente de sets.

### Como use arrays tipados

- `map`: validar todos los partidos y armar una fila por jugador.
- `filter`: partidos de cada jugador, victorias dentro del grupo y sets a ventaja.
- `reduce`: sumar sets y puntos de cada jugador.
- `sort`: ordenar la tabla sobre una copia.
- `flatMap`: separar en un paso los partidos validos de los errores.

### Casos probados

- **Normal:** 6 partidos validos, con sets a ventaja (12-10, 14-12, 13-11).
- **Limite:** triple empate a 2 victorias en circulo, que se resuelve por cociente de sets.
- **Invalidos:**
  - set 11-10;
  - un 4to set despues de ganar 3-0;
  - un jugador no inscrito;
  - un set 15-12 en un partido incompleto.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/12-liga-pingpong/index.ts
```

## Salida esperada

```text
================= LIGA DE PINGPONG - PRIMERA =================
--- Resultados ---
J1 Alejandra Paz  3-1 Benjamin Soto  (11-7, 9-11, 11-5, 11-8)
J1 Carolina Diaz  3-0 Daniel Ortiz   (11-3, 11-6, 11-4)
J2 Alejandra Paz  2-3 Carolina Diaz  (12-10, 8-11, 14-12, 7-11, 9-11)
J2 Benjamin Soto  3-0 Daniel Ortiz   (11-9, 11-7, 11-6)
J3 Alejandra Paz  3-0 Daniel Ortiz   (11-4, 11-2, 11-6)
J3 Benjamin Soto  3-1 Carolina Diaz  (11-9, 5-11, 11-9, 13-11)

--- Partidos rechazados ---
X J3 DAN vs ALE: el set 1 (11-10) no es un marcador posible
X J3 CAR vs BEN: hay sets despues de que el partido ya termino
X J3 BEN vs ZZZ: jugador no inscrito
X J3 ALE vs BEN: el set 2 (15-12) no es un marcador posible

--- Tabla ---
Pos Jugador         Club           PJ G P  Sets   Puntos
 1. Alejandra Paz   Club Raqueta   3  2 1  8-4   125-98
 2. Benjamin Soto   Spin Masters   3  2 1  7-4   104-104
 3. Carolina Diaz   Club Raqueta   3  2 1  7-5   128-103
 4. Daniel Ortiz    Topspin FC     3  0 3  0-9   47-99

Empate a 2 victorias entre 3 jugadores:
  Alejandra Paz   1 victoria(s) entre ellos | cociente de sets 2.00
  Benjamin Soto   1 victoria(s) entre ellos | cociente de sets 1.75
  Carolina Diaz   1 victoria(s) entre ellos | cociente de sets 1.40

Sets que se definieron a ventaja (despues del 10-10): 3
```
