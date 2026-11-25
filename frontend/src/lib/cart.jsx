import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';

const KEY = 'lowcal.cart.v1';
const CartContext = createContext(null);

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
};

const lineId = (slug, size) => `${slug}:${size}`;

function reducer(items, action) {
  switch (action.type) {
    case 'add': {
      const { product, size, qty } = action;
      const id = lineId(product.slug, size);
      const existing = items.find((i) => i.id === id);
      if (existing) {
        return items.map((i) => (i.id === id ? { ...i, qty: Math.min(20, i.qty + qty) } : i));
      }
      return [
        ...items,
        {
          id,
          slug: product.slug,
          name: product.name,
          size,
          qty,
          price: product.preorderPrice,
          compareAt: product.price,
          image: product.images.back,
          photo: product.photo,
        },
      ];
    }
    case 'qty':
      return items
        .map((i) => (i.id === action.id ? { ...i, qty: Math.max(0, Math.min(20, action.qty)) } : i))
        .filter((i) => i.qty > 0);
    case 'remove':
      return items.filter((i) => i.id !== action.id);
    case 'clear':
      return [];
    default:
      return items;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: cart still works for this visit */
    }
  }, [items]);

  const add = useCallback((product, size, qty = 1) => {
    dispatch({ type: 'add', product, size, qty });
    setOpen(true);
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    const savings = items.reduce((n, i) => n + i.qty * (i.compareAt - i.price), 0);
    return {
      items,
      count,
      subtotal,
      savings,
      open,
      setOpen,
      add,
      setQty: (id, qty) => dispatch({ type: 'qty', id, qty }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [items, open, add]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
