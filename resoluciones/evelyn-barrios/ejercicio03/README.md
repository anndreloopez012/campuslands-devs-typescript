# Ejercicio 03: Union Types y Type Aliases - Evelyn Barrios

## Resolución y Explicación

En este ejercicio, elevamos la complejidad del sistema de juego implementando **Tipos de Unión (Union Types)** y **Alias de Tipos (Type Aliases)**. El objetivo fue restringir los valores posibles para ciertas propiedades críticas del jugador, evitando que el sistema acepte datos sin sentido.

- **Estado del Jugador:** Se creó un alias `Estado` que solo permite los valores `'vivo'`, `'herido'` o `'eliminado'`.
- **Clases de Personaje:** Se utilizó un literal type para definir roles específicos como `'Tanque'`, `'Arquero'` o `'Mago'`.
- **Sistema de Daño:** Se implementaron funciones que aceptan parámetros de tipo unión (ej. `string | number`) para procesar identificadores de ítems o cantidades de daño.

### ¿Por qué se hizo así?

En JavaScript puro, una variable `estado` podría recibir accidentalmente un valor como `"dormido"` o un número, lo que causaría errores lógicos difíciles de encontrar. Al usar **Literal Types** dentro de un **Type Alias**, TypeScript actúa como un "filtro de seguridad", garantizando que la lógica del juego solo opere bajo condiciones predefinidas. Esto elimina la necesidad de escribir múltiples validaciones `if/else` manuales para comprobar si un texto es válido.

## Diferencias observadas con JavaScript

| Característica            | JavaScript                                                                      | TypeScript                                                                            |
| :------------------------ | :------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------ |
| **Validación de Valores** | Solo puedes validar valores en tiempo de ejecución usando `if/else` o `switch`. | Validas valores permitidos en tiempo de escritura (Literal Types).                    |
| **Flexibilidad de Tipos** | Una variable es de un solo tipo o "cualquiera" (dinámico).                      | **Union Types:** Una variable puede ser "esto O aquello" de forma controlada.         |
| **Reutilización**         | Tienes que copiar y pegar estructuras de datos o usar objetos globales.         | **Type Aliases:** Defines una estructura una vez y la reutilizas en todo el proyecto. |
| **Manejo de Errores**     | El programa puede fallar si llega un valor inesperado a una función.            | El compilador bloquea el programa si intentas pasar un valor no permitido.            |

## Ejemplo de Mejora

**En JavaScript:**

```javascript
function setEstado(nuevoEstado) {
  // Si alguien pasa "volando", el juego podría romperse más adelante
  this.estado = nuevoEstado;
}
```

**En TypeScript (con mi resolución):**

```typescript
type Estado = "vivo" | "herido" | "eliminado";
let jugadorEstado: Estado = "vivo"; // Seguro
// jugadorEstado = 'volando'; // Error inmediato en el editor
```

## Conclusión

La implementación de alias y uniones permite que el código sea mucho más robusto. Hemos pasado de simplemente decir "esto es un texto" (Ejercicio 01) a decir "esto es un texto, pero solo puede ser uno de estos tres valores específicos".
