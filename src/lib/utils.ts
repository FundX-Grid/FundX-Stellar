import { clsx, type ClassValue } from_ "clsx"
import { twMerge } from_ "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
