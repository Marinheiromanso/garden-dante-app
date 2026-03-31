'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
    { name: 'Início', href: '/', icon: 'home' },
    { name: 'Agenda', href: '/pruning', icon: 'calendar_month' },
    { name: 'Galeria', href: '/gallery', icon: 'photo_library' },
    { name: 'Scanner', href: '/scanner', icon: 'qr_code_scanner' },
    { name: 'Clientes', href: '/clients', icon: 'group' },
];

export function BottomNav() {
    const pathname = usePathname();

    if (pathname === '/landing') return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#102210] border-t border-slate-200 dark:border-primary/20 pb-safe z-50">
            <div className="flex max-w-2xl mx-auto h-16 items-center">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors",
                                isActive ? "text-primary" : "text-slate-500 dark:text-primary/60 hover:text-primary"
                            )}
                        >
                            <span
                                className={cn("material-symbols-outlined text-[24px]", isActive && "!fill-[1]")}
                            >
                                {item.icon}
                            </span>
                            <span className={cn("text-[10px] font-medium", isActive && "font-bold")}>
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
