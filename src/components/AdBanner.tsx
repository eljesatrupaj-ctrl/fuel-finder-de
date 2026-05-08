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
          isTesting: true,
        });
      } catch (e) {
        console.warn("AdMob nicht verfügbar:", e);
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

  if (isNative) return null;

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-border/70 bg-background/95 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)", paddingTop: "0.5rem" }}
    >
      <div className="container mx-auto flex flex-col items-center gap-1 px-4">
        <div className="flex h-14 w-full max-w-[728px] items-center justify-center rounded-xl border border-dashed border-border/90 bg-card/75 text-xs text-muted-foreground shadow-card">
          <span className="font-medium tracking-wider uppercase">Anzeige · AdMob Test Banner</span>
        </div>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
          Erstellt von <span className="font-semibold text-foreground/80">DS Interactive</span>
        </p>
      </div>
    </footer>
  );
}
