import React from "react";

export const CurrencyFormatter: React.FC<{
  value: number;
  className?: string;
  isStrikethrough?: boolean;
}> = ({ value, className = "", isStrikethrough = false }) => {
  const formatted = new Intl.NumberFormat("fr-FR").format(value);

  return (
    <span
      className={`inline-flex items-center gap-1 ${className} ${
        isStrikethrough ? "line-through opacity-70" : ""
      }`}
    >
      <span className="font-mono font-bold">{formatted}</span>
      <span className="text-[0.7em] font-sans font-normal">€</span>
    </span>
  );
};
