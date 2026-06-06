// Utilidades genéricas y reutilizables

import type { EntidadConId } from "./maria-montepeque-15-types.js";

export function buscarPorId<T extends EntidadConId>(
  items: readonly T[],
  id: string,
): T | undefined {
  return items.find((item) => item.id === id);
}

export function agruparPor<T, K extends PropertyKey>(
  items: readonly T[],
  obtenerClave: (item: T) => K,
): Map<K, T[]> {
  const grupos = new Map<K, T[]>();

  for (const item of items) {
    const clave = obtenerClave(item);
    const grupo = grupos.get(clave);

    if (grupo) {
      grupo.push(item);
    } else {
      grupos.set(clave, [item]);
    }
  }

  return grupos;
}
