import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const ADMOB_BANNER_ID = "ca-app-pub-1262030761712683/8736767962";

/**
 * Banneri AdMob.
 * - Native (Capacitor): shfaq banerin real në fund të ekranit.
 * - Web: shfaq një placeholder premium.
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
        await AdMob.initialize({ initializeForTesting: false });
        await AdMob.showBanner({
          adId: ADMOB_BANNER_ID,
          adSize: BannerAdSize.ADAPTIVE_BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting: false,
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
      className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-border/60 bg-background/90 backdrop-blur-2xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.5rem)", paddingTop: "0.5rem" }}
    >
      <div className="container mx-auto flex flex-col items-center gap-1.5 px-4">
        <div className="relative flex h-14 w-full max-w-[728px] items-center justify-center overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-card via-card/80 to-card shadow-card">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
          <div className="relative flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="font-semibold tracking-widest uppercase">Anzeige</span>
            <span className="opacity-60">· AdMob</span>
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          Krijuar nga <span className="font-semibold text-foreground/80">DS Interactive</span>
        </p>
      </div>
    </footer>
  );
}
