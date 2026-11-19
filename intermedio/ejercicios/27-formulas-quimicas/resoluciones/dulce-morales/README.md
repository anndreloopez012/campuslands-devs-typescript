# Intermedio 27: Validador de formulas quimicas

**Tematica:** quimica
**Alumna:** Dulce Morales

## Problema

Un laboratorio escolar captura formulas quimicas como texto ("H2O", "Ca(OH)2"). El programa:

- lee cada formula y cuenta cuantos atomos tiene de cada elemento;
- valida que los elementos existan y que los parentesis esten bien cerrados;
- calcula la masa molar;
- en las reacciones, revisa si estan balanceadas (los mismos atomos de cada lado).

## Que hice

### Modelo

- `type Categoria`: union con el tipo de cada elemento (no metal, metal alcalino, halogeno...).
- `type Conteo = Map<string, number>`: cuantos atomos hay de cada simbolo.
- `type Lectura`: union discriminada (`ok: true` con el conteo u `ok: false` con el error).
- `interface Reaccion`: cada lado es una lista de tuplas `[coeficiente, formula]`.

### Uso de `Record`, `Map` y `Set`

- **`Record<string, Elemento>`:** una tabla periodica reducida, con nombre, masa y categoria de cada elemento.
- **`Map`:** el conteo de atomos de cada formula y de cada lado de una reaccion.
- **`Set`:** todos los elementos que aparecen en una reaccion, para compararlos de ambos lados.
- **`reduce`:** la masa molar y los atomos agrupados por categoria (en un `Partial<Record<Categoria, number>>`).

### Como se lee una formula

1. Se separa en piezas con una expresion regular: un simbolo (`Ca`, `O`), un numero, `(`, `)` o cualquier otro caracter.
2. Se usa una **pila** de conteos: al abrir `(` se empieza un conteo nuevo; al cerrar `)` se multiplica ese conteo por el numero que sigue y se suma al de afuera.
3. Errores detectados:
   - elemento inexistente;
   - `)` sin `(`;
   - `(` sin cerrar;
   - un numero sin elemento antes;
   - caracteres raros.

### Reacciones

Se suman los atomos de cada lado (coeficiente x formula). Si algun elemento no tiene la misma cantidad a la izquierda y a la derecha, la reaccion **no** esta balanceada y se indica cual.

### Casos probados

- **Formulas validas:**
  - simples (H2O, NaCl);
  - con parentesis (Ca(OH)2, Fe2(SO4)3, Mg(NO3)2);
  - limite: un solo atomo (He).
- **Formulas invalidas:** un elemento inventado, un parentesis sin cerrar, otro sin abrir y un numero al inicio.
- **Reacciones:**
  - tres balanceadas;
  - una combustion de propano mal balanceada (le falta oxigeno a la izquierda);
  - una con formula invalida.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/27-formulas-quimicas/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
====================== FORMULAS ======================
OK H2O        H:2 O:1              18.015 g/mol | no metal 3
OK C6H12O6    C:6 H:12 O:6        180.156 g/mol | no metal 24
OK NaCl       Na:1 Cl:1            58.440 g/mol | metal alcalino 1, halogeno 1
OK Ca(OH)2    Ca:1 O:2 H:2         74.092 g/mol | metal alcalinoterreo 1, no metal 4
OK Fe2(SO4)3  Fe:2 S:3 O:12       399.858 g/mol | metal de transicion 2, no metal 15
OK Mg(NO3)2   Mg:1 N:2 O:6        148.313 g/mol | metal alcalinoterreo 1, no metal 8
OK He         He:1                  4.003 g/mol | gas noble 1
X  Xy2O       "Xy" no es un elemento conocido
X  Ca(OH2     falta cerrar un '('
X  H2O)       hay un ')' sin '(' que lo abra
X  2H2O       numero "2" sin elemento antes

Mas pesada: Fe2(SO4)3 | mas ligera: He

====================== REACCIONES ======================
Formacion de agua: 2H2 + O2 -> 2H2O  -> BALANCEADA
Combustion del metano: CH4 + 2O2 -> CO2 + 2H2O  -> BALANCEADA
Neutralizacion: Ca(OH)2 + 2HCl -> CaCl2 + 2H2O  -> BALANCEADA
Combustion mal balanceada: C3H8 + 3O2 -> 3CO2 + 4H2O  -> NO balanceada
   - O: 6 a la izquierda y 10 a la derecha
Con formula invalida: Zz -> O2  -> NO balanceada
   - Zz: "Zz" no es un elemento conocido
```
