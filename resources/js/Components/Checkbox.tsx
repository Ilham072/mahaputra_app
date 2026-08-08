import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded-sm border-neutral-300 text-brand-yellow-500 shadow-sm focus:ring-brand-yellow-500 ' +
                className
            }
        />
    );
}
