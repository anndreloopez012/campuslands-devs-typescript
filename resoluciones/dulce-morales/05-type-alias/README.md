# Ejercicio 05: Type Alias

**Contexto:** Catalogo de ropa
**Alumna:** Dulce Morales

## Que hice

- `Talla = "XS" | "S" | "M" | "L" | "XL"`: union literal, solo acepta esas tallas. Si escribes `"XXL"`, TypeScript marca error.
- `CategoriaRopa = "camiseta" | "pantalon" | "chaqueta" | "vestido"`: la categoria tambien esta restringida.
- `Porcentaje` y `Precio`: alias pequenos que reutilizo para no repetir la forma del precio.
- `ProductoRopa`: combina los alias anteriores (`CategoriaRopa`, `Talla[]` y `Precio`).
- Cree un catalogo `ProductoRopa[]` con tres productos.
- Reto extra: `calcularPrecioFinal` aplica el descuento al precio base.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/05-type-alias/index.ts
```

## Salida esperada

```text
=========== CATALOGO DE ROPA ===========
[CH-001] Chaqueta de mezclilla
  Categoria: chaqueta
  Tallas:    S, M, L
  Precio:    $450.00
  Descuento: 20%
  Final:     $360.00
[CA-014] Camiseta oversize
  Categoria: camiseta
  Tallas:    M, L, XL
  Precio:    $180.00
  Descuento: 0%
  Final:     $180.00
[VE-007] Vestido de lino
  Categoria: vestido
  Tallas:    XS, S, M
  Precio:    $620.00
  Descuento: 35%
  Final:     $403.00
========================================
```
