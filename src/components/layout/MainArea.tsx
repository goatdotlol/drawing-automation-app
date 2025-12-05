import { ReactNode } from 'react';

interface MainAreaProps {
    children: ReactNode;
}

export function MainArea({ children }: MainAreaProps) {
    return (
        <div className="flex-1 h-full overflow-y-auto bg-background p-6 custom-scrollbar">
            <div className="max-w-6xl mx-auto">
                {children}
            </div>
        </div>
    );
}
