import { ButtonHTMLAttributes } from 'react';
import Button from './Button';

export default function PrimaryButton({
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
            variant="primary"
            className={className}
            disabled={disabled}
        >
            {children}
        </Button>
    );
}
