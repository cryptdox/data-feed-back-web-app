
import { useEffect } from 'react';

function AdUnit({ slotId }: { slotId: string }) {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
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

export default AdUnit;