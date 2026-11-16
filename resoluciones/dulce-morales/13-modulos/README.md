# Ejercicio 13: Modulos

**Contexto:** Aplicacion de viajes
**Alumna:** Dulce Morales

## Que hice

Dividi la app en tres archivos, cada uno con su responsabilidad:

| Archivo | Que hace |
|---|---|
| `datos.json` | Solo los datos: seis destinos con ciudad, pais, presupuesto, dias y actividades. |
| `utilidades.ts` | Toda la logica. Exporta el tipo `Destino` y las funciones `filtrarPorPresupuesto`, `ordenarPorPrecio`, `costoPorDia`, `formatearDestino` y `mostrarDestinos`. |
| `index.ts` | Punto de entrada. Importa los datos del JSON y las funciones, y solo decide que mostrar. |

- El JSON se importa con `import datos from "./datos.json" with { type: "json" }` (funciona porque `resolveJsonModule` esta activo).
- El tipo se importa con `import type { Destino }`, porque solo se usa para tipar.
- `ordenarPorPrecio` hace una copia con `[...]` para no cambiar el array original.
- Reto extra: `filtrarPorPresupuesto(destinos, presupuestoMaximo)` devuelve solo los destinos que caben en el presupuesto. Si no hay ninguno, se muestra un aviso.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/13-modulos/index.ts
```

## Salida esperada

```text
=== TODOS LOS DESTINOS (6) ===
1. Antigua Guatemala, Guatemala  $380 (4 dias, ~$95/dia) | volcanes, cafe, arquitectura colonial
2. Medellin, Colombia            $420 (5 dias, ~$84/dia) | turismo urbano, comida, parapente
3. Ciudad de Mexico, Mexico      $580 (5 dias, ~$116/dia) | museos, comida, musica
4. Cusco, Peru                   $650 (6 dias, ~$108/dia) | arquitectura, historia, senderismo
5. San Jose, Costa Rica          $720 (6 dias, ~$120/dia) | selva, playa, canopy
6. Buenos Aires, Argentina       $890 (7 dias, ~$127/dia) | tango, gastronomia, teatro

=== DENTRO DE TU PRESUPUESTO: $600 (3) ===
1. Antigua Guatemala, Guatemala  $380 (4 dias, ~$95/dia) | volcanes, cafe, arquitectura colonial
2. Medellin, Colombia            $420 (5 dias, ~$84/dia) | turismo urbano, comida, parapente
3. Ciudad de Mexico, Mexico      $580 (5 dias, ~$116/dia) | museos, comida, musica

=== PRESUPUESTO DE $300 ===
No hay destinos disponibles.
```
