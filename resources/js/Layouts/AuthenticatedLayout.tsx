import Dropdown from '@/Components/Dropdown';
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

type NavItem = {
    label: string;
    href: string;
    adminOnly?: boolean;
    disabled?: boolean;
    shortLabel?: string;
};

type NavSection = {
    label?: string;
    items: NavItem[];
};

const navigation: NavSection[] = [
    {
        items: [
            { label: 'Dashboard', href: '/dashboard', shortLabel: 'Dasbor' },
        ],
    },
    {
        label: 'Kendaraan',
        items: [
            {
                label: 'Data Kendaraan',
                href: '/vehicles',
                shortLabel: 'Kendaraan',
            },
            {
                label: 'Tambah Kendaraan',
                href: '/vehicles/create',
                adminOnly: true,
            },
        ],
    },
    {
        label: 'Penjualan',
        items: [
            { label: 'Rekap Penjualan', href: '/sales', shortLabel: 'Jual' },
            { label: 'Customer', href: '/customers' },
        ],
    },
    {
        items: [
            {
                label: 'Operasional',
                href: '/operations',
                shortLabel: 'Operasi',
            },
            { label: 'Laporan', href: '/reports', shortLabel: 'Laporan' },
        ],
    },
    {
        label: 'Master Data',
        items: [
            {
                label: 'Karyawan',
                href: '/master/employees',
                adminOnly: true,
            },
            {
                label: 'Area',
                href: '/master/areas',
                adminOnly: true,
            },
            {
                label: 'Merk Kendaraan',
                href: '/master/vehicle-brands',
                adminOnly: true,
            },
            {
                label: 'Pembiayaan',
                href: '/master/financing-providers',
                adminOnly: true,
            },
            {
                label: 'Kategori Operasional',
                href: '/master/expense-categories',
                adminOnly: true,
            },
        ],
    },
];

function roleLabel(role: PageProps['auth']['user']['role']) {
    return role === 'owner' ? 'Owner Showroom' : 'Admin Showroom';
}

function visibleNavigation(isAdmin: boolean) {
    return navigation
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => !item.adminOnly || isAdmin),
        }))
        .filter((section) => section.items.length > 0);
}

function routeMatches(currentUrl: string, href: string) {
    return currentUrl === href || currentUrl.startsWith(`${href}/`);
}

