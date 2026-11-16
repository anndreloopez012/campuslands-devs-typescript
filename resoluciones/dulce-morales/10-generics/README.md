# Ejercicio 10: Generics

**Contexto:** Inventario de videojuegos
**Alumna:** Dulce Morales

## Que hice

- `ConId` es el tipo minimo que pide la busqueda: cualquier objeto con `id: number`.
- `buscarPorId<T extends ConId>(inventario: T[], id: number): T | undefined` es la funcion generica:
  - `T` representa el tipo de los elementos del inventario.
  - `extends ConId` restringe `T` a objetos que tengan `id`.
  - Retorna el mismo tipo `T` que recibio (nunca `any`), o `undefined` si no lo encuentra.
- Al buscar el id 102 en `videojuegos`, TypeScript sabe que el resultado es `Videojuego` y deja usar `titulo`, `plataforma` y `stock`.
- El caso no encontrado (id 999) devuelve `undefined` y se maneja con un `if`.
- Reto extra: la misma funcion busca en `perifericos` y conserva el tipo `Periferico`. Si intentas leer `periferico.titulo`, TypeScript marca error porque esa propiedad no existe.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/10-generics/index.ts
```

## Salida esperada

```text
=========== BUSQUEDA DE VIDEOJUEGO ===========
#102 Zelda: Tears of the Kingdom (Switch) - $69.99 - 5 en stock
Buscar id 999: no encontrado (undefined)

=========== BUSQUEDA DE PERIFERICO ===========
#203 Logitech G Pro (mouse, inalambrico) - $129.99
```
