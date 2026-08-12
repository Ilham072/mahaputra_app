import { ImgHTMLAttributes } from 'react';

export default function ApplicationLogo(
    props: ImgHTMLAttributes<HTMLImageElement>,
) {
    return (
        <img
            {...props}
            src="/brand/logo_mahaputra.png"
            alt="Mahaputra"
        />
    );
}