function activeHrefFor(items: NavItem[], currentUrl: string) {
    return items
        .filter((item) => routeMatches(currentUrl, item.href))
        .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

function Brand() {
    return (
        <Link
            href="/"
            className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-yellow-400"
        >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-yellow-500 text-base font-bold text-brand-black">
                M
            </span>
            <span className="min-w-0">
                <span className="block text-base font-semibold leading-5 text-white">
                    Mahaputra
                </span>
                <span className="block text-xs leading-4 text-neutral-300">
                    Group
                </span>
            </span>
        </Link>
    );
}

function NavItems({
    isAdmin,
    currentUrl,
    onNavigate,
}: {
    isAdmin: boolean;
    currentUrl: string;
    onNavigate?: () => void;
}) {
    const sections = visibleNavigation(isAdmin);
    const activeHref = activeHrefFor(
        sections.flatMap((section) => section.items),
        currentUrl,
    );

    return (
        <nav className="space-y-6" aria-label="Navigasi utama">
            {sections.map((section, sectionIndex) => {
                return (
                    <div key={section.label ?? sectionIndex}>
                        {section.label && (
                            <div className="mb-2 px-3 text-xs font-semibold uppercase text-neutral-500">
                                {section.label}
                            </div>
                        )}

                        <div className="space-y-1">
                            {section.items.map((item) => {
                                const active = item.href === activeHref;
                                const classes = [
                                    'flex w-full items-center rounded-md px-3 py-2.5 text-sm font-medium transition duration-150 focus:outline-none focus:ring-2 focus:ring-brand-yellow-400',
                                    active
                                        ? 'bg-brand-yellow-500 text-brand-black'
                                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white',
                                    item.disabled
                                        ? 'cursor-not-allowed opacity-45 hover:bg-transparent hover:text-neutral-300'
                                        : '',
                                ].join(' ');

                                if (item.disabled) {
                                    return (
                                        <button
                                            key={item.href}
                                            type="button"
                                            className={classes}
                                            aria-disabled="true"
                                            disabled
                                        >
                                            {item.label}
                                        </button>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={classes}
                                        onClick={onNavigate}
                                        aria-current={
                                            active ? 'page' : undefined
                                        }
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </nav>
    );
}

function BottomNavigation({
    isAdmin,
    currentUrl,
}: {
    isAdmin: boolean;
    currentUrl: string;
}) {
    const items = visibleNavigation(isAdmin)
        .flatMap((section) => section.items)
        .filter((item) =>
            [
                '/dashboard',
                '/vehicles',
                '/sales',
                '/operations',
                '/reports',
            ].includes(item.href),
        );
    const activeHref = activeHrefFor(items, currentUrl);

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-surface px-2 pb-2 pt-1 shadow-floating lg:hidden"
            aria-label="Navigasi mobile utama"
            style={{
                paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
            }}
        >
            <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
                {items.map((item) => {
                    const active = item.href === activeHref;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={[
                                'flex min-h-14 flex-col items-center justify-center rounded-md px-1 py-1 text-center text-[11px] font-semibold leading-4 transition duration-150 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500',
                                active
                                    ? 'bg-brand-yellow-400/25 text-brand-black'
                                    : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
                            ].join(' ')}
                            aria-current={active ? 'page' : undefined}
                        >
                            <span
                                className={[
                                    'mb-1 h-1.5 w-1.5 rounded-full',
                                    active
                                        ? 'bg-brand-yellow-500'
                                        : 'bg-transparent',
                                ].join(' ')}
                                aria-hidden="true"
                            />
                            <span className="truncate">
                                {item.shortLabel ?? item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

function UserSummary({
    name,
    role,
}: {
    name: string;
    role: PageProps['auth']['user']['role'];
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-yellow-500 text-sm font-bold text-brand-black">
                {name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-white">
                    {name}
                </span>
                <span className="block truncate text-xs text-neutral-300">
                    {roleLabel(role)}
                </span>
            </span>
        </div>
    );
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { props, url } = usePage<PageProps>();
    const user = props.auth.user;
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const isAdmin = user.role === 'admin';

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setMobileSidebarOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="min-h-screen overflow-x-hidden bg-canvas text-neutral-900">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-brand-black px-4 py-5 lg:flex">
                <Brand />

                <div className="mt-8 flex-1 overflow-y-auto">
                    <NavItems isAdmin={isAdmin} currentUrl={url} />
                </div>

                <div className="border-t border-white/10 pt-4">
                    <UserSummary name={user.name} role={user.role} />
                </div>
            </aside>

            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <button
                        type="button"
                        className="absolute inset-0 h-full w-full bg-brand-black/60"
                        aria-label="Tutup navigasi"
                        onClick={() => setMobileSidebarOpen(false)}
                    />

                    <aside
                        className="relative flex h-full w-80 max-w-[86vw] flex-col bg-brand-black px-4 py-5 shadow-floating"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigasi"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <Brand />
                            <button
                                type="button"
                                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-neutral-300 hover:bg-neutral-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-yellow-400"
                                aria-label="Tutup navigasi"
                                onClick={() => setMobileSidebarOpen(false)}
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    aria-hidden="true"
                                >
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-8 flex-1 overflow-y-auto">
                            <NavItems
                                isAdmin={isAdmin}
                                currentUrl={url}
                                onNavigate={() => setMobileSidebarOpen(false)}
                            />
                        </div>

                        <div className="border-t border-white/10 pt-4">
                            <UserSummary name={user.name} role={user.role} />
                        </div>
                    </aside>
                </div>
            )}

            <div className="min-w-0 lg:pl-64">
                <header className="sticky top-0 z-20 border-b border-neutral-200 bg-surface">
                    <div className="flex h-16 min-w-0 items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
                        <button
                            type="button"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-md text-neutral-700 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500 lg:hidden"
                            aria-label="Buka navigasi"
                            onClick={() => setMobileSidebarOpen(true)}
                        >
                            <svg
                                viewBox="0 0 24 24"
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                aria-hidden="true"
                            >
                                <path d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        <div className="min-w-0 flex-1">{header}</div>

                        <Dropdown>
                            <Dropdown.Trigger>
                                <button
                                    type="button"
                                    className="flex min-w-0 items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-yellow-500"
                                >
                                    <span className="hidden min-w-0 sm:block">
                                        <span className="block truncate text-sm font-semibold text-neutral-900">
                                            {user.name}
                                        </span>
                                        <span className="block truncate text-xs text-neutral-500">
                                            {roleLabel(user.role)}
                                        </span>
                                    </span>
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-black text-sm font-semibold text-white">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </button>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <div className="border-b border-neutral-100 px-4 py-3 sm:hidden">
                                    <div className="truncate text-sm font-semibold text-neutral-900">
                                        {user.name}
                                    </div>
                                    <div className="truncate text-xs text-neutral-500">
                                        {roleLabel(user.role)}
                                    </div>
                                </div>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profil
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Keluar
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </header>

                <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-[1600px] px-4 pb-32 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-8">
                    {children}
                </main>
            </div>

            <BottomNavigation isAdmin={isAdmin} currentUrl={url} />
        </div>
    );
}
