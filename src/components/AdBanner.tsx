import { useEffect, useState } from "react";
import { LocateFixed, MapPinned, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const ADMOB_BANNER_ID = "ca-app-pub-1262030761712683/8736767962";

/**
 * Banneri AdMob.
 * - Native (Capacitor): shfaq banerin real në fund të ekranit.
 * - Web: shfaq një placeholder premium.
 */
type Props = {
  onGPS: () => void;
  onRegions: () => void;
  loading?: boolean;
};

export default function AdBanner({ onGPS, onRegions, loading = false }: Props) {
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

  return (
    <footer
      className="fixed inset-x-0 bottom-0 z-50 w-full border-t border-border/70 bg-background/95 shadow-elevated backdrop-blur-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto w-full max-w-3xl px-3 pt-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            onClick={onGPS}
            disabled={loading}
            className="h-12 rounded-xl gradient-primary font-bold text-primary-foreground shadow-glow"
          >
            <LocateFixed className={loading ? "animate-pulse" : ""} />
            {loading ? "Suche…" : "GPS nutzen"}
          </Button>
          <Button
            onClick={onRegions}
            variant="outline"
            className="h-12 rounded-xl border-primary/35 bg-card font-bold text-foreground shadow-card"
          >
            <MapPinned />
            Bundesland & Stadt
          </Button>
        </div>

        {isNative ? (
          <div className="h-[58px]" aria-hidden="true" />
        ) : (
          <div className="mt-2 flex h-[50px] items-center justify-center overflow-hidden rounded-lg border border-border/70 bg-card">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold uppercase tracking-[0.18em]">Anzeige</span>
              <span className="opacity-60">· AdMob</span>
            </div>
          </div>
        )}
        <p className="py-1 text-center text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70">
          Krijuar nga <span className="font-semibold text-foreground/80">DS Interactive</span>
        </p>
      </div>
    </footer>
  );
}
