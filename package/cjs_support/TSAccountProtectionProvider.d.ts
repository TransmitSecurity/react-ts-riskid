import React from 'react';
declare global {
    interface Window {
        myTSAccountProtection: any;
    }
}
interface ActionResponse {
    actionToken?: string;
}
export declare function TSAccountProtectionProvider({ children, clientId, options, }: {
    children: React.ReactNode;
    clientId: string;
    options?: {
        [key: string]: any;
    };
}): JSX.Element;
export declare const useTSAccountProtection: () => {
    triggerActionEvent: (actionType: string, options?: {}) => Promise<ActionResponse | null>;
    setAuthenticatedUser: (userId?: string, options?: {}) => Promise<boolean>;
    clearUser: (options?: {}) => Promise<boolean>;
};
export {};
//# sourceMappingURL=TSAccountProtectionProvider.d.ts.map