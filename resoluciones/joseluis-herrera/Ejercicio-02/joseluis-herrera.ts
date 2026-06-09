const modelo_moto: string = "Kawasaki Z1000";
const cilindrada: number = 1000;
let estaencendida: boolean = true; 
let Kilometraje: number = 20; 
let conductor: undefined = undefined; 
let modificaciones: string | null = null;

//Reti extra
if (Kilometraje > 3000) {
    console.log("La moto necesita mantenimiento.");
}else{
    console.log("La moto todavia no necesita mantenimiento.")
}

const resumen_moto: string = 'La moto es una ' + modelo_moto 
    + 'de una cilindrada de ' + cilindrada + ' cc, y tiene un kilometraje de ' + Kilometraje + ' km.';

console.log(resumen_moto);      

