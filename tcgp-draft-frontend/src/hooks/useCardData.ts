import { useContext } from "react";
import { CardDataContext } from "../context/CardDataContext";

export const useCardData = () => {
  const context = useContext(CardDataContext);
  if (!context) throw new Error('useCardData must be used inside CardDataProvider');
  return context;
}