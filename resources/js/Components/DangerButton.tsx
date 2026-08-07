import { ButtonHTMLAttributes } from 'react';
import Button from './Button';

export default function DangerButton({
    type = 'submit',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            type={type}
            variant="danger"
            className={className}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
