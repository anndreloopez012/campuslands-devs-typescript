# Ejercicio 06 - Formulario de Registro con Validación

Este proyecto consiste en un formulario de registro interactivo desarrollado con HTML, CSS y JavaScript. El objetivo principal es demostrar la captura de datos de usuario y la validación de campos en el lado del cliente.

## Características

- **Interfaz Limpia**: Diseño centrado y moderno utilizando CSS.
- **Validación de Contraseñas**: El sistema verifica que la contraseña y su confirmación coincidan antes de permitir el "envío" de los datos.
- **Feedback en Tiempo Real**: Muestra mensajes de éxito o error dinámicamente sin recargar la página.
- **Diseño Responsivo**: El formulario se adapta visualmente a diferentes tamaños de pantalla.

## Estructura del Proyecto

El ejercicio se compone de tres archivos principales:

1.  **`index.html`**: Define la estructura semántica del formulario, incluyendo campos para nombre de usuario, correo electrónico, contraseña y confirmación.
2.  **`style.css`**: Contiene los estilos para el diseño del contenedor, los inputs, el botón y los mensajes de validación.
3.  **`script.js`**: Gestiona el evento `submit`, previene el comportamiento por defecto del navegador y ejecuta la lógica de validación.

## Requisitos de Funcionamiento

Para que el formulario sea válido:

- Todos los campos deben estar completos (validados por el atributo `required` en HTML).
- El campo "Confirmar Contraseña" debe ser idéntico al campo "Contraseña".

## Cómo ejecutarlo

1. Clonar o descargar este repositorio.
2. Abrir el archivo `index.html` en cualquier navegador web moderno (Chrome, Firefox, Edge, etc.).
3. Completar los campos y presionar el botón "Registrarse".

---

_Ejercicio desarrollado como parte de la práctica de manipulación del DOM y eventos en JavaScript._
