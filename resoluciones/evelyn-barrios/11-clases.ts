export {};

class Motocicleta {
  protected encendida: boolean = false;

  constructor(
    public readonly marca: string,
    public modelo: string,
  ) {}

  conmutarMotor(): void {
    this.encendida = !this.encendida;
    console.log(
      `La ${this.marca} ahora está ${this.encendida ? "encendida" : "apagada"}.`,
    );
  }

  public verEstado(): string {
    return this.encendida ? "En marcha" : "Detenida";
  }
}

const miMoto = new Motocicleta("Yamaha", "MT-07");
miMoto.conmutarMotor();
