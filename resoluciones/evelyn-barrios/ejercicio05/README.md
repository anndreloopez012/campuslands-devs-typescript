# Ejercicio 05: Funciones y Tipado de Retorno - Evelyn Barrios

## Resolución y Explicación

En este ejercicio, implementamos el "motor lógico" de nuestro videojuego mediante el uso de **Funciones**. Nos aseguramos de que cada acción (como disparar, recibir daño o subir de nivel) tenga entradas y salidas estrictamente controladas.

- **Parámetros Tipados:** Se definieron los tipos de datos exactos que cada función debe recibir (ej. `daño: number`, `objetivo: string`).
- **Tipado de Retorno:** Se especificó explícitamente qué debe devolver cada función (ej. `: number` para cálculos o `: void` para acciones que no retornan valores), evitando comportamientos inesperados.
- **Arrow Functions:** Implementamos funciones de flecha para mantener una sintaxis moderna y limpia, aplicando el tipado de la misma manera que en las funciones tradicionales.

### ¿Por qué se hizo así?

Las funciones son el lugar donde ocurren la mayoría de los errores lógicos en JavaScript (por ejemplo, pasar un texto a una función que debería realizar una operación matemática). Al definir un "contrato" para la función, TypeScript nos obliga a pasar los argumentos correctos y a manejar el resultado de forma coherente. En un shooter, esto garantiza que el cálculo de la vida restante o el daño crítico sea siempre preciso y predecible.

## Diferencias observadas con JavaScript

| Característica       | JavaScript                                                                     | TypeScript (Funciones)                                                         |
| :------------------- | :----------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **Argumentos**       | Puedes pasar más o menos argumentos de los definidos sin errores inmediatos.   | El compilador exige exactamente el número y tipo de parámetros definidos.      |
| **Validación**       | Requiere validaciones manuales (`typeof`) dentro del cuerpo de la función.     | La validación es automática y ocurre antes de que el código se ejecute.        |
| **Valor de Retorno** | Una función puede devolver cualquier cosa (o nada) sin que el editor te avise. | Se garantiza que la función devuelva el tipo de dato prometido en su firma.    |
| **Documentación**    | Es difícil saber qué espera una función compleja sin leer todo su código.      | La firma de la función actúa como documentación clara y autocompletado exacto. |

## Ejemplo de Mejora

**En JavaScript (Inseguro):**

```javascript
function aplicarDano(puntos) {
  return "Dañó: " + puntos; // El programador podría esperar un número, pero recibe un string.
}
```

**En TypeScript (Seguro):**

```typescript
const aplicarDano = (puntos: number): number => {
  return puntos * 1.2; // El sistema garantiza que el resultado siempre será un número.
};
```

## Conclusión

Con el tipado de funciones, cerramos el círculo de seguridad en nuestro código. Ahora no solo tenemos datos seguros (Variables e Interfaces), sino también procesos seguros. Esto reduce drásticamente los errores en tiempo de ejecución y mejora la mantenibilidad de la lógica del juego.
