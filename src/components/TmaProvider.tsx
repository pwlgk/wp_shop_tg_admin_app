// src/components/TmaProvider.tsx
'use client';

import { SDKProvider } from '@tma.js/sdk-react';
import { AppLogic } from './AppLogic';

export function TmaProvider({ children }: { children: React.ReactNode }) {
    return (
        <SDKProvider acceptCustomStyles debug={process.env.NODE_ENV === 'development'}>
            <AppLogic>{children}</AppLogic>
        </SDKProvider>
    );
}