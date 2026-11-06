"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { brand } from "@/config/brand";
import { getProductById } from "@/lib/products";
import type { CartItem, Product } from "@/types";

const STORAGE_KEY = `${brand.storagePrefix}:cart`;
const MAX_QTY = 10;

type Action =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "ADD"; product: Product; size: string; quantity: number }
  | { type: "REMOVE"; productId: string; size: string }
  | { type: "SET_QTY"; productId: string; size: string; quantity: number }
  | { type: "CLEAR" };

const sameLine = (i: CartItem, productId: string, size: string) =>
  i.product.id === productId && i.selected_size === size;

function reducer(items: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case "HYDRATE":
      return action.items;
    case "ADD": {
      const existing = items.find((i) => sameLine(i, action.product.id, action.size));
      if (existing) {
        return items.map((i) =>
          i === existing
            ? { ...i, quantity: Math.min(MAX_QTY, i.quantity + action.quantity) }
            : i
        );
      }
      return [
        ...items,
        {
          product: action.product,
          selected_size: action.size,
          quantity: Math.min(MAX_QTY, action.quantity),
        },
      ];
    }
    case "REMOVE":
      return items.filter((i) => !sameLine(i, action.productId, action.size));
    case "SET_QTY":
      if (action.quantity <= 0) {
        return items.filter((i) => !sameLine(i, action.productId, action.size));
      }
      return items.map((i) =>
        sameLine(i, action.productId, action.size)
          ? { ...i, quantity: Math.min(MAX_QTY, action.quantity) }
          : i
      );
    case "CLEAR":
      return [];
    default:
      return items;
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** False until localStorage has been read — use it to avoid flashing an "empty cart". */
  hydrated: boolean;
  isOpen: boolean;
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Read the saved cart, re-attach fresh product data (prices may have changed) and drop stale lines. */
function loadCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const items: CartItem[] = [];
    for (const entry of parsed) {
      const productId = entry?.product?.id;
      const size = entry?.selected_size;
      const qty = Number(entry?.quantity);
      if (typeof productId !== "string" || typeof size !== "string" || !qty) continue;
      const fresh = getProductById(productId);
      if (!fresh || !fresh.sizes.includes(size)) continue;
      items.push({
        product: fresh,
        selected_size: size,
        quantity: Math.max(1, Math.min(MAX_QTY, Math.round(qty))),
      });
    }
    return items;
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, []);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "HYDRATE", items: loadCart() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* private mode / storage full — the cart still works for this session */
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: Product, size: string, quantity = 1) => {
    dispatch({ type: "ADD", product, size, quantity });
    setIsOpen(true);
  }, []);
  const removeItem = useCallback(
    (productId: string, size: string) => dispatch({ type: "REMOVE", productId, size }),
    []
  );
  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) =>
      dispatch({ type: "SET_QTY", productId, size, quantity }),
    []
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      hydrated,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
    }),
    [items, hydrated, isOpen, addItem, removeItem, updateQuantity, clearCart, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
