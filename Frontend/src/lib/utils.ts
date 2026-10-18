import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMeetingId(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 9)}`;
}

export function generateMeetingId(): string {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const part = (len: number) =>
    Array.from({ length: len }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  return `${part(3)}-${part(3)}-${part(3)}`;
}
