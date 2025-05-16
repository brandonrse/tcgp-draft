import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Card } from '../interfaces/Card';

interface CardDataContextType {
  cards: Card[] | null;
  loading: boolean;
}

const CardDataContext = createContext<CardDataContextType | undefined>(undefined);

export const CardDataProvider = ({children}: { children: ReactNode }) => {
  const [cards, setCards] = useState<Card[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../assets/data/cards.json')
      .then((module) => {
        setCards(module.default);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load cards', err);
        setLoading(false);
      });
  }, []);

  return (
    <CardDataContext.Provider value={{ cards, loading }}>
      {children}
    </CardDataContext.Provider>
  );
};

export { CardDataContext }