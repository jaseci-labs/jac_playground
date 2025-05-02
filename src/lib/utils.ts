import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function readFileAsString(fileName: string): Promise<string> {
  const response = await fetch(fileName);
  return await response.text();
};


export async function readFileAsBytes(fileName: string): Promise<ArrayBuffer> {
    const response = await fetch("/jaclang.zip");
    const buffer = await response.arrayBuffer();
    return new Uint8Array(buffer);
}
