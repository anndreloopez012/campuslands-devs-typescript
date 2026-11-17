# Intermedio 51: Balance quimico simple

**Tematica:** quimica
**Alumna:** Dulce Morales

## Problema

Una app de quimica balancea ecuaciones sencillas, por ejemplo `H2 + O2 -> H2O` -> `2H2 + O2 -> 2H2O`:

- las masas atomicas vienen de una **API remota simulada**, que tarda en responder y a veces falla (se reintenta);
- el balanceo prueba coeficientes del 1 al 8 hasta que los atomos coinciden de ambos lados;
- los errores son **tipados** y el proceso avisa su avance con **eventos tipados**.

## Que hice

### Async/await y datos remotos simulados

- `esperar(ms)`: una `Promise` con `setTimeout` que simula la demora de la red.
- `crearApi(fallasIniciales)`: devuelve una funcion `async` que falla las primeras N veces y despues responde.
- `conReintentos<T>(fn, intentos, emisor)`: funcion **generica** y async. Reintenta con `try/catch` y espera un poco mas en cada intento. Si se agotan los intentos, lanza `ErrorRed`.
- `balancear()` es `async`: espera los datos con `await` y despues calcula.

### Errores tipados

Tres clases que extienden `Error`, cada una con datos propios:

- `ErrorRed`: cuantos intentos se hicieron;
- `ErrorFormula`: que formula fallo y por que;
- `ErrorSinSolucion`: la ecuacion y el coeficiente maximo probado.

`type ErrorBalance` los une, y el **type guard** `esErrorBalance(e: unknown)` permite tratar el error de forma segura en el `catch`. Un error que no sea de estos tipos se vuelve a lanzar.

### Eventos tipados

`Emisor<E>` es una clase **generica**. La interfaz `Eventos` dice que dato lleva cada evento (`"pidiendo-datos"`, `"datos-listos"`, `"probando"`, `"balanceada"`). Con `K extends keyof E`, TypeScript obliga a que `on` y `emit` usen el dato correcto para cada evento.

### Balanceo

1. Cada formula se lee a un `Map` de atomos (por ahora sin parentesis).
2. Un **generador** (`function*`) produce todas las combinaciones de coeficientes.
3. Se prueban de la suma mas chica a la mas grande, para encontrar la respuesta mas simple.
4. Si los atomos coinciden, la ecuacion esta balanceada y se calcula la masa de los reactivos.

### Casos probados

- **Balanceadas:** agua, metano, oxido de hierro, oxido de aluminio y propano.
- **Limite de reintentos:** con el metano, la API falla 2 veces y responde en el 3er intento, el ultimo permitido.
- **ErrorRed:** con la sal, la API falla 3 veces y se agotan los reintentos.
- **ErrorFormula:** una formula con parentesis (no soportados) y un elemento inventado.
- **ErrorSinSolucion:** `H2O -> H2O2` no se puede balancear.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/51-balance-quimico-simple/index.ts
```

## Salida esperada

```text

H2 + O2 -> H2O
   ... 8 combinaciones probadas
   OK 2H2 + O2 -> 2H2O   (masa de reactivos 36.03 g)

CH4 + O2 -> CO2 + H2O
   ... reintento 2 de la API
   ... reintento 3 de la API
   ... 9 combinaciones probadas
   OK CH4 + 2O2 -> CO2 + 2H2O   (masa de reactivos 80.039 g)

Fe + O2 -> Fe2O3
   ... 77 combinaciones probadas
   OK 4Fe + 3O2 -> 2Fe2O3   (masa de reactivos 319.374 g)

Al + O2 -> Al2O3
   ... 77 combinaciones probadas
   OK 4Al + 3O2 -> 2Al2O3   (masa de reactivos 203.922 g)

C3H8 + O2 -> CO2 + H2O
   ... 522 combinaciones probadas
   OK C3H8 + 5O2 -> 3CO2 + 4H2O   (masa de reactivos 204.087 g)

Na + Cl2 -> NaCl
   ... reintento 2 de la API
   ... reintento 3 de la API
   X [ErrorRed] la API de elementos no respondio despues de 3 intentos

Ca(OH)2 + HCl -> CaCl2 + H2O
   X [ErrorFormula] formula "Ca(OH)2" invalida: solo se aceptan elementos y numeros, sin parentesis

Xx + O2 -> XxO
   X [ErrorFormula] formula "Xx" invalida: el elemento Xx no esta en la tabla

H2O -> H2O2
   ... 64 combinaciones probadas
   X [ErrorSinSolucion] no se encontraron coeficientes del 1 al 8 para "H2O -> H2O2"
```
