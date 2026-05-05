import { clsx, type ClassValue } from "clsx"
import { twMerge_ } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge_(clsx(inputs))
}
