import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Locate, MapPin, Sparkles, Fuel, Loader2, Navigation, ChevronLeft } from "lucide-react";
import RegionPicker from "@/components/RegionPicker";
import { fetchStations, openInMaps, type Station } from "@/lib/tankerkoenig";

type Loc = { lat: number; lng: number; label: string };
type Mode = "intro" | "gps" | "region";

export default function OnboardingDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (l: Loc) => void;
}) {
  const [mode, setMode] = useState<Mode>("intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<Loc | null>(null);
  const [stations, setStations] = useState<Station[]>([]);

  const reset = () => {
    setMode("intro");
    setLoading(false);
    setError(null);
    setCoords(null);
    setStations([]);
  };

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError("GPS nicht verfügbar");
      return;
    }
    setMode("gps");
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const l: Loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: "Mein Standort" };
        setCoords(l);
        const r = await fetchStations({ lat: l.lat, lng: l.lng, rad: 10, type: "all", sort: "dist" });
        setStations(r.stations?.slice(0, 5) ?? []);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        setError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const fmt = (v: number | null) =>
    v == null || v <= 0 ? "—" : v.toFixed(3).replace(".", ",") + " €";

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-lg">
        {/* Decorative gradient header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="relative px-6 pt-7 pb-5 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-[1.4rem] gradient-primary shadow-glow"
            >
              <Fuel className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-center text-2xl font-extrabold tracking-tight">
                Willkommen bei <span className="text-gradient">TankFinder</span>
              </DialogTitle>
              <DialogDescription className="text-center text-sm">
                Finde die günstigsten Tankstellen — per GPS oder nach Stadt.
                Deine Auswahl wird gespeichert.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto px-6 pb-6 pt-2">
          <AnimatePresence mode="wait">
            {mode === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid gap-3"
              >
                <button
                  onClick={handleGPS}
                  className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-4 text-left shadow-card transition hover:border-primary/60 hover:shadow-glow"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
                      <Locate className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">Standort verwenden</div>
                      <div className="text-xs text-muted-foreground">Tankstellen in deiner Nähe (GPS)</div>
                    </div>
                    <Sparkles className="h-4 w-4 text-primary opacity-70 transition group-hover:opacity-100" />
                  </div>
                </button>

                <button
                  onClick={() => setMode("region")}
                  className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/60 p-4 text-left shadow-card transition hover:border-secondary/60 hover:bg-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/20 text-secondary">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold">Bundesland & Stadt</div>
                      <div className="text-xs text-muted-foreground">Manuell aus 16 Bundesländern wählen</div>
                    </div>
                  </div>
                </button>

                {error && (
                  <p className="text-center text-xs text-destructive">{error}</p>
                )}
              </motion.div>
            )}

            {mode === "region" && (
              <motion.div
                key="region"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button
                  onClick={() => setMode("intro")}
                  className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Zurück
                </button>
                <RegionPicker onPick={(p) => { onConfirm(p); reset(); }} />
              </motion.div>
            )}

            {mode === "gps" && (
              <motion.div
                key="gps"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <button
                  onClick={() => setMode("intro")}
                  className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Zurück
                </button>

                {loading && (
                  <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
                    <Loader2 className="h-7 w-7 animate-spin text-primary" />
                    Suche Tankstellen in deiner Nähe…
                  </div>
                )}

                {!loading && error && (
                  <p className="text-center text-sm text-destructive">{error}</p>
                )}

                {!loading && !error && stations.length > 0 && (
                  <>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">
                      Nächste Tankstellen
                    </div>
                    <div className="space-y-2">
                      {stations.map((s, i) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/60 p-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-xs font-extrabold text-primary">
                            #{i + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold">{s.brand || s.name}</div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {s.dist.toFixed(1)} km · E5 {fmt(s.e5)}
                            </div>
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openInMaps(s)}>
                            <Navigation className="h-4 w-4 text-primary" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => coords && (onConfirm(coords), reset())}
                      className="w-full gradient-primary text-primary-foreground shadow-glow rounded-xl"
                    >
                      Alle Tankstellen anzeigen
                    </Button>
                  </>
                )}

                {!loading && !error && stations.length === 0 && coords && (
                  <Button
                    onClick={() => { onConfirm(coords); reset(); }}
                    className="w-full gradient-primary text-primary-foreground shadow-glow rounded-xl"
                  >
                    Weiter
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
