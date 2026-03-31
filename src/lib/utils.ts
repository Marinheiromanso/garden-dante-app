import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Shared constant for profile localStorage key */
export const PROFILE_KEY = 'magicGardenProfile';

/** Format a Date as 'YYYY-MM-DD' string */
export function formatDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Clean old demo data from localStorage (runs once) */
export function cleanOldDemoData(): void {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('magicGarden_cleaned_v2')) {
        localStorage.removeItem('magicGardenTasks');
        localStorage.removeItem('magicGardenHealthHistory');
        localStorage.removeItem('magicGardenExpenses');
        localStorage.removeItem('magicGardenStock');
        localStorage.removeItem('magicGardenTools');
        localStorage.removeItem('magicGardenToolLogs');
        localStorage.removeItem('magicGardenMonthlyRevenue');
        localStorage.setItem('magicGarden_cleaned_v2', '1');
    }
}
