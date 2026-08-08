import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-brand-yellow-500 text-neutral-950 focus:border-brand-yellow-600'
                    : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 focus:border-neutral-300 focus:text-neutral-700') +
                className
            }
        >
            {children}
        </Link>
    );
}
