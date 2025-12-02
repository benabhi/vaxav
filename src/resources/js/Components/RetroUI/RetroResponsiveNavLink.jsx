import { Link } from '@inertiajs/react';

export default function RetroResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'block w-full ps-3 pe-4 py-2 border-l-4 text-start text-base font-medium transition duration-150 ease-in-out font-mono uppercase tracking-wider ' +
                (active
                    ? 'border-[#00ffaa] text-[#00ffaa] bg-[#005533]/20 focus:outline-none focus:text-[#00ffaa] focus:bg-[#005533]/30 focus:border-[#00ffaa]'
                    : 'border-transparent text-[#005533] hover:text-[#00ffaa] hover:bg-[#005533]/10 hover:border-[#005533] focus:text-[#00ffaa] focus:bg-[#005533]/10 focus:border-[#005533]') +
                className
            }
        >
            {children}
        </Link>
    );
}
