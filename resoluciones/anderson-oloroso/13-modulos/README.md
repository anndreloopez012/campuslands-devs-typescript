# Ejercicio 13: Modulos

**Contexto:** Aplicacion de viajes

## Objetivo

separar responsabilidades usando `export` e `import`.

## Instrucciones

Divide una app de viajes entre `index.ts`, `utilidades.ts` y `datos.json`.

Trabaja en `index.ts` y ejecuta el archivo para validar tu avance.

## Pistas

- Exporta funciones desde `utilidades.ts`.
- Importa datos desde JSON si `resolveJsonModule` esta activo.
- Mantén `index.ts` como punto de entrada.

## Restricciones

- Debe existir `utilidades.ts`.
- Debe existir `datos.json`.
- No pongas toda la logica en `index.ts`.

## Reto Extra

Filtra destinos por presupuesto maximo.

## Resultado Esperado

La app carga destinos desde JSON y muestra opciones disponibles.
