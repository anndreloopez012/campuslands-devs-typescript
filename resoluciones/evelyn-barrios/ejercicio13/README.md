# Ejercicio 13 - Módulos y Gestión de Datos (TypeScript)

Este proyecto implementa un sistema de gestión de viajes utilizando **Módulos de ECMAScript (ESM)**. El objetivo principal es demostrar la organización de código en archivos independientes para mejorar la mantenibilidad y la integración de fuentes de datos externas.

## Características

- **Arquitectura Modular**: Separación de responsabilidades entre la lógica de negocio (`utilidades.ts`), la fuente de datos (`datos.json`) y la ejecución principal (`index.ts`).
- **Carga de Datos Tipada**: Uso de atributos de importación (`with { type: "json" }`) para integrar archivos JSON con validación de estructura.
- **Funciones de Transformación**: Implementación de lógica para el filtrado de presupuestos y formateo de cadenas de texto.

## Diferencias con JavaScript y Justificación

La implementación en TypeScript ofrece ventajas críticas sobre JavaScript convencional en el manejo de módulos:

- **Contratos de Interfaz**: A diferencia de JavaScript, donde los datos de un JSON son dinámicos, TypeScript permite definir una interfaz `Destino`. Esto garantiza que cualquier cambio en la estructura de los datos sea detectado inmediatamente por el compilador.
- **Seguridad en la Importación**: Se verifica en tiempo de compilación que las funciones exportadas en `utilidades.ts` sean utilizadas correctamente en el punto de entrada, evitando errores de referencia o parámetros incorrectos.
- **Autodocumentación del Módulo**: Los tipos de datos actúan como documentación viva, permitiendo entender qué espera recibir cada función sin necesidad de consultar implementaciones externas.

## Estructura del Proyecto

1.  **`index.ts`**: Coordina el flujo de la aplicación, importando las funciones y los datos.
2.  **`utilidades.ts`**: Expone las funciones lógicas para procesar la información de los viajes.
3.  **`datos.json`**: Archivo estático que simula una base de datos de destinos.

## Cómo ejecutarlo

1. Instalar las dependencias del proyecto mediante `npm install`.
2. Ejecutar el archivo principal utilizando el entorno de desarrollo:
   ```bash
   npm run dev -- resoluciones/evelyn-barrios/ejercicio13/index.ts
   ```

---

Autor: Evelyn Barrios
