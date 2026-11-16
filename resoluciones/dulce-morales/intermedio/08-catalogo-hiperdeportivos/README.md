# Intermedio 08: Catalogo de hiperdeportivos

**Tematica:** autos, autos de lujo y vehiculos hiperdeportivos
**Alumna:** Dulce Morales

## Problema

Un concesionario de lujo quiere un catalogo que se pueda **filtrar** (presupuesto, tipo de motor, potencia minima, disponibilidad) y **ordenar** por distintos criterios, clasificando cada auto segun sus prestaciones.

## Que hice

### Modelo

- Union types: `Propulsion`, `Categoria`, `Disponibilidad`, `CampoOrden` y `Direccion`.
- `interface Auto`: los datos del auto, todo `readonly`.
- `interface FichaAuto`: datos **calculados** a partir del auto (hp por tonelada, USD por hp, categoria). Asi no se modifica el auto original.
- `interface FiltroCatalogo`: todos sus campos son **opcionales**. Si un filtro no se indica, no filtra.

### Reglas de negocio

- **Categoria:**
  - Hiperdeportivo: 1000 hp o mas, o 400 km/h o mas.
  - Superdeportivo: 600 hp o mas, o 0-100 en 3 s o menos.
  - Si no, Deportivo.
- **hp por tonelada** = potencia / (peso / 1000): mide que tan "ligero" se siente el auto.
- **USD por hp** = precio / potencia: cuanto cuesta cada caballo de fuerza.
- **Validacion:** potencia, peso, 0-100, velocidad y precio deben ser mayores que 0. El peso 0 se rechaza porque dividiria entre 0.
- **Orden:** cualquier campo de `CampoOrden`, ascendente o descendente. En empate se ordena por nombre, asi el resultado siempre sale igual.

### Funciones separadas

- **Validar:** `validarAuto`.
- **Calcular (puras):** `clasificar`, `crearFicha`, `cumpleFiltro`, `valorDeCampo`, `ordenar` (sobre una copia), `buscar`, `contarPorCategoria`.
- **Mostrar:** `dinero`, `formatearFicha`, `imprimirBusqueda` y `main`.

### Casos probados

- **Normal:** catalogo completo ordenado por hp/tonelada. Busqueda de la mejor relacion precio/potencia con minimo 700 hp (el Porsche, de 518 hp, queda fuera).
- **Limite:**
  - El presupuesto de $608,000 es **exacto** al precio del Lamborghini, y si entra.
  - Ferrari y Lamborghini empatan en 2.50 s y se desempatan por nombre.
- **Sin resultados:** "Electricos por menos de $500,000" devuelve 0 autos y muestra un mensaje en vez de una lista vacia.
- **Invalido:** un prototipo con peso 0 se rechaza.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/intermedio/08-catalogo-hiperdeportivos/index.ts
```

## Salida esperada

```text
================== CATALOGO DE HIPERDEPORTIVOS ==================
Autos validos: 8 | rechazados: 1
  x Prototipo Sin datos: peso debe ser mayor que 0 (es 0)
Categorias: 5 hiperdeportivos, 2 superdeportivos, 1 deportivo(s)

--- Catalogo completo por relacion potencia/peso (8) ---
 1. Lotus Evija                   Hiperdeportivo 2011 hp | 1065.7 hp/t | 2.00 s | $2,100,000 ($1,044/hp) | bajo pedido
 2. Koenigsegg Regera             Hiperdeportivo 1500 hp |  921.4 hp/t | 2.80 s | $2,000,000 ($1,333/hp) | agotado
 3. Rimac Nevera                  Hiperdeportivo 1914 hp |  832.2 hp/t | 1.85 s | $2,200,000 ($1,149/hp) | en stock
 4. Bugatti Chiron Super Sport    Hiperdeportivo 1578 hp |  791.0 hp/t | 2.40 s | $3,900,000 ($2,471/hp) | bajo pedido
 5. Ferrari SF90 Stradale         Superdeportivo  986 hp |  628.0 hp/t | 2.50 s |   $524,000 ($531/hp) | en stock
 6. Lamborghini Revuelto          Hiperdeportivo 1001 hp |  564.9 hp/t | 2.50 s |   $608,000 ($607/hp) | en stock
 7. McLaren 750S                  Superdeportivo  740 hp |  532.8 hp/t | 2.80 s |   $330,000 ($446/hp) | en stock
 8. Porsche 911 GT3 RS            Deportivo       518 hp |  357.2 hp/t | 3.20 s |   $241,000 ($465/hp) | bajo pedido

--- Hibridos o electricos hasta $608,000, disponibles, por aceleracion (2) ---
 1. Ferrari SF90 Stradale         Superdeportivo  986 hp |  628.0 hp/t | 2.50 s |   $524,000 ($531/hp) | en stock
 2. Lamborghini Revuelto          Hiperdeportivo 1001 hp |  564.9 hp/t | 2.50 s |   $608,000 ($607/hp) | en stock

--- Mejor relacion precio/potencia (USD por hp), minimo 700 hp (7) ---
 1. McLaren 750S                  Superdeportivo  740 hp |  532.8 hp/t | 2.80 s |   $330,000 ($446/hp) | en stock
 2. Ferrari SF90 Stradale         Superdeportivo  986 hp |  628.0 hp/t | 2.50 s |   $524,000 ($531/hp) | en stock
 3. Lamborghini Revuelto          Hiperdeportivo 1001 hp |  564.9 hp/t | 2.50 s |   $608,000 ($607/hp) | en stock
 4. Lotus Evija                   Hiperdeportivo 2011 hp | 1065.7 hp/t | 2.00 s | $2,100,000 ($1,044/hp) | bajo pedido
 5. Rimac Nevera                  Hiperdeportivo 1914 hp |  832.2 hp/t | 1.85 s | $2,200,000 ($1,149/hp) | en stock
 6. Koenigsegg Regera             Hiperdeportivo 1500 hp |  921.4 hp/t | 2.80 s | $2,000,000 ($1,333/hp) | agotado
 7. Bugatti Chiron Super Sport    Hiperdeportivo 1578 hp |  791.0 hp/t | 2.40 s | $3,900,000 ($2,471/hp) | bajo pedido

--- Electricos por menos de $500,000 (0) ---
Ningun auto cumple los filtros.

Velocidad maxima del catalogo: Bugatti Chiron Super Sport con 440 km/h
```
