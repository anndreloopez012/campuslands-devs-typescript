# Mi Aprendizaje: Introducción a TypeScript

En este primer ejercicio, configuré las estadísticas básicas de un jugador para un videojuego tipo shooter. Definí variables para el nickname, puntos de vida, estado de escudo y armamento utilizando **tipado explícito**.

## ¿Qué se hizo?
- Declaración de constantes con tipos de datos: `string`, `number` y `boolean`.
- Uso de **Template Literals** (comillas invertidas) para imprimir un resumen formateado en la consola.
- Resolución de un reto extra para manejar variables de entorno del juego (mapa y modo).

## Diferencias observadas con JavaScript

| Característica | JavaScript | TypeScript |
| :--- | :--- | :--- |
| **Asignación de tipos** | Es dinámica; una variable puede cambiar de texto a número sin aviso. | Es estática; si defino un `number`, TypeScript impide asignarle un texto. |
| **Detección de errores** | Los errores suelen aparecer hasta que ejecuto el programa. | Los errores aparecen mientras escribo el código (en tiempo de compilación). |
| **Sintaxis** | `const puntos = 100;` | `const puntos: number = 100;` (Añadimos claridad). |
| **Autocompletado** | El editor a veces "adivina" qué métodos usar. | El editor sabe exactamente qué podemos hacer según el tipo de dato. |

Con TypeScript, el código es más seguro y fácil de entender para otros desarrolladores.
