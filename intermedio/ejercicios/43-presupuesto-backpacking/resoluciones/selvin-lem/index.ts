export {};

type ExpenseCategory = "hospedaje" | "comida" | "transporte" | "actividades";

interface Expense {
    place: string;
    category: ExpenseCategory;
    amount: number;
}

class TripBudget<T extends ExpenseCategory> {
    constructor(private readonly expenses: Expense[]) {}

    total(): number {
        return this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    }

    byCategory(): Record<T, number> {
        return this.expenses.reduce(
            (totals, expense) => {
                totals[expense.category as T] += expense.amount;
                return totals;
            },
            { hospedaje: 0, comida: 0, transporte: 0, actividades: 0 } as Record<T, number>,
        );
    }
}

const expenses: Expense[] = [
    { place: "Hostal Centro", category: "hospedaje", amount: 120 },
    { place: "Mercado", category: "comida", amount: 35 },
    { place: "Bus regional", category: "transporte", amount: 48 },
    { place: "Museo", category: "actividades", amount: 18 },
    { place: "Cafe", category: "comida", amount: 12 },
];

const budget = new TripBudget<ExpenseCategory>(expenses);
console.log(`Gasto total: $${budget.total()}`);
console.log(`Gastos por categoria: ${JSON.stringify(budget.byCategory())}`);
