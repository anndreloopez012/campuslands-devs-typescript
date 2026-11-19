# Intermedio 73 - Tienda de ropa con filtros

**Tematica:** ropa
**Alumna:** Dulce Morales

## Problema

El catalogo de una tienda en linea con filtros por categoria, talla, color, precio y disponibilidad,
ademas de orden, paginacion y los contadores ("facetas") que aparecen junto a cada casilla.

## Que hice

- **Entrada desde la URL**: los filtros llegan en el query string, por ejemplo
  `?talla=M&color=negro&min=200&orden=precio-desc&pagina=2`, y todo es texto.
- **Conversion a DTO**: `parsearQuery` usa `URLSearchParams` y el type guard generico `enLista` para
  convertir ese texto en un `FiltroDTO` tipado. Los valores invalidos no rompen la busqueda: se
  ignoran y quedan registrados como avisos.
- **Repositorio**: `RepoProductos` guarda los productos en memoria. Cada producto tiene variantes
  (talla, color y stock).
- **Servicio**: `buscar` filtra, ordena con un `Record<Orden, comparador>`, pagina y devuelve un
  `PaginaDTO` con tarjetas (`TarjetaDTO`) listas para pintar.
- **Facetas**: cada una se calcula ignorando su propio filtro. Asi, con `talla=M` seleccionado, la
  faceta de talla sigue mostrando cuantos productos habria en S, L, etc.
- **Reporte de inventario**: por categoria muestra unidades, valor a precio final y variantes agotadas.

## Reglas

| Regla | Detalle |
|---|---|
| Talla y color | aceptan varios valores separados por coma; se ignoran mayusculas y repetidos |
| Precio | se filtra por precio final (con descuento); `min` y `max` son inclusivos |
| min > max | se intercambian con aviso |
| `disponible=1` | solo cuentan variantes con stock |
| Coincidencia | un producto aparece si al menos una variante cumple talla, color y stock a la vez |
| Paginas | 3 productos por pagina; una pagina inexistente muestra la ultima |
| Orden invalido | se usa `precio-asc` |

## Casos probados

- Sin filtros (pagina 1 y pagina 3).
- Categoria y talla en minusculas, ordenadas por precio descendente.
- Talla M + negro + disponible: solo el Jogger, porque la Playera basica M negro no tiene stock.
- `min` mayor que `max` (se intercambian) con orden por descuento.
- Caso limite: `min = max = 599` encuentra el vestido de $599, porque el filtro es inclusivo.
- Rango sin resultados.
- Orden "nuevo" con varios colores.
- URL llena de valores invalidos: todo se ignora con avisos y la pagina se ajusta.
- Reporte de inventario, incluido un producto completamente agotado.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/73-tienda-ropa-filtros/index.ts
```

## Salida esperada

```text

GET /tienda
  8 resultado(s), pagina 1/3
   - [PL-01] Playera basica         $ 199              tallas S/M/L     colores negro/blanco
   - [PL-02] Playera estampada      $ 239 (antes $299) tallas M/L       colores azul/rojo
   - [PL-03] Polo clasica           $ 450              tallas M/XL      colores verde/negro
  facetas talla: XS(1) S(4) M(8) L(5) XL(1)
  facetas color: negro(6) blanco(1) azul(3) rojo(3) verde(3)
  facetas categoria: playera(3) pantalon(2) chamarra(2) vestido(1)

GET /tienda?pagina=3
  8 resultado(s), pagina 3/3
   - [CH-02] Rompevientos           $ 899              tallas S/M       colores rojo/negro
   - [CH-01] Chamarra de mezclilla  $1019 (antes $1199) tallas M/L       colores azul
  facetas talla: XS(1) S(4) M(8) L(5) XL(1)
  facetas color: negro(6) blanco(1) azul(3) rojo(3) verde(3)
  facetas categoria: playera(3) pantalon(2) chamarra(2) vestido(1)

