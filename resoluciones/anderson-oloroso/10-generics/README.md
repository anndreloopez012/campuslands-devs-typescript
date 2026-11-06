# Ejercicio 10: Generics

**Contexto:** Inventario de videojuegos

## Objetivo

crear funciones y estructuras reutilizables sin perder tipos.

## Instrucciones

Crea una funcion generica para buscar elementos de un inventario por id.

Trabaja en `index.ts` y ejecuta el archivo para validar tu avance.

## Pistas

- Usa `<T>` para representar un tipo generico.
- Puedes restringir T con `extends`.
- La funcion debe conservar el tipo del elemento encontrado.

## Restricciones

- La funcion debe ser generica.
- No debe retornar `any`.
- Maneja el caso no encontrado con `undefined`.

## Reto Extra

Usa la misma funcion para videojuegos y periféricos.

## Resultado Esperado

Se busca un videojuego por id y TypeScript conserva sus propiedades.
