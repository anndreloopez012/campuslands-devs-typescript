class motocicleta {
    modelo: string;
    marca: string; 
    cilindrada: string;
    encendida: boolean; 
    private kilometraje: number


    constructor(modelo: string, marca: string, cilindrada: string, encendida: boolean, kilometraje: number){
        this.modelo = modelo;
        this.marca = marca;
        this.encendida = encendida;
        this.cilindrada = cilindrada; 
        this.kilometraje = kilometraje; 
    }

    get verKilometraje(): number {
        return this.kilometraje;
    }

    moto():void{
        console.log(`La moto es una  ${this.marca} ${this.modelo} es de una cilindrada ${this.cilindrada} con tantos kilometros
            ${this.kilometraje} y esta encendida ${this.encendida}.`)
    }
}

const moto1 = new motocicleta ("R1", "Yamaha", "1000cc", true, 100);
moto1.moto();
console.log(moto1.verKilometraje) //metodo getter