import ApplicationLogo from '@/Components/ApplicationLogo';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-[#111111] px-4 pt-6 sm:justify-center sm:pt-0">
            <div className="flex flex-col items-center gap-3">
                <ApplicationLogo className="h-16 w-16 fill-current text-[#EAB308]" />
                <div className="text-center">
                    <p className="text-lg font-semibold text-white">
                        Mahaputra Apps
                    </p>
                    <p className="text-sm text-neutral-300">
                        Dashboard internal showroom
                    </p>
                </div>
            </div>

            <div className="mt-6 w-full overflow-hidden rounded-lg bg-white px-6 py-5 shadow-lg sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
