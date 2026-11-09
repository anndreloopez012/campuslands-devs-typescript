# Ejercicio 07 - Formulario de Registro con Validación (TypeScript)

Este proyecto reimplementa y mejora el formulario de registro del Ejercicio 06, utilizando **TypeScript**. Su objetivo es demostrar cómo TypeScript mejora la robustez, mantenibilidad y escalabilidad de las aplicaciones web mediante la validación de campos con tipado estático.

## Características

-   **Interfaz Limpia**: Diseño centrado y moderno utilizando CSS (heredado del Ejercicio 06).
-   **Validación Tipada**: Lógica de validación de contraseñas con tipado estático, asegurando la consistencia de datos.
-   **Feedback en Tiempo Real**: Muestra mensajes de éxito o error dinámicamente, con una implementación más segura gracias a TypeScript.
-   **Diseño Responsivo**: El formulario se adapta visualmente a diferentes tamaños de pantalla.
-   **Mayor Robustez**: Reducción de errores en tiempo de ejecución gracias a la detección de errores en tiempo de compilación.

## Diferencias con JavaScript (Ejercicio 06) y Justificación

La principal diferencia de este ejercicio con respecto al Ejercicio 06 radica en el uso de **TypeScript** en lugar de JavaScript puro. Esta elección se justifica por las siguientes ventajas clave:
-   **Tipado Estático**: A diferencia de JavaScript, TypeScript permite definir tipos para variables y funciones, detectando errores comunes en tiempo de desarrollo (compilación) en lugar de en tiempo de ejecución. Esto mejora la fiabilidad del código.
-   **Mejor Experiencia de Desarrollo (DX)**: Los IDEs aprovechan la información de tipo de TypeScript para ofrecer autocompletado inteligente, refactorización segura y detección de errores en tiempo real, lo que acelera el desarrollo y aumenta la productividad.
-   **Mantenibilidad y Escalabilidad**: En proyectos grandes, la tipificación de TypeScript facilita la comprensión del código y las interfaces entre módulos, haciendo el software más fácil de mantener y escalar, especialmente en equipos de desarrollo.
-   **Detección Temprana de Errores**: TypeScript detecta inconsistencias de tipo durante la compilación, permitiendo corregir problemas antes de que el código llegue al navegador, a diferencia de JavaScript donde los errores de tipo se manifiestan en tiempo de ejecución.
-   **Soporte para Características Modernas de JavaScript**: TypeScript permite utilizar características de ECMAScript futuras. Su compilador (TSC) transpila este código a una versión compatible con el navegador objetivo, asegurando compatibilidad sin sacrificar el uso de las últimas funcionalidades del lenguaje.

## Estructura del Proyecto

El ejercicio se compone de los siguientes archivos principales:

1.  **`index.html`**: Define la estructura semántica del formulario.
2.  **`style.css`**: Contiene los estilos para el diseño del formulario.
3.  **`src/main.ts`**: Lógica de validación en TypeScript.
4.  **`dist/main.js`**: Archivo JavaScript compilado de `src/main.ts`.
5.  **`tsconfig.json`**: Configuración del compilador TypeScript.

## Requisitos de Funcionamiento

Para que el formulario sea válido:

-   Todos los campos deben estar completos.
-   El campo "Confirmar Contraseña" debe ser idéntico al campo "Contraseña".
-   (Opcional) La contraseña debe cumplir criterios de complejidad.

## Cómo ejecutarlo

1.  Clonar o descargar este repositorio.
2.  Asegurarse de tener Node.js y npm (o yarn) instalados.
3.  Instalar las dependencias del proyecto:
    ```bash
    npm install
    # o
    yarn install
    ```
4.  Compilar TypeScript a JavaScript:
    ```bash
    npm run build
    # o
    yarn build
    ```
    (Requiere un script `build` en `package.json` que ejecute `tsc`).
5.  Abrir el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge, etc.).
6.  Completar los campos y presionar el botón "Registrarse".

---

_Ejercicio de manipulación del DOM, eventos en JavaScript e introducción a TypeScript para desarrollo frontend._

Autor: Evelyn Barrios
