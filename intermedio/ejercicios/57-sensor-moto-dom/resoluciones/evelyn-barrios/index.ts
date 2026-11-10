export {};

type NivelAlerta = "NORMAL" | "PRECAUCION" | "CRITICO";

interface LecturaSensorMoto {
  readonly idSensor: string;
  readonly nombre: string;
  readonly valor: number;
  readonly unidad: string;
  readonly limiteSeguro: number;
}

interface EstadoPanelSensor {
  readonly sensor: LecturaSensorMoto;
  readonly alerta: NivelAlerta;
  readonly mensajeDiagnostico: string;
  readonly timestamp: number;
}

async function obtenerTelemetriaSensores(): Promise<LecturaSensorMoto[]> {
  await new Promise((resolve) => setTimeout(resolve, 15));
  return [
    { idSensor: "temp-motor", nombre: "Temperatura de Motor", valor: 104, unidad: "C", limiteSeguro: 100 },
    { idSensor: "pres-aceite", nombre: "Presion de Aceite", valor: 38, unidad: "PSI", limiteSeguro: 30 },
    { idSensor: "rpm-actual", nombre: "Tacometro RPM", valor: 11200, unidad: "RPM", limiteSeguro: 12500 },
    { idSensor: "bateria-volt", nombre: "Voltaje de Bateria", valor: 13.8, unidad: "V", limiteSeguro: 12.0 },
  ];
}

function evaluarAlertaSensor(sensor: LecturaSensorMoto): NivelAlerta {
  if (sensor.idSensor === "temp-motor") {
    if (sensor.valor > sensor.limiteSeguro + 10) return "CRITICO";
    if (sensor.valor > sensor.limiteSeguro) return "PRECAUCION";
    return "NORMAL";
  }
  return "NORMAL";
}

async function renderizarPanelDiagnostico() {
  console.log("=== PANEL DOM DE SENSORES DE MOTO ===");
  const sensores = await obtenerTelemetriaSensores();

  const diagnosticos: EstadoPanelSensor[] = sensores.map((s) => {
    const alerta = evaluarAlertaSensor(s);
    return {
      sensor: s,
      alerta,
      mensajeDiagnostico: alerta === "NORMAL" ? "Operacion nominal dentro de tolerancias" : "Parametro fuera del rango nominal",
      timestamp: Date.now(),
    };
  });

  diagnosticos.forEach((d) => {
    console.log(`[${d.alerta}] ${d.sensor.nombre}: ${d.sensor.valor} ${d.sensor.unidad} -> ${d.mensajeDiagnostico}`);
  });
}

renderizarPanelDiagnostico();
