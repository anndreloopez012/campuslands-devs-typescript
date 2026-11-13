export {};

interface Bid {
    bidder: string;
    amount: number;
    time: string;
}

interface Auction {
    car: string;
    reservePrice: number;
    bids: Bid[];
}

const auction: Auction = {
    car: "Aurelio V12",
    reservePrice: 180000,
    bids: [
        { bidder: "Mia", amount: 175000, time: "14:10" },
        { bidder: "Leo", amount: 192000, time: "14:12" },
        { bidder: "Sol", amount: 192000, time: "14:15" },
    ],
};

const winningBid = [...auction.bids].sort(
    (first, second) =>
        second.amount - first.amount || first.time.localeCompare(second.time),
)[0];
const sold = winningBid !== undefined && winningBid.amount >= auction.reservePrice;

console.log(`Subasta: ${auction.car}`);
console.log(`Precio minimo: $${auction.reservePrice}`);
console.log(
    sold
        ? `Ganador: ${winningBid.bidder} con $${winningBid.amount}`
        : "No se alcanzo el precio minimo",
);
