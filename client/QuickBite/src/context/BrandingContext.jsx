import React, { createContext, useContext, useEffect, useState } from 'react';
import API from '../services/api';

const BrandingContext = createContext({
    branding: { appName: 'QuickBite', logoUrl: '' },
    refreshBranding: () => {},
});

export function BrandingProvider({ children }) {
    const [branding, setBranding] = useState({ appName: 'QuickBite', logoUrl: '' });

    const refreshBranding = async () => {
        try {
            const res = await API.get('/settings/branding');
            setBranding(res.data?.branding || { appName: 'QuickBite', logoUrl: '' });
        } catch (error) {
            setBranding({ appName: 'QuickBite', logoUrl: '' });
        }
    };

    useEffect(() => {
        refreshBranding();
    }, []);

    return (
        <BrandingContext.Provider value={{ branding, refreshBranding }}>
            {children}
        </BrandingContext.Provider>
    );
}

export function useBranding() {
    return useContext(BrandingContext);
}