GET /tienda?categoria=playera&talla=m&orden=precio-desc
  3 resultado(s), pagina 1/1
   - [PL-03] Polo clasica           $ 450              tallas M         colores verde
   - [PL-02] Playera estampada      $ 239 (antes $299) tallas M         colores azul
   - [PL-01] Playera basica         $ 199              tallas M         colores negro/blanco
  facetas talla: XS(0) S(1) M(3) L(2) XL(1)
  facetas color: negro(1) blanco(1) azul(1) rojo(0) verde(1)
  facetas categoria: playera(3) pantalon(2) chamarra(2) vestido(1)

GET /tienda?talla=M&color=negro&disponible=1
  1 resultado(s), pagina 1/1
   - [PA-02] Jogger                 $ 499              tallas M         colores negro
  facetas talla: XS(0) S(2) M(1) L(0) XL(1)
  facetas color: negro(1) blanco(1) azul(3) rojo(0) verde(1)
  facetas categoria: playera(0) pantalon(1) chamarra(0) vestido(0)

GET /tienda?min=600&max=200&orden=descuento
  aviso: min 600 > max 200: se intercambian
  5 resultado(s), pagina 1/2
   - [PA-01] Jeans rectos           $ 489 (antes $699) tallas S/M/L     colores azul/negro
   - [VE-01] Vestido midi           $ 599 (antes $799) tallas XS/S/M    colores rojo/negro/verde
   - [PL-02] Playera estampada      $ 239 (antes $299) tallas M/L       colores azul/rojo
  facetas talla: XS(1) S(2) M(5) L(3) XL(1)
  facetas color: negro(4) blanco(0) azul(2) rojo(2) verde(3)
  facetas categoria: playera(2) pantalon(2) chamarra(0) vestido(1)

GET /tienda?min=599&max=599&orden=nombre
  1 resultado(s), pagina 1/1
   - [VE-01] Vestido midi           $ 599 (antes $799) tallas XS/S/M    colores rojo/negro/verde
  facetas talla: XS(1) S(1) M(1) L(0) XL(0)
  facetas color: negro(1) blanco(0) azul(0) rojo(1) verde(1)
  facetas categoria: playera(0) pantalon(0) chamarra(0) vestido(1)

GET /tienda?min=1000&max=1000
  0 resultado(s), pagina 1/1
  facetas talla: XS(0) S(0) M(0) L(0) XL(0)
  facetas color: negro(0) blanco(0) azul(0) rojo(0) verde(0)
  facetas categoria: playera(0) pantalon(0) chamarra(0) vestido(0)

GET /tienda?orden=nuevo&disponible=1&color=azul,verde
  5 resultado(s), pagina 1/2
   - [PA-02] Jogger                 $ 499              tallas L         colores verde
   - [PL-02] Playera estampada      $ 239 (antes $299) tallas M         colores azul
   - [VE-01] Vestido midi           $ 599 (antes $799) tallas M         colores verde
  facetas talla: XS(0) S(1) M(4) L(1) XL(0)
  facetas color: negro(4) blanco(1) azul(3) rojo(2) verde(2)
  facetas categoria: playera(1) pantalon(2) chamarra(1) vestido(1)

GET /tienda?categoria=zapatos&talla=M,XXL,M&color=morado&orden=barato&pagina=9
  aviso: categoria "zapatos" ignorada
  aviso: orden "barato" no valido, se usa precio-asc
  aviso: talla "XXL" ignorado
  aviso: color "morado" ignorado
  aviso: pagina 9 no existe, se muestra la 3
  8 resultado(s), pagina 3/3
   - [CH-02] Rompevientos           $ 899              tallas M         colores negro
   - [CH-01] Chamarra de mezclilla  $1019 (antes $1199) tallas M         colores azul
  facetas talla: XS(1) S(4) M(8) L(5) XL(1)
  facetas color: negro(3) blanco(1) azul(3) rojo(0) verde(2)
  facetas categoria: playera(3) pantalon(2) chamarra(2) vestido(1)

=== Reporte de inventario ===
  playera   productos 3 | unidades  23 | valor $  5741 | variantes agotadas 2
  pantalon  productos 2 | unidades  18 | valor $  8902 | variantes agotadas 1
  chamarra  productos 2 | unidades   1 | valor $  1019 | variantes agotadas 3
  vestido   productos 1 | unidades   7 | valor $  4193 | variantes agotadas 0
  Productos completamente agotados: Rompevientos
```
