# Intermedio 40: Club de lectura

**Tematica:** libros
**Alumna:** Dulce Morales

## Problema

Un club de lectura elige el libro del mes por **votacion con preferencias**: cada miembro ordena los libros del que mas quiere al que menos. Se usa **segunda vuelta instantanea**:

- si ningun libro tiene **mas de la mitad** de los primeros lugares, se elimina el que tiene menos votos;
- esos votos pasan a la siguiente preferencia de cada papeleta;
- se repite hasta que alguno tenga mayoria.

Despues, con el ritmo de lectura de cada miembro, se estima quien termina el libro antes de la reunion y si hay quorum.

## Que hice

### Tipos y type guards

- Literal type `Formato` (papel, ebook, audiolibro).
- `interface Libro`, `Miembro`, `Papeleta` y `Ronda`.
- `type Revision`: union discriminada (papeleta valida u invalida con motivo).
- **Type guard** `esValida`.

### Clase `ClubLectura`

- La lista de libros y la de miembros son **privadas**.
- `revisar(papeleta)`: el votante es miembro, la papeleta no esta vacia, no repite libros y todos los libros existen.
- `votar(papeletas)`: valida, deja **una sola papeleta por miembro** (la primera, con ayuda de un `Set`) y hace las rondas. Lleva los libros que siguen en carrera en un `Set` y cuenta los votos en un `Map`.
- `planDeLectura(libro, dias)`: cuantos dias tarda cada miembro (paginas / paginas por dia, redondeado hacia arriba) y si llega a tiempo.

### Reglas

- **Mayoria:** **mas** de la mitad de los votos activos. La mitad exacta no alcanza.
- **Desempate al eliminar:** si varios empatan con menos votos, se elimina el de codigo mayor. Es una regla fija, para que el resultado siempre sea el mismo.
- **Quorum:** la mitad de los miembros, redondeada hacia arriba, debe haber terminado el libro.

### Casos probados

- **Papeletas invalidas:**
  - Hugo no es miembro;
  - Dani repite un libro en su segunda papeleta;
  - Ana vota dos veces (solo cuenta la primera).
- **Rondas:**
  - en la ronda 1 hay un triple empate en 2 votos y nadie tiene mayoria;
  - se elimina el libro con 1 voto, y en la ronda 2 hay un empate en el ultimo lugar que se resuelve con la regla fija;
  - en la ronda 3 gana "Codigo Estelar" con 5 de 7.
- **Limite de tiempo:** Ana termina en **exactamente** 14 dias, el dia de la reunion, y cuenta como a tiempo.
- **Limite de quorum:** lo terminan **exactamente** 4 de 7, el minimo necesario.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/40-club-lectura/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
=========== Club Pagina 42: votacion del libro del mes ===========
X Papeleta de Hugo: no es miembro del club
X Papeleta de Dani: repite un libro
X Papeleta de Ana: ya habia votado

Ronda 1 (7 votos, se necesitan mas de 3.5): Cien Mananas 2 | Codigo Estelar 2 | Cuentos de Lluvia 2 | El Faro del Sur 1
  Nadie tiene mayoria. Se elimina "El Faro del Sur" y sus votos pasan a la siguiente preferencia.

Ronda 2 (7 votos, se necesitan mas de 3.5): Codigo Estelar 3 | Cien Mananas 2 | Cuentos de Lluvia 2
  Nadie tiene mayoria. Se elimina "Cuentos de Lluvia" y sus votos pasan a la siguiente preferencia.

Ronda 3 (7 votos, se necesitan mas de 3.5): Codigo Estelar 5 | Cien Mananas 2

LIBRO DEL MES: Codigo Estelar (350 paginas)

=========== Plan de lectura (reunion en 14 dias) ===========
Beto   ebook       40 pag/dia ->  9 dias a tiempo
Gabi   audiolibro  35 pag/dia -> 10 dias a tiempo
Carla  audiolibro  30 pag/dia -> 12 dias a tiempo
Ana    papel       25 pag/dia -> 14 dias a tiempo
Eli    ebook       20 pag/dia -> 18 dias NO llega (le faltan 4 dias)
Dani   papel       14 pag/dia -> 25 dias NO llega (le faltan 11 dias)
Fer    papel       10 pag/dia -> 35 dias NO llega (le faltan 21 dias)

Lo terminan a tiempo 4 de 7. Quorum para la reunion: 4 -> hay quorum
```
