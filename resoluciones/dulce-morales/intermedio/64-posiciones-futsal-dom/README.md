# Intermedio 64: Tabla futsal interactiva

**Tematica:** futbol sala
**Alumna:** Dulce Morales

## Problema

Una pagina muestra la tabla de posiciones de una liga de futsal, y el usuario interactua con ella:

- hace clic en una columna para **ordenar**; otro clic en la misma columna **invierte** el orden;
- escribe en un buscador para **filtrar**;
- hace clic en una fila para **seleccionar** un equipo y ver su detalle; otro clic lo deselecciona;
- **registra** resultados nuevos.

Cada interaccion es un **evento tipado** que entra a un **reducer puro**. La vista se vuelve a pintar con el estado nuevo.

## Sobre el DOM

Los ejercicios se ejecutan con Node, sin navegador. Por eso los clics y el texto del buscador se simulan como eventos, y `render(estado)` devuelve el texto que mostraria la tabla. En una pagina real, cada `addEventListener` haria `estado = reducer(estado, evento)` y despues volveria a pintar.

## Que hice

### Estado y eventos

- `EstadoUI`: equipos, orden (columna y direccion), filtro, equipo seleccionado y ultimo error.
- `type EventoUI`: union discriminada:
  - `CLIC_COLUMNA`;
  - `ESCRIBIR_BUSQUEDA`;
  - `CLIC_FILA`;
  - `REGISTRAR_RESULTADO`.

### Reducer puro

`reducer(estado, evento)` siempre devuelve un estado nuevo:

| Evento | Que hace |
|---|---|
| CLIC_COLUMNA | En la misma columna invierte el orden. En otra columna usa el orden por defecto: numeros de mayor a menor, nombre de A a Z |
| ESCRIBIR_BUSQUEDA | Guarda el filtro sin espacios y en minusculas |
| CLIC_FILA | Selecciona el equipo; si ya estaba seleccionado, lo deselecciona |
| REGISTRAR_RESULTADO | Valida y suma el partido a los dos equipos (sin modificar los originales). Si algo falla, guarda el error |

### Vista

`filasVisibles()` filtra y ordena; `render()` arma la tabla:

- una flecha marca la columna ordenada (`v` mayor a menor, `^` menor a mayor);
- `>` marca la fila seleccionada;
- abajo se ve el detalle del equipo seleccionado y los errores.

**Desempate** (como en una tabla real): puntos, diferencia de goles, goles a favor y nombre.

### Casos probados

- **Empate:** Rayos y Furia tienen 13 puntos y +11. Rayos va primero por tener mas goles a favor (28 contra 24).
- **Ordenar:** un clic en GF ordena de mayor a menor; un segundo clic invierte el orden.
- **Filtro:** "ra" deja 2 equipos; "xyz" no deja ninguno y se avisa.
- **Seleccion:** Rapidos se selecciona, su detalle sigue visible mientras se filtra, y otro clic lo deselecciona.
- **Resultado:** Furia gana 5-2 a Rayos y pasa a ser lider con 16 puntos.
- **Error:** un resultado con goles negativos se rechaza y no cambia la tabla.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/64-posiciones-futsal-dom/index.ts
```

## Salida esperada

```text
== Vista inicial (ordenada por puntos) ==
   Equipo         PJ  G  E  P   GF   GC   DG  PTSv
   Rayos FS        6  4  1  1   28   17  +11    13
   Furia Roja      6  4  1  1   24   13  +11    13
   Titanes         6  3  2  1   21   15   +6    11
   Atletico Sala   6  2  1  3   19   22   -3     7
   Real Futsal     6  1  2  3   15   24   -9     5
   Rapidos         6  1  1  4   14   30  -16     4

== clic en 'GF' ==
   Equipo         PJ  G  E  P  GFv   GC   DG   PTS
   Rayos FS        6  4  1  1   28   17  +11    13
   Furia Roja      6  4  1  1   24   13  +11    13
   Titanes         6  3  2  1   21   15   +6    11
   Atletico Sala   6  2  1  3   19   22   -3     7
   Real Futsal     6  1  2  3   15   24   -9     5
   Rapidos         6  1  1  4   14   30  -16     4

