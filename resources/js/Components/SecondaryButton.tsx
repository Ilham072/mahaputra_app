import { ButtonHTMLAttributes } from 'react';
import Button from './Button';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <Button
            {...props}
            type={type}
            variant="outline"
            className={className}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
