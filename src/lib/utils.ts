import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function indianFormat(num: number | string) {
    const n = Number(num);
    return n.toLocaleString('en-IN', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    });
}
