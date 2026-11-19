# Intermedio 80 - Cotizador arquitectura 3D

**Tematica:** diseno 3D arquitectura
**Alumna:** Dulce Morales

## Problema

El cotizador de un despacho de arquitectura que hace diseno y visualizacion 3D. A partir de una
solicitud hay que calcular el precio por partidas, aplicar factores, armar el calendario de pagos y
guardar las cotizaciones con sus versiones, porque el cliente suele pedir cambios.

## Que hice

- **`SolicitudDTO`**: el formulario de entrada. Incluye el tipo de proyecto, el estilo, los m2, los
  niveles, el plazo y los entregables (planos, modelo 3D, renders exteriores e interiores y segundos
  de recorrido).
- **`validar`**: junta todos los errores, por ejemplo que no se piden renders sin modelo 3D o que una
  casa no tiene mas de 4 niveles.
- **`cotizar`**: es una funcion pura. Arma las `Partida`s y aplica en orden el descuento por volumen,
  el estilo, los niveles, la urgencia y el minimo. Cada factor queda explicado en el desglose.
- **`CotizacionDTO`**: el DTO de salida, listo para mostrar o exportar. Incluye partidas, factores,
  IVA, plazo y los tres pagos (30 / 30 / 40 %). Los centavos de redondeo se ajustan en el ultimo pago
  para que la suma sea exacta.
- **`RepoCotizaciones`**: un repositorio en memoria con folios consecutivos y versiones. `revisar`
  agrega una version nueva al mismo folio, y el historial muestra cuanto cambio cada una.
- **Reporte**: cartera vigente (la ultima version de cada folio), anticipos esperados y el proyecto
  mas grande.

## Reglas

| Regla | Valor |
|---|---|
| Planos por m2 | casa $180, departamentos $140, local $160, oficinas $150 |
| Modelo 3D | $60/m2 |
| Renders | exterior $4,500, interior $3,500 |
| Recorrido | $350 por segundo (maximo 600 s) |
| Volumen | desde 1000 m2 (inclusivo): -10 % sobre los planos |
| Estilo | minimalista x1, contemporaneo x1.05, industrial x1.1, colonial x1.25 |
| Niveles | +8 % por cada nivel arriba del primero |
| Plazo normal | planos 2 sem por cada 500 m2, modelo 2 sem, 4 renders por semana, 1 sem por minuto de recorrido |
| Urgencia | +5 % por semana recortada; se puede recortar hasta la mitad del plazo normal |
| Minimo | $25,000 antes de IVA |
| IVA | 16 % |

## Casos probados

- **Casa contemporanea de 2 niveles:** cotizacion completa con desglose y pagos.
- **Version 2:** sin recorrido y con 1 semana menos, se cobra 5 % de urgencia. El historial muestra la
  diferencia contra la v1.
- **Version 3:** pide 2 semanas cuando el minimo con urgencia es 4, y se rechaza sin crear version.
- **Torre de departamentos (caso limite):** con 1000 m2 justos aplica el descuento por volumen,
  ademas del estilo industrial y 6 niveles.
- **Cafe pequeno:** su subtotal de $9,700 sube al minimo de $25,000.
- **Solicitud con 6 errores:** se rechaza listandolos todos.
- **Folio inexistente:** se rechaza.
- **Reporte del despacho:** cartera, anticipos y proyecto mas grande.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/80-cotizador-arquitectura/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text

--- Casa contemporanea ---
  ARQ-001 v1 - Familia Ortega
    Planos arquitectonicos (casa)              220 m2   x    $180.00 =    $39,600.00
    Modelo 3D                                  220 m2   x     $60.00 =    $13,200.00
    Render exterior                              2 pza  x  $4,500.00 =     $9,000.00
    Render interior                              4 pza  x  $3,500.00 =    $14,000.00
    Recorrido virtual                           45 seg  x    $350.00 =    $15,750.00
    Subtotal                                                                    $91,550.00
      estilo contemporaneo x1.05: +$4,577.50
      2 niveles (+8% por nivel extra): +$7,690.20
    Total antes de IVA                                                         $103,817.70
    IVA 16%                                                                     $16,610.83
    TOTAL                                                                      $120,428.53
    Plazo normal: 7 semanas | Pagos: Anticipo (sem 0) $36,128.56 | Entrega de anteproyecto (sem 4) $36,128.56 | Entrega final (sem 7) $48,171.41

