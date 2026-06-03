export {};

const marca: string = "Yamaha";
const modelo: string = "MT-07";
const cilindradaCc: number = 689;
const kilometraje: number = 3420;
const estaEncendida: boolean = false;
const proximoMantenimientoKm: number | null = null;
const ultimaRevision: undefined = undefined;

const necesitaMantenimiento: boolean = kilometraje >= 3000;

console.log("Ficha tecnica de moto");
console.log({ marca, modelo, cilindradaCc, kilometraje, estaEncendida, proximoMantenimientoKm, ultimaRevision });
console.log(necesitaMantenimiento ? "Programar mantenimiento preventivo." : "La moto puede seguir en ruta.");
