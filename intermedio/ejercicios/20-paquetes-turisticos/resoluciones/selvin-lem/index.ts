export {};

interface TravelPackage {
    name: string;
    destination: string;
    nights: number;
    price: number;
    rating: number;
}

const packages: TravelPackage[] = [
    { name: "Costa y sol", destination: "Cartagena", nights: 5, price: 640, rating: 4.7 },
    { name: "Montana verde", destination: "Salento", nights: 3, price: 330, rating: 4.8 },
    { name: "Ruta colonial", destination: "Popayan", nights: 4, price: 420, rating: 4.3 },
];

const ranked = [...packages].sort(
    (first, second) => first.price / first.nights - second.price / second.nights,
);

ranked.forEach((travel) => {
    const nightlyPrice = travel.price / travel.nights;
    console.log(
        `${travel.name} - ${travel.destination} | $${travel.price} | $${nightlyPrice.toFixed(2)} por noche | ${travel.rating}/5`,
    );
});
