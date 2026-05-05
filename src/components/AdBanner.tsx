import { useEffect, useState } from "react";

/**
 * Vendi për banerin AdMob.
 * - Në web: shfaq një placeholder modern (AdMob nuk shfaqet në browser).
 * - Në native (Capacitor Android/iOS): inicializon AdMob dhe shfaq banerin real në fund të ekranit.
 *
 * Për të aktivizuar AdMob në build mobile:
 *  1. Eksporto në GitHub
 *  2. npm i && npx cap add android
 *  3. Konfiguro App ID tënd në capacitor.config.ts (tani është test ID i Google)
 *  4. npx cap sync && npx cap run android
 */
export default function AdBanner() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        if (cancelled) return;
        setIsNative(true);

        const { AdMob, BannerAdPosition, BannerAdSize } = await import("@capacitor-community/admob");
        await AdMob.initialize({ initializeForTesting: true });
        await AdMob.showBanner({
          adId: "ca-app-pub-3940256099942544/6300978111", // Google test banner
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
        });
      } catch (e) {
        console.warn("AdMob jo i disponueshëm:", e);
      }
    })();
    return () => {
      cancelled = true;
      (async () => {
        try {
          const { AdMob } = await import("@capacitor-community/admob");
          await AdMob.removeBanner();
        } catch {}
      })();
    };
  }, []);

  if (isNative) return <div className="h-14" aria-hidden />;

  return (
    <div className="w-full border-t border-border bg-card/60 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-center px-4">
        <div className="flex h-full w-full max-w-[728px] items-center justify-center rounded-md border border-dashed border-border bg-muted/40 text-xs text-muted-foreground">
          <span className="font-medium tracking-wider uppercase">Reklamë · AdMob Banner</span>
        </div>
      </div>
    </div>
  );
}
