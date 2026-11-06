// Solución Ejercicio Intermedio 57 - Stefani Sánchez
export {};

// El panel se dibuja como texto para poder ejecutarlo con Node; en un navegador
// la funcion renderizar() seria la unica que tocaria el DOM.

type LecturaSensor =
  | { readonly tipo: "temperatura"; readonly celsius: number }
  | { readonly tipo: "rpm"; readonly valor: number }
  | { readonly tipo: "combustible"; readonly porcentaje: number }
  | { readonly tipo: "presion-llanta"; readonly llanta: "delantera" | "trasera"; readonly psi: number };

interface Alerta {
  readonly nivel: "aviso" | "critica";
  readonly mensaje: string;
}

const esperar = (ms: number): Promise<void> => new Promise((resolver) => setTimeout(resolver, ms));

async function* streamSensores(): AsyncGenerator<LecturaSensor> {
  const lecturas: LecturaSensor[] = [
    { tipo: "temperatura", celsius: 85 },
    { tipo: "rpm", valor: 6200 },
    { tipo: "presion-llanta", llanta: "delantera", psi: 33 },
    { tipo: "combustible", porcentaje: 14 },
    { tipo: "temperatura", celsius: 112 },
    { tipo: "rpm", valor: 13800 },
    { tipo: "presion-llanta", llanta: "trasera", psi: 21 },
    { tipo: "combustible", porcentaje: 4 },
  ];
  for (const lectura of lecturas) {
    await esperar(5);
    yield lectura;
  }
}

const evaluar = (lectura: LecturaSensor): Alerta | null => {
  switch (lectura.tipo) {
    case "temperatura":
      if (lectura.celsius >= 110) return { nivel: "critica", mensaje: `Motor a ${lectura.celsius} C` };
      return lectura.celsius >= 100 ? { nivel: "aviso", mensaje: `Motor calentandose (${lectura.celsius} C)` } : null;
    case "rpm":
      return lectura.valor > 13000 ? { nivel: "critica", mensaje: `RPM en zona roja (${lectura.valor})` } : null;
    case "combustible":
      if (lectura.porcentaje < 5) return { nivel: "critica", mensaje: `Combustible al ${lectura.porcentaje}%` };
      return lectura.porcentaje < 15 ? { nivel: "aviso", mensaje: `Combustible bajo (${lectura.porcentaje}%)` } : null;
    case "presion-llanta":
      return lectura.psi < 28 ? { nivel: "aviso", mensaje: `Llanta ${lectura.llanta} con ${lectura.psi} psi` } : null;
  }
};

const describir = (lectura: LecturaSensor): string => {
  switch (lectura.tipo) {
    case "temperatura":
      return `Temperatura: ${lectura.celsius} C`;
    case "rpm":
      return `RPM: ${lectura.valor}`;
    case "combustible":
      return `Combustible: ${lectura.porcentaje}%`;
    case "presion-llanta":
      return `Llanta ${lectura.llanta}: ${lectura.psi} psi`;
  }
};

const renderizar = (lectura: LecturaSensor, alerta: Alerta | null): void => {
  const marca = alerta ? (alerta.nivel === "critica" ? "[!!]" : "[! ]") : "[ok]";
  console.log(`  ${marca} ${describir(lectura)}${alerta ? ` <- ${alerta.mensaje}` : ""}`);
};

const main = async (): Promise<void> => {
  console.log("Ejercicio 57: Panel de sensores de moto");
  const alertas: Alerta[] = [];

  for await (const lectura of streamSensores()) {
    const alerta = evaluar(lectura);
    if (alerta) alertas.push(alerta);
    renderizar(lectura, alerta);
  }

  const criticas = alertas.filter((a) => a.nivel === "critica").length;
  console.log(`Alertas: ${alertas.length} (${criticas} critica(s))`);
};

void main();
