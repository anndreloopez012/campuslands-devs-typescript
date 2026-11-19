# Intermedio 16: Biblioteca tech

**Tematica:** libros
**Alumna:** Dulce Morales

## Problema

Una biblioteca de libros de tecnologia presta ejemplares a sus socios. El programa:

- procesa las solicitudes del dia (prestar y devolver);
- respeta el limite de prestamos de cada socio;
- pone en lista de espera a quien pide un libro sin ejemplares libres;
- cobra multa por cada dia de atraso;
- muestra el estado final del catalogo.

## Que hice

### Modelo (objetos anidados)

- `interface Libro` con un `autor` anidado (nombre y pais), su `Tema` y cuantos ejemplares tiene.
- `interface Socio` con su `TipoSocio` (estudiante o profesional), y `interface Prestamo`.
- `type Solicitud`: union discriminada por `accion` ("prestar" o "devolver").
- `interface Estado`: prestamos, listas de espera y multas. Cada operacion devuelve un **estado nuevo** y nunca modifica el anterior.
- `type Resultado`: union discriminada (`ok: true` con el nuevo estado u `ok: false` con el error).

### Reglas de negocio

| Regla | Estudiante | Profesional |
|---|---|---|
| Dias de prestamo | 14 | 21 |
| Libros a la vez | 2 | 4 |

- **No se presta** a un socio que tiene algun libro atrasado.
- **Sin ejemplares libres:** el socio queda en lista de espera. Cuando alguien devuelve ese libro, se le presta automaticamente al primero de la lista.
- **Multa:** $0.50 por dia de atraso. Devolver **el mismo dia del vencimiento** no tiene multa.

### Como use arrays tipados

- `filter`: prestamos de un socio, prestamos atrasados, ejemplares ocupados y quitar un prestamo al devolverlo.
- `find` y `some`: buscar libros, socios, prestamos y esperas.
- `reduce`: total de multas.
- `sort`: catalogo por tema y prestamos por fecha de vencimiento, sobre copias.

### Casos probados

| # | Solicitud | Resultado |
|---|---|---|
| 1 | Diego devuelve con 4 dias de atraso | Multa $2.00 |
| 2 | Limite: Camila devuelve el **dia exacto** del vencimiento | Sin multa |
| 3-4 | Camila pide 2 libros | Llega a su limite de estudiante |
| 5 | Camila pide un 3ro | Rechazado por limite |
| 6 | Mateo pide un libro sin ejemplares | Lista de espera |
| 7 | Lucia pide un libro teniendo uno atrasado | Rechazado |
| 8 | Mateo devuelve un libro que no tiene | Rechazado |
| 9 | Socio que no existe | Rechazado |
| 10 | Lucia devuelve con 6 dias de atraso | Multa $3.00; el libro pasa solo a Mateo, que estaba en espera |

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/16-biblioteca-tech/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
================= BIBLIOTECA TECH - DIA 120 =================
 1. devolver OK  Diego devuelve "APIs con Node" con 4 dia(s) de atraso: multa $2.00
 2. devolver OK  Camila devuelve "Docker sin Miedo" a tiempo
 3. prestar  OK  "TypeScript a Fondo" prestado a Camila hasta el dia 134
 4. prestar  OK  "SQL para Humanos" prestado a Camila hasta el dia 134
 5. prestar  X   Camila ya tiene 2 libros (limite estudiante: 2)
 6. prestar  OK  sin ejemplares de "TypeScript a Fondo": Mateo queda en lista de espera
 7. prestar  X   Lucia tiene 1 libro(s) atrasado(s)
 8. devolver X   Mateo no tiene prestado "SQL para Humanos"
 9. prestar  X   socio S9 no existe
10. devolver OK  Lucia devuelve "TypeScript a Fondo" con 6 dia(s) de atraso: multa $3.00 -> "TypeScript a Fondo" prestado a Mateo hasta el dia 141 (estaba en espera)

--- Catalogo al cierre ---
APIs con Node       Pedro Gil    backend    1/1 disponibles
SQL para Humanos    Ana Ruiz     datos      2/3 disponibles
Docker sin Miedo    Tomas Vera   devops     1/1 disponibles
TypeScript a Fondo  Laura Mejia  frontend   0/2 disponibles
Hacking Etico 101   Sara Lind    seguridad  1/2 disponibles

--- Prestamos activos ---
Lucia   Hacking Etico 101   vence dia 124
Camila  TypeScript a Fondo  vence dia 134
Camila  SQL para Humanos    vence dia 134
Mateo   TypeScript a Fondo  vence dia 141

--- Multas cobradas hoy ---
Diego   $2.00
Lucia   $3.00
Total: $5.00
```