--- Casa v2: urgente y sin recorrido ---
  ARQ-001 v2 - Familia Ortega
    Planos arquitectonicos (casa)              220 m2   x    $180.00 =    $39,600.00
    Modelo 3D                                  220 m2   x     $60.00 =    $13,200.00
    Render exterior                              2 pza  x  $4,500.00 =     $9,000.00
    Render interior                              4 pza  x  $3,500.00 =    $14,000.00
    Subtotal                                                                    $75,800.00
      estilo contemporaneo x1.05: +$3,790.00
      2 niveles (+8% por nivel extra): +$6,367.20
      urgencia (1 sem menos) +5%: +$4,297.86
    Total antes de IVA                                                          $90,255.06
    IVA 16%                                                                     $14,440.81
    TOTAL                                                                      $104,695.87
    Plazo normal: 6 semanas | Pagos: Anticipo (sem 0) $31,408.76 | Entrega de anteproyecto (sem 3) $31,408.76 | Entrega final (sem 5) $41,878.35

--- Casa v3: plazo imposible ---
  RECHAZADA: plazo imposible: 2 sem (minimo 4 con urgencia, normal 7)

--- Torre de departamentos (limite: 1000 m2 justos) ---
  ARQ-002 v1 - Inmobiliaria Norte
    Planos arquitectonicos (departamentos)    1000 m2   x    $140.00 =   $140,000.00
    Modelo 3D                                 1000 m2   x     $60.00 =    $60,000.00
    Render exterior                              6 pza  x  $4,500.00 =    $27,000.00
    Render interior                              6 pza  x  $3,500.00 =    $21,000.00
    Recorrido virtual                          120 seg  x    $350.00 =    $42,000.00
    Subtotal                                                                   $290,000.00
      descuento por volumen (1000 m2 >= 1000) -10% planos: -$14,000.00
      estilo industrial x1.1: +$27,600.00
      6 niveles (+8% por nivel extra): +$121,440.00
    Total antes de IVA                                                         $425,040.00
    IVA 16%                                                                     $68,006.40
    TOTAL                                                                      $493,046.40
    Plazo normal: 11 semanas | Pagos: Anticipo (sem 0) $147,913.92 | Entrega de anteproyecto (sem 6) $147,913.92 | Entrega final (sem 11) $197,218.56

--- Cafe pequeno (sube al minimo) ---
  ARQ-003 v1 - Cafe Lupita
    Modelo 3D                                   45 m2   x     $60.00 =     $2,700.00
    Render interior                              2 pza  x  $3,500.00 =     $7,000.00
    Subtotal                                                                     $9,700.00
      ajuste a minimo de $25000: +$15,300.00
    Total antes de IVA                                                          $25,000.00
    IVA 16%                                                                      $4,000.00
    TOTAL                                                                       $29,000.00
    Plazo normal: 3 semanas | Pagos: Anticipo (sem 0) $8,700.00 | Entrega de anteproyecto (sem 2) $8,700.00 | Entrega final (sem 3) $11,600.00

--- Solicitud con errores ---
  RECHAZADA: cliente vacio; m2 debe estar entre 40 y 20000; una casa no puede tener mas de 4 niveles; recorrido maximo 600 s; renders y recorrido requieren el modelo 3D; plazo invalido

--- Folio inexistente ---
  RECHAZADA: folio ARQ-999 no existe

=== Historial de ARQ-001 ===
  v1: $120,428.53 en 7 semanas
  v2: $104,695.87 en 5 semanas (-$15,732.66 vs v1)

=== Reporte del despacho ===
  Cotizaciones vigentes: 3 | cartera: $626,742.27 | anticipos esperados: $188,022.68
  Proyecto mas grande: ARQ-002 Inmobiliaria Norte ($493,046.40)
```
