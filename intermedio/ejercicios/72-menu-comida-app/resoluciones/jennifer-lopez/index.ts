export {};

type FoodCategory = 'entrada' | 'plato-fuerte' | 'postre';

interface MenuItem {
  readonly id: number;
  readonly name: string;
  readonly category: FoodCategory;
  readonly price: number;
  readonly available: boolean;
}

interface CartLine {
  readonly itemId: number;
  readonly name: string;
  readonly unitPrice: number;
  readonly quantity: number;
}

type CartAction =
  | { readonly type: 'add'; readonly item: MenuItem }
  | { readonly type: 'remove'; readonly itemId: number }
  | { readonly type: 'clear' };

function cartReducer(
  cart: readonly CartLine[],
  action: CartAction,
): CartLine[] {
  switch (action.type) {
    case 'add': {
      const existing = cart.find((line) => line.itemId === action.item.id);
      if (!existing) {
        return [
          ...cart,
          {
            itemId: action.item.id,
            name: action.item.name,
            unitPrice: action.item.price,
            quantity: 1,
          },
        ];
      }
      return cart.map((line) =>
        line.itemId === action.item.id
          ? { ...line, quantity: line.quantity + 1 }
          : line,
      );
    }
    case 'remove':
      return cart.filter((line) => line.itemId !== action.itemId);
    case 'clear':
      return [];
  }
}

function cartTotal(cart: readonly CartLine[]): number {
  return cart.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
}

function createMenuApp(page: Document, menu: readonly MenuItem[]): HTMLElement {
  let cart: CartLine[] = [];
  const app = page.createElement('main');
  app.setAttribute('aria-label', 'Menú del restaurante');

  const render = (): void => {
    app.replaceChildren();
    const heading = page.createElement('h1');
    heading.textContent = 'Menú del día';
    app.append(heading);

    const menuList = page.createElement('section');
    menuList.setAttribute('aria-label', 'Platos disponibles');
    for (const item of menu) {
      const card = page.createElement('article');
      const description = page.createElement('p');
      description.textContent = `${item.name} · ${item.category} · $${item.price.toLocaleString('es-CO')}`;
      const addButton = page.createElement('button');
      addButton.type = 'button';
      addButton.textContent = item.available ? 'Agregar' : 'Agotado';
      addButton.disabled = !item.available;
      addButton.addEventListener('click', () => {
        cart = cartReducer(cart, { type: 'add', item });
        render();
      });
      card.append(description, addButton);
      menuList.append(card);
    }
    app.append(menuList);

    const cartSection = page.createElement('section');
    const cartHeading = page.createElement('h2');
    cartHeading.textContent = 'Tu pedido';
    cartSection.append(cartHeading);
    if (cart.length === 0) {
      const emptyMessage = page.createElement('p');
      emptyMessage.textContent = 'Aún no has agregado platos.';
      cartSection.append(emptyMessage);
    }
    for (const line of cart) {
      const row = page.createElement('p');
      row.textContent = `${line.name} × ${line.quantity}`;
      const removeButton = page.createElement('button');
      removeButton.type = 'button';
      removeButton.textContent = 'Quitar';
      removeButton.setAttribute('aria-label', `Quitar ${line.name}`);
      removeButton.addEventListener('click', () => {
        cart = cartReducer(cart, { type: 'remove', itemId: line.itemId });
        render();
      });
      row.append(removeButton);
      cartSection.append(row);
    }
    const total = page.createElement('p');
    total.textContent = `Total: $${cartTotal(cart).toLocaleString('es-CO')}`;
    cartSection.append(total);
    const clearButton = page.createElement('button');
    clearButton.type = 'button';
    clearButton.textContent = 'Vaciar pedido';
    clearButton.disabled = cart.length === 0;
    clearButton.addEventListener('click', () => {
      cart = cartReducer(cart, { type: 'clear' });
      render();
    });
    cartSection.append(clearButton);
    app.append(cartSection);
  };

  render();
  return app;
}

const menu: readonly MenuItem[] = [
  { id: 1, name: 'Arepa de choclo', category: 'entrada', price: 9000, available: true },
  { id: 2, name: 'Bandeja paisa', category: 'plato-fuerte', price: 28000, available: true },
  { id: 3, name: 'Flan de caramelo', category: 'postre', price: 8000, available: false },
];

const bandeja = menu[1];
if (bandeja) {
  const initialCart = cartReducer([], { type: 'add', item: bandeja });
  const updatedCart = cartReducer(initialCart, { type: 'add', item: bandeja });
  console.log('Pedido de Juan Pérez:', updatedCart, 'Total:', cartTotal(updatedCart));
  console.log(
    'Caso límite (quitar plato que no está en el pedido):',
    cartReducer(initialCart, { type: 'remove', itemId: 99 }).length,
    'plato',
  );
}

if (typeof document !== 'undefined') {
  const mount = (): void => {
    document.body.append(createMenuApp(document, menu));
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
}
