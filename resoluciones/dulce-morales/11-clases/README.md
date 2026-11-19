# Ejercicio 11: Clases

**Contexto:** Sistema de motocicletas
**Alumna:** Dulce Morales

## Que hice

- Cree la clase `Motocicleta`, sin herencia.
- **Constructor:** recibe marca, modelo, cilindrada y kilometraje inicial (opcional, por defecto 0), y deja la moto apagada.
- **Propiedades:**
  - `marca`, `modelo` y `cilindrada` son `public readonly`: se pueden leer, pero no cambiar.
  - `encendida` y `kilometraje` son `private`: solo la clase puede cambiarlos.
- **Metodos:**
  - `encender()` y `apagar()` cambian el estado y avisan si ya estaba asi.
  - `recorrer(kilometros)` suma kilometros solo si la moto esta encendida y la distancia es mayor que 0. Es la unica forma de aumentar el kilometraje.
  - `mostrarEstado()` devuelve un resumen de la moto.
- **Reto extra:** el getter `kilometrajeActual` deja consultar el kilometraje. No tiene setter, asi que no se puede cambiar desde fuera.

## Como ejecutarlo

```bash
npm run dev -- resoluciones/dulce-morales/11-clases/index.ts
```

## Salida esperada

```text
========= SISTEMA DE MOTOCICLETAS =========
Estado inicial: Kawasaki Ninja 400 (399 cc) | Apagada | 1200 km
No se puede recorrer: Ninja 400 esta apagada.
Ninja 400 encendida. Brrrum!
Ninja 400 recorrio 85 km.
Distancia invalida: -10 km.
Ninja 400 recorrio 42 km.
Ninja 400 apagada.
Estado final:   Kawasaki Ninja 400 (399 cc) | Apagada | 1327 km
Kilometraje (getter): 1327 km
===========================================
```
