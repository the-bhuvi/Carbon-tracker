import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Display CO₂ values in tonnes when ≥ 1,000 kg, otherwise in kg. */
export function formatCO2(kg: number): { value: string; unit: string } {
  if (Math.abs(kg) >= 1000) {
    return {
      value: (kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      unit: 'tonnes CO₂',
    };
  }
  return {
    value: kg.toLocaleString(undefined, { maximumFractionDigits: 2 }),
    unit: 'kg CO₂',
  };
}
