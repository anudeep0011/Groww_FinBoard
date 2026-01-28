import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const substituteVariables = (text: string, variables: Record<string, string>) => {
  if (!text) return text;
  return text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
    return variables[key] || "";
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getNestedValue = (obj: any, path: string) => {
  if (!path) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};
