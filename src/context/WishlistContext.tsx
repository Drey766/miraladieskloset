"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { brand } from "@/config/brand";
import { getProductById } from "@/lib/products";
import type { Product } from "@/types";

const STORAGE_KEY = `${brand.storagePrefix}:wishlist`;

interface WishlistContextValue {
  /** Saved products (fresh from products.json), newest first. */
  items: Product[];
  count: number;
  hydrated: boolean;
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setIds(parsed.filter((x): x is string => typeof x === "string" && !!getProductById(x)));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, hydrated]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) => setIds((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur])),
    []
  );
  const remove = useCallback((id: string) => setIds((cur) => cur.filter((x) => x !== id)), []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items: ids.flatMap((id) => {
        const p = getProductById(id);
        return p ? [p] : [];
      }),
      count: ids.length,
      hydrated,
      has,
      toggle,
      remove,
    }),
    [ids, hydrated, has, toggle, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside <WishlistProvider>");
  return ctx;
}
