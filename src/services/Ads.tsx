
import { useEffect } from 'react';

export function AdUnitAuto({ slotId }: { slotId: string }) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) { }
    }, []);

    return (
        <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-5063460727482979"
            data-ad-slot={slotId}
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
    );
}

export function AdUnitRelaxed({ slotId }: { slotId: string }) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) { }
    }, []);

    return (
        <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-5063460727482979"
            data-ad-slot={slotId}
            data-ad-format="autorelaxed"
            data-full-width-responsive="true"></ins>
    );
}
