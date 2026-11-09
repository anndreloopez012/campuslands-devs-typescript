# Ejercicio 03: Arrays y Tuplas (Equipos de Fútbol)

En este ejercicio aprendí a organizar colecciones de datos. Utilicé **Arrays** para listas de elementos del mismo tipo (jugadores) y **Tuplas** para estructuras con una cantidad y orden de datos fijos (el marcador del partido).

## ¿Qué se hizo?
- Se definió un Array de strings (`string[]`) para almacenar la plantilla de jugadores.
- Se implementó una Tupla (`[number, number]`) para el marcador, asegurando que siempre tenga exactamente dos números.
- Se calculó el total de goles y se mostraron los dorsales utilizando métodos de arreglos.

## Diferencias con JavaScript

| Característica | JavaScript | TypeScript |
| :--- | :--- | :--- |
| **Homogeneidad** | Los arrays pueden mezclar números, strings y objetos sin aviso. | Podemos restringir el array a un solo tipo (ej. solo nombres de jugadores). |
| **Tuplas** | No existen nativamente; son simples arrays que pueden crecer o cambiar. | Permiten definir exactamente qué tipo de dato va en cada posición y fijar su longitud. |
| **Métodos** | Al usar `map` o `reduce`, no siempre sabemos qué tipo de dato estamos manipulando. | El autocompletado nos sugiere métodos específicos según el tipo detectado en el array. |

Gracias a las Tuplas, evitamos errores comunes como poner el nombre de un equipo donde debería ir el puntaje numérico.
