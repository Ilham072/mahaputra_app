import { SelectHTMLAttributes, forwardRef } from 'react';

export default forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    function SelectInput({ className = '', ...props }, ref) {
        return (
            <select
                {...props}
                ref={ref}
                className={
                    'block h-10 w-full rounded-md border-neutral-300 text-sm shadow-sm focus:border-brand-yellow-500 focus:ring-brand-yellow-500 ' +
                    className
                }
            />
        );
    },
);