== otro clic en 'GF' (invierte) ==
   Equipo         PJ  G  E  P  GF^   GC   DG   PTS
   Rapidos         6  1  1  4   14   30  -16     4
   Real Futsal     6  1  2  3   15   24   -9     5
   Atletico Sala   6  2  1  3   19   22   -3     7
   Titanes         6  3  2  1   21   15   +6    11
   Furia Roja      6  4  1  1   24   13  +11    13
   Rayos FS        6  4  1  1   28   17  +11    13

== escribe 'ra' en el buscador ==
   Equipo         PJ  G  E  P  GF^   GC   DG   PTS
   Rapidos         6  1  1  4   14   30  -16     4
   Rayos FS        6  4  1  1   28   17  +11    13
   filtro: "ra" (2 de 6)

== clic en la fila de Rapidos ==
   Equipo         PJ  G  E  P  GF^   GC   DG   PTS
>  Rapidos         6  1  1  4   14   30  -16     4
   Rayos FS        6  4  1  1   28   17  +11    13
   filtro: "ra" (2 de 6)
   Detalle Rapidos: 22% de los puntos posibles, 2.3 goles por partido

== escribe 'xyz' ==
   Equipo         PJ  G  E  P  GF^   GC   DG   PTS
   (ningun equipo coincide con "xyz")
   filtro: "xyz" (0 de 6)
   Detalle Rapidos: 22% de los puntos posibles, 2.3 goles por partido

== borra la busqueda (sigue ordenada por GF) ==
   Equipo         PJ  G  E  P  GF^   GC   DG   PTS
>  Rapidos         6  1  1  4   14   30  -16     4
   Real Futsal     6  1  2  3   15   24   -9     5
   Atletico Sala   6  2  1  3   19   22   -3     7
   Titanes         6  3  2  1   21   15   +6    11
   Furia Roja      6  4  1  1   24   13  +11    13
   Rayos FS        6  4  1  1   28   17  +11    13
   Detalle Rapidos: 22% de los puntos posibles, 2.3 goles por partido

== clic en 'PTS' ==
   Equipo         PJ  G  E  P   GF   GC   DG  PTSv
   Rayos FS        6  4  1  1   28   17  +11    13
   Furia Roja      6  4  1  1   24   13  +11    13
   Titanes         6  3  2  1   21   15   +6    11
   Atletico Sala   6  2  1  3   19   22   -3     7
   Real Futsal     6  1  2  3   15   24   -9     5
>  Rapidos         6  1  1  4   14   30  -16     4
   Detalle Rapidos: 22% de los puntos posibles, 2.3 goles por partido

== registra Furia Roja 5-2 Rayos FS ==
   Equipo         PJ  G  E  P   GF   GC   DG  PTSv
   Furia Roja      7  5  1  1   29   15  +14    16
   Rayos FS        7  4  1  2   30   22   +8    13
   Titanes         6  3  2  1   21   15   +6    11
   Atletico Sala   6  2  1  3   19   22   -3     7
   Real Futsal     6  1  2  3   15   24   -9     5
>  Rapidos         6  1  1  4   14   30  -16     4
   Detalle Rapidos: 22% de los puntos posibles, 2.3 goles por partido

== registra un resultado con goles negativos ==
   Equipo         PJ  G  E  P   GF   GC   DG  PTSv
   Furia Roja      7  5  1  1   29   15  +14    16
   Rayos FS        7  4  1  2   30   22   +8    13
   Titanes         6  3  2  1   21   15   +6    11
   Atletico Sala   6  2  1  3   19   22   -3     7
   Real Futsal     6  1  2  3   15   24   -9     5
>  Rapidos         6  1  1  4   14   30  -16     4
   Detalle Rapidos: 22% de los puntos posibles, 2.3 goles por partido
   X goles invalidos

== vuelve a hacer clic en Rapidos (deselecciona) ==
   Equipo         PJ  G  E  P   GF   GC   DG  PTSv
   Furia Roja      7  5  1  1   29   15  +14    16
   Rayos FS        7  4  1  2   30   22   +8    13
   Titanes         6  3  2  1   21   15   +6    11
   Atletico Sala   6  2  1  3   19   22   -3     7
   Real Futsal     6  1  2  3   15   24   -9     5
   Rapidos         6  1  1  4   14   30  -16     4
```
