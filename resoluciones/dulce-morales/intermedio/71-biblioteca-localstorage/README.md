# Intermedio 71 - Biblioteca con localStorage

**Tematica:** libros
**Alumna:** Dulce Morales

## Problema

Una app de biblioteca que guarda su catalogo y sus prestamos en `localStorage`, de modo que al recargar
la pagina los datos siguen ahi. Como el ejercicio corre en Node, `localStorage` se simula.

## Que hice

Arquitectura simple en capas:

1. **Storage simulado**: `LocalStorageSimulado` implementa la misma interfaz que `localStorage`
   (`getItem`, `setItem`, `removeItem`) y solo guarda texto.
2. **DTO de entrada**: `LibroFormDTO` representa el formulario. Todo llega como `string`, igual que
   el valor de un `<input>`.
3. **Validacion**: `desdeFormulario` convierte el DTO en un `Libro` o devuelve la lista de errores
   (`Resultado<T>`, una union discriminada por `ok`).
4. **Repositorio en memoria persistido**: `RepositorioPersistido<T, K>` es generico. Guarda en un
   `Map` y reescribe el JSON en el storage despues de cada cambio. Al cargar, trata los datos como
   `unknown` y los filtra con type guards (`esLibro`, `esPrestamo`), porque el storage puede estar
   corrupto o viejo.
5. **Servicio**: `Biblioteca` contiene las reglas de prestamo y devolucion.
6. **Reporte**: es un DTO de salida con ejemplares por genero, libros mas prestados y prestamos vencidos.

## Reglas

| Regla | Valor |
|---|---|
| ISBN | 13 digitos (se aceptan guiones) |
| Anio | 1450 a 2026 |
| ISBN repetido | suma ejemplares en lugar de duplicar |
| Prestamos por socio | maximo 3 activos |
| Duracion | 14 dias; al dia 14 exacto no hay multa |
| Multa | $5 por dia de atraso |
| Bloqueo | un socio con prestamos vencidos no puede pedir mas |
| Disponibilidad | ejemplares menos prestamos activos |

## Casos probados

- Formularios validos, uno con varios errores, uno con genero invalido e ISBN repetido (suma ejemplares).
- Libro sin ejemplares, socio que repite libro y socio con 3 prestamos.
- Prestamo de un libro que no se guardo.
- Caso limite: devolucion a los 14 dias exactos, sin multa. Devolver dos veces se rechaza.
- **Recarga**: una nueva instancia lee el mismo storage y conserva libros y prestamos.
- Socios bloqueados por prestamos vencidos y multa por atraso.
- **Storage danado**: un JSON invalido y un registro con tipos incorrectos se descartan con aviso,
  sin romper la app.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/71-biblioteca-localstorage/index.ts
```

## Salida esperada

```text
=== Sesion 1: catalogo ===
  agregado "Duna"
  agregado "Cosmos"
  agregado "El principito"
  RECHAZADO "La Odisea": genero "epica" no valido; anio fuera de rango (1450-2026)
  RECHAZADO "X": ISBN debe tener 13 digitos; titulo muy corto; autor obligatorio; anio fuera de rango (1450-2026); ejemplares debe ser entero >= 1
  "Duna" ya existia: +1 ejemplar(es)

=== Sesion 1: prestamos ===
  prestamo #1: "Cosmos" a ana
  "Cosmos" sin ejemplares disponibles
  prestamo #2: "Duna" a ana
  ana ya tiene "Duna"
  prestamo #3: "El principito" a ana
  ana ya tiene 3 prestamos
  no existe el ISBN 9788491051411
  prestamo #4: "Duna" a luis
  devuelto #1 (14 dias) sin multa
  prestamo #1 no esta activo
  prestamo #5: "Cosmos" a luis
  localStorage ocupa 750 caracteres

=== Sesion 2: se recarga la pagina (nueva instancia, mismo storage) ===
  libros cargados: 3, prestamos cargados: 5
  ana tiene 2 prestamo(s) vencido(s)
  devuelto #2 (23 dias) multa $45 por 9 dia(s) de atraso
  luis tiene 1 prestamo(s) vencido(s)
  prestamo #6: "El principito" a beto

=== Reporte dia 25 ===
  Ejemplares por genero: novela=3, ciencia=1, historia=0, infantil=3, poesia=0
  Mas prestados: Cosmos (2), Duna (2), El principito (2)
  Vencidos: #3 ana: 8 dia(s) de atraso | #4 luis: 7 dia(s) de atraso

=== Sesion 3: storage danado a mano ===
  aviso: "biblio.libros": 1 registro(s) invalido(s) descartado(s)
  aviso: "biblio.prestamos" tenia JSON corrupto; se empieza vacio
  libros cargados: 3, prestamos cargados: 0
```
