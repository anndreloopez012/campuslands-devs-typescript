# Ejercicio 01: Introducción a TypeScript - Evelyn Barrios

## Resolución y Explicación
En este ejercicio, desarrollé la estructura base para gestionar los datos de un jugador en un entorno de videojuego Shooter. Se definieron variables fundamentales utilizando **tipado explícito** para asegurar que cada dato corresponda a su propósito lógico:

- **Nickname y Arma:** Definidos como `string` para manejar cadenas de texto.
- **Vida y Munición:** Definidos como `number` para permitir operaciones matemáticas posteriores.
- **Escudo Activo:** Definido como `boolean` para manejar estados binarios (sí/no).

Además, se integró el **Reto Extra** mediante la declaración de variables para el `mapaActual` y el `modoDeJuego`, permitiendo un resumen completo del estado global de la partida. Para la salida de datos, se utilizaron **Template Literals**, lo que facilita la lectura del resumen en consola de forma organizada.

### ¿Por qué se hizo así?
La elección de **tipado explícito** en lugar de dejar que TypeScript lo infiera automáticamente se debe a una buena práctica de legibilidad y seguridad. En un videojuego, un error donde la "munición" pase de ser un número a un texto podría romper el sistema de combate. Al declarar `: number`, obligamos al compilador a protegernos contra estos errores desde el momento de la escritura.

## Diferencias observadas con JavaScript

| Característica | JavaScript | TypeScript |
| :--- | :--- | :--- |
| **Tipado** | **Dinámico:** Las variables pueden cambiar de tipo en cualquier momento. | **Estático:** El tipo se define una vez y se respeta en todo el ciclo de vida. |
| **Detección de errores** | **En ejecución (Runtime):** Te das cuenta del error cuando el programa ya está corriendo. | **En compilación:** El editor te avisa del error antes de que el código se ejecute. |
| **Mantenimiento** | Difícil de leer en proyectos grandes; no sabes qué contiene cada variable. | **Autodocumentado:** El tipo de dato explica por sí solo qué hace la variable. |
| **Intellisense** | Limitado; el editor sugiere cosas basándose en suposiciones. | **Preciso:** El autocompletado es exacto según el tipo de dato asignado. |

## Conclusión
Con TypeScript, hemos transformado un simple script de variables en un contrato de datos seguro. Esto reduce drásticamente los bugs en producción y facilita que otros desarrolladores entiendan mi código sin necesidad de ejecutarlo.
