# Ejercicio 14 - Gestión Asíncrona de Datos (TypeScript)

Este proyecto corresponde al Ejercicio 14, desarrollado utilizando **TypeScript**. Su objetivo principal es demostrar el uso de `async/await` para manejar operaciones asíncronas, simulando la consulta de datos de una API de películas.

## Características

- **Programación Asíncrona**: Implementación de `async/await` para un manejo más legible y secuencial de promesas.
- **Manejo de Errores**: Utilización de bloques `try/catch` para gestionar posibles fallos en operaciones asíncronas, como la simulación de una consulta a una API.
- **Simulación de API**: Uso de `setTimeout` para emular la latencia de una llamada a un servicio externo.

## Diferencias con JavaScript y Justificación

Se ha implementado TypeScript sobre JavaScript basándose en las siguientes ventajas:

- **Tipado de Promesas**: TypeScript permite tipar las promesas (`Promise<string>` en este caso), asegurando que el valor resuelto sea del tipo esperado. Esto previene errores en el consumo de datos asíncronos y mejora la fiabilidad.
- **Claridad en el Flujo Asíncrono**: Aunque `async/await` es una característica de JavaScript, TypeScript añade una capa de seguridad al garantizar que las funciones marcadas como `async` devuelvan siempre una `Promise` y que las operaciones `await` se realicen sobre valores tipados, lo que facilita la depuración.
- **Detección de Errores en Tiempo de Compilación**: Errores relacionados con el tipo de los datos obtenidos de la simulación de la API serían detectados antes de la ejecución, a diferencia de JavaScript donde estos errores solo se manifestarían en tiempo de ejecución.

## Estructura del Proyecto

1.  **`index.ts`**: Contiene la lógica principal para simular la consulta y mostrar la película.
2.  **`datos.json`**: Archivo de datos de ejemplo (no utilizado directamente en la lógica actual de `index.ts`, pero presente en el contexto del ejercicio).

## Cómo ejecutarlo

1. Instalar las dependencias necesarias: `npm install`.
2. Compilar el código fuente: `npm run build`.
3. Ejecutar el archivo principal utilizando el entorno de desarrollo:
   ```bash
   npm run dev -- resoluciones/evelyn-barrios/ejercicio14/index.ts
   ```

---

Autor: Evelyn Barrios
