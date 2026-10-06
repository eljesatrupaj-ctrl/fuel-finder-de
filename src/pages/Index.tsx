import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Fuel, Locate, Loader2, Calculator, AlertTriangle, MapPin, TrendingDown, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import RegionPicker from "@/components/RegionPicker";
import StationCard from "@/components/StationCard";
import FuelLog from "@/components/FuelLog";
import AdBanner from "@/components/AdBanner";
import SettingsMenu from "@/components/SettingsMenu";
import { fetchStations, type Station } from "@/lib/tankerkoenig";

const STORAGE_KEY = "tankfinder.lastLocation";

type FuelType = "all" | "e5" | "e10" | "diesel";

export default function Index() {
  const { toast } = useToast();
  const [loc, setLoc] = useState<{ lat: number; lng: number; label: string } | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [missingKey, setMissingKey] = useState(false);
  const [fuel, setFuel] = useState<FuelType>("all");
  const [radius, setRadius] = useState(10);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [autoLocationRequested, setAutoLocationRequested] = useState(false);
  const selectedFuel = fuel === "all" ? "e5" : fuel;

  const persistLoc = (l: { lat: number; lng: number; label: string } | null) => {
    setLoc(l);
    try {
      if (l) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
      }
    } catch {}
  };

  const useGPS = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS nicht verfügbar", variant: "destructive" });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        persistLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Mein Standort",
        });
      },
      (err) => {
        setLoading(false);
        toast({ title: "GPS fehlgeschlagen", description: err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (loc || autoLocationRequested) return;
    setAutoLocationRequested(true);
    useGPS();
  }, [autoLocationRequested, loc]);

  useEffect(() => {
    if (!loc) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await fetchStations({ lat: loc.lat, lng: loc.lng, rad: radius, type: "all", sort: "dist" });
      if (cancelled) return;
      if (r.missingKey) {
        setMissingKey(true);
        setStations([]);
      } else if (r.stations) {
        setMissingKey(false);
        setStations(r.stations);
      } else if (r.error) {
        toast({ title: "API-Fehler", description: r.error, variant: "destructive" });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loc, radius, toast]);

  const sortedStations = useMemo(() => {
    const priceFor = (s: Station) => {
      const price = s[selectedFuel];
      return typeof price === "number" && price > 0 ? price : Number.POSITIVE_INFINITY;
    };
    return [...stations].sort((a, b) => {
      const aPrice = priceFor(a);
      const bPrice = priceFor(b);
      if (Number.isFinite(aPrice) && !Number.isFinite(bPrice)) return -1;
      if (!Number.isFinite(aPrice) && Number.isFinite(bPrice)) return 1;
      const priceDiff = aPrice - bPrice;
      if (Math.abs(priceDiff) > 0.0005) return priceDiff;
      return a.dist - b.dist;
    });
  }, [stations, selectedFuel]);

  const cheapest = useMemo(() => {
    if (!sortedStations.length) return null;
    const prices = sortedStations
      .map((s) => s[selectedFuel])
      .filter((p): p is number => typeof p === "number" && p > 0);
    if (!prices.length) return null;
    return Math.min(...prices);
  }, [sortedStations, selectedFuel]);

  const mostExpensive = useMemo(() => {
    const prices = sortedStations
      .map((s) => s[selectedFuel])
      .filter((p): p is number => typeof p === "number" && p > 0);
    if (!prices.length) return null;
    return Math.max(...prices);
  }, [sortedStations, selectedFuel]);

  const fuelLabel = fuel === "all" ? "Super E5" : fuel === "e5" ? "Super E5" : fuel === "e10" ? "Super E10" : "Diesel";

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {/* HEADER */}
      <header className="relative z-40 overflow-hidden rounded-b-[1.5rem] gradient-hero text-secondary-foreground shadow-elevated">
        <div className="hero-aurora pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2.5 px-4 pb-10 pt-4 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card/20 backdrop-blur">
              <Fuel className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-primary ring-2 ring-secondary/60" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display truncate text-lg font-extrabold leading-tight">In der Nähe</h1>
              <p className="text-[10px] font-semibold uppercase opacity-75">Live Preise per GPS</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              onClick={() => setCalcOpen(true)}
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl bg-card/20 hover:bg-card/30"
              aria-label="Sprit-Rechner"
            >
              <Calculator className="h-5 w-5" />
            </Button>
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetContent side="right" className="w-full overflow-y-auto pb-[calc(176px+env(safe-area-inset-bottom,0px))] sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Bundesländer</SheetTitle>
                  <SheetDescription>Wähle ein Bundesland und eine Stadt, um Tankstellen in der Nähe zu sehen.</SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  <RegionPicker
                    onPick={(p) => {
                      persistLoc(p);
                      setSheetOpen(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
            <SettingsMenu />
          </div>
        </div>
        <p className="absolute bottom-3 left-4 text-[9px] font-semibold uppercase opacity-70 sm:left-6">Erstellt von DS Interactive</p>
      </header>

      {/* HERO */}
      {!loc && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />
          <div className="hero-aurora absolute inset-0" aria-hidden="true" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(hsl(var(--secondary-foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--secondary-foreground))_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative container mx-auto flex flex-col items-center px-4 py-20 text-center sm:py-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-glow"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Über 16.000 Tankstellen · Echtzeit-Daten
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] gradient-primary shadow-elevated"
            >
              <Fuel className="h-12 w-12 text-primary-foreground" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight text-secondary-foreground sm:text-6xl"
            >
              Den <span className="text-gradient">günstigsten Sprit</span> in deiner Nähe finden
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-lg text-base text-secondary-foreground/70 sm:text-lg"
            >
              Live-Preise für Super E5, E10 und Diesel von Tankerkönig. Per GPS oder manuell nach Bundesland & Stadt suchen.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button onClick={useGPS} size="lg" className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90 rounded-full px-7">
                <Locate className="mr-2 h-5 w-5" />
                Standort verwenden
              </Button>
              <Button onClick={() => setSheetOpen(true)} size="lg" variant="outline" className="rounded-full border-secondary-foreground/30 px-7 text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                Stadt wählen
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* MAIN */}
       <main className="flex-1 pb-[calc(168px+env(safe-area-inset-bottom,0px))]">
          <div className="mx-auto w-full max-w-3xl px-3 pb-6 sm:px-4">
          {loc && (
            <div className="mb-3 space-y-3 pt-3">
              <Tabs value={fuel} onValueChange={(v) => setFuel(v as FuelType)}>
                <TabsList className="grid h-auto w-full grid-cols-4 rounded-xl border border-border/70 bg-card p-1 shadow-card">
                  <TabsTrigger value="all" className="rounded-lg py-2 text-[11px]">Alle</TabsTrigger>
                  <TabsTrigger value="diesel" className="rounded-lg py-2 text-[11px]">Diesel</TabsTrigger>
                  <TabsTrigger value="e5" className="rounded-lg py-2 text-[11px]">Super 95</TabsTrigger>
                  <TabsTrigger value="e10" className="rounded-lg py-2 text-[11px]">E10</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center justify-between gap-3 pt-1">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">{sortedStations.length} Tankstellen in der Nähe</p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-secondary"><MapPin className="h-3 w-3" /> {loc.label} · {radius} km</p>
                </div>
                <Button onClick={useGPS} variant="ghost" size="sm" className="text-secondary hover:bg-secondary/10 hover:text-secondary"><RefreshCw className="mr-1.5 h-4 w-4" />Aktualisieren</Button>
              </div>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {[5, 10, 20, 25].map((r) => <Button key={r} onClick={() => setRadius(r)} variant={radius === r ? "default" : "outline"} size="sm" className="h-7 shrink-0 rounded-full px-3 text-[11px]">{r} km</Button>)}
                <div className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary/10 px-2 py-1.5 text-[9px] font-bold text-secondary"><TrendingDown className="h-3 w-3" /> günstigste zuerst</div>
              </div>
            </div>
          )}

          {missingKey && (
            <div className="mx-auto max-w-2xl rounded-2xl border p-6 text-center" style={{ borderColor: "hsl(var(--warning) / 0.4)", background: "hsl(var(--warning) / 0.05)" }}>
              <AlertTriangle className="mx-auto mb-3 h-10 w-10" style={{ color: "hsl(var(--warning))" }} />
              <h3 className="text-lg font-semibold">Tankerkönig API-Key fehlt</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Kostenlosen Key bei{" "}
                <a className="underline text-primary" href="https://creativecommons.tankerkoenig.de/" target="_blank" rel="noreferrer">
                  creativecommons.tankerkoenig.de
                </a>{" "}
                anfordern und als <code className="rounded bg-muted px-1">TANKERKOENIG_API_KEY</code> hinterlegen.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && !missingKey && sortedStations.length > 0 && (
            <>
              <div className="space-y-2.5">
                {sortedStations.map((s, i) => (
                  <StationCard
                    key={s.id}
                    s={s}
                    index={i}
                    rank={i + 1}
                    highlightFuel={selectedFuel}
                    cheapest={cheapest}
                    mostExpensive={mostExpensive}
                  />
                ))}
              </div>
            </>
          )}

          {!loading && !missingKey && loc && stations.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              Keine Tankstellen in diesem Umkreis gefunden.
            </div>
          )}
        </div>
      </main>

      <AdBanner onGPS={useGPS} onRegions={() => setSheetOpen(true)} loading={loading} />

      {/* Sprit-Rechner Dialog */}
      <Dialog open={calcOpen} onOpenChange={setCalcOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto pb-[calc(24px+env(safe-area-inset-bottom,0px))] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Calculator className="h-5 w-5 text-primary" />
              Sprit-Rechner
            </DialogTitle>
            <DialogDescription>
              Erfasse deine Tankfüllungen — Kosten und Verbrauch werden automatisch berechnet.
            </DialogDescription>
          </DialogHeader>
          <FuelLog />
        </DialogContent>
      </Dialog>
    </div>
  );
}
