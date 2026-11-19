# Intermedio 58: Mini CRM de taller

**Tematica:** motos y mecanica de motos
**Alumna:** Dulce Morales

## Problema

Un taller de motos lleva un mini CRM con clientes, sus motos y los servicios que se les hicieron. Los datos viven en una base de datos remota (simulada, con demora). El CRM debe:

- registrar clientes sin duplicar el correo;
- registrar motos solo de clientes que existen;
- si en un alta nueva falla la moto, **deshacer** el cliente recien creado (como una transaccion);
- mandar recordatorios de mantenimiento por correo **en lote**: algunos envios fallan y el resto sigue.

## Que hice

### Base de datos simulada

`TablaRemota<T, K>` es **generica** en el tipo de fila y en el tipo de clave. Recibe una funcion que saca la clave de cada fila. Todas sus operaciones son `async` y tardan unos milisegundos: `insertar`, `borrar`, `buscar` y `donde(predicado)`.

### Servicio `CrmTaller`

- Las tres tablas (clientes, motos, servicios) son **privadas**.
- `registrarCliente()`: valida el correo (expresion regular), el telefono (10 digitos) y que el correo no se repita, sin importar mayusculas.
- `registrarMoto()`: valida la placa (formato ABC12D), que el cliente exista y que la placa no se repita.
- `altaCompleta()`: crea el cliente y luego la moto. Si la moto falla, el `catch` **borra el cliente** y vuelve a lanzar el error.
- `sinServicioReciente(hoy, meses)`: motos cuyo ultimo servicio fue hace **mas** de 6 meses, o que nunca tuvieron uno. La fecha limite se calcula con `new Date(anio, mes - 6, dia)`.

### Errores tipados

`ErrorDuplicado`, `ErrorNoEncontrado`, `ErrorValidacion` y `ErrorEnvio`, unidos en `type ErrorCrm` con el type guard `esErrorCrm`.

`intentar<T>()` es una funcion generica async que ejecuta cada operacion, muestra el resultado o el error tipado, y vuelve a lanzar cualquier error inesperado.

### Envios en lote

Los recordatorios se mandan juntos con `Promise.allSettled`, asi un correo que falla no detiene a los demas.

### Casos probados

- **Altas correctas:** Laura, Pedro y Sara, cada una con su moto.
- **Validaciones:**
  - correo repetido (aunque cambien las mayusculas);
  - correo invalido;
  - telefono corto;
  - moto de un cliente que no existe;
  - servicio a una placa que no existe.
- **Transaccion:** el alta de Mario falla por la placa repetida, asi que Mario **no queda guardado** (siguen siendo 3 clientes).
- **Limite de 6 meses:** el ultimo servicio de Sara fue el 16/05, **exactamente** 6 meses antes de hoy, asi que no recibe recordatorio.
- **Recordatorios:** Pedro (servicio de hace 8 meses) y la segunda moto de Laura (sin servicios). El correo de Pedro falla porque su dominio ya no existe; el de Laura se envia.

## Como ejecutarlo

```bash
npm run dev -- intermedio/ejercicios/58-crm-taller/resoluciones/dulce-morales/index.ts
```

## Salida esperada

```text
================ REGISTROS ================
OK Alta Laura: Laura Rios (#1) con Yamaha MT-03 KMT23A
OK Alta Pedro: Pedro Gil (#2) con Honda CB190 BCD45E
OK Alta Sara: Sara Vega (#3) con Suzuki Gixxer FGH67J
X  Alta correo repetido: [ErrorDuplicado] ya existe un registro con correo "LAURA@mail.com"
X  Alta correo invalido: [ErrorValidacion] correo invalido: "tito-arroba-mail"
X  Alta telefono corto: [ErrorValidacion] telefono invalido: "12345" (deben ser 10 digitos)
X  Alta con placa repetida: [ErrorDuplicado] ya existe un registro con placa "KMT23A"
X  Moto de cliente inexistente: [ErrorNoEncontrado] cliente 99 no existe
OK Segunda moto de Laura: Kawasaki Z400 LMN01P
Clientes guardados: 3 (Mario no quedo guardado porque su moto fallo)

================ SERVICIOS ================
OK Servicio KMT23A: cambio de aceite
OK Servicio BCD45E: frenos
OK Servicio FGH67J: afinacion
X  Servicio a placa inexistente: [ErrorNoEncontrado] moto ZZZ00Z no existe

================ RECORDATORIOS (sin servicio en mas de 6 meses) ================
- Pedro Gil: Honda CB190 BCD45E, ultimo servicio 2/3/2026
- Laura Rios: Kawasaki Z400 LMN01P, ultimo servicio nunca
  X  [ErrorEnvio] no se pudo enviar a pedro@correo-viejo.com: el dominio ya no existe
  OK enviado "Tu Kawasaki Z400 necesita mantenimiento" a laura@mail.com
Enviados 1 de 2
```
