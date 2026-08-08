import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import { ReactNode } from 'react';

type FormFieldProps = {
    label: string;
    htmlFor?: string;
    error?: string;
    children: ReactNode;
    helpText?: string;
    className?: string;
};

export default function FormField({
    label,
    htmlFor,
    error,
    children,
    helpText,
    className = '',
}: FormFieldProps) {
    return (
        <div className={className}>
            <InputLabel htmlFor={htmlFor} value={label} />
            <div className="mt-1">{children}</div>
            {helpText && (
                <p className="mt-2 text-xs text-neutral-500">{helpText}</p>
            )}
            <InputError className="mt-2" message={error} />
        </div>
    );
}
