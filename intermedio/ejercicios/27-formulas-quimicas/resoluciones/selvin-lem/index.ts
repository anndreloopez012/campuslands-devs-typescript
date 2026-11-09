export {};

interface FormulaCheck {
    formula: string;
    valid: boolean;
    atoms: Record<string, number>;
}

const formulas = ["H2O", "CO2", "NaCl", "Mg(OH)2", "2H2O", "C6H12O6"];

const checkFormula = (formula: string): FormulaCheck => {
    const parts = formula.match(/[A-Z][a-z]?\d*/g) ?? [];
    const atoms: Record<string, number> = {};

    for (const part of parts) {
        const [, element, amount] = part.match(/^([A-Z][a-z]?)(\d*)$/) ?? [];
        if (!element) {
            return { formula, valid: false, atoms: {} };
        }
        atoms[element] = (atoms[element] ?? 0) + Number(amount || 1);
    }

    return {
        formula,
        valid: parts.join("") === formula && parts.length > 0,
        atoms,
    };
};

const results = formulas.map(checkFormula);

results.forEach((result) => {
    const composition = result.valid ? JSON.stringify(result.atoms) : "formato no valido";
    console.log(`${result.formula}: ${composition}`);
});
