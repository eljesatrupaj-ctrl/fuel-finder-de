import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Fuel, Locate, Loader2, Search, AlertTriangle, MapPin, TrendingDown, Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import RegionPicker from "@/components/RegionPicker";
import StationCard from "@/components/StationCard";
import AdBanner from "@/components/AdBanner";
import OnboardingDialog from "@/components/OnboardingDialog";
import { fetchStations, type Station } from "@/lib/tankerkoenig";

const STORAGE_KEY = "tankfinder.lastLocation";
const ONBOARDED_KEY = "tankfinder.onboarded";

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
  const [onboardingOpen, setOnboardingOpen] = useState(() => {
    try {
      return !localStorage.getItem(ONBOARDED_KEY) && !localStorage.getItem(STORAGE_KEY);
    } catch {
      return true;
    }
  });
  const selectedFuel = fuel === "all" ? "e5" : fuel;

  const persistLoc = (l: { lat: number; lng: number; label: string } | null) => {
    setLoc(l);
    try {
      if (l) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
        localStorage.setItem(ONBOARDED_KEY, "1");
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
        setLoc({
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
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            {loc && (
              <Button
                onClick={() => setLoc(null)}
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full"
                aria-label="Zurück"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl gradient-primary shadow-glow">
              <Fuel className="h-5 w-5 text-primary-foreground" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-background animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-extrabold leading-tight tracking-tight">TankFinder</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Live-Spritpreise</p>
            </div>
          </div>
        </div>
        {/* Search Bundesland row — slightly lower */}
        <div className="container mx-auto px-4 pb-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="group relative w-full justify-start gap-3 rounded-2xl border-border/80 bg-card/60 px-4 py-6 text-left shadow-card hover:border-primary/50 hover:bg-card"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary text-primary-foreground shadow-glow">
                  <Search className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Suche</div>
                  <div className="font-semibold truncate">Bundesland & Stadt wählen</div>
                </div>
                <Sparkles className="h-4 w-4 text-primary opacity-70 group-hover:opacity-100" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto pb-[calc(110px+env(safe-area-inset-bottom,0px))] sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Bundesländer</SheetTitle>
                <SheetDescription>Wähle ein Bundesland und eine Stadt, um Tankstellen in der Nähe zu sehen.</SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <RegionPicker
                  onPick={(p) => {
                    setLoc(p);
                    setSheetOpen(false);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* HERO */}
      {!loc && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero" />
          <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(hsl(var(--foreground))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--foreground))_1px,transparent_1px)] [background-size:48px_48px]" />
          <div className="relative container mx-auto flex flex-col items-center px-4 py-20 text-center sm:py-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
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
              className="max-w-2xl text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl"
            >
              Den <span className="text-gradient">günstigsten Sprit</span> in deiner Nähe finden
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg"
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
              <Button onClick={() => setSheetOpen(true)} size="lg" variant="outline" className="rounded-full px-7">
                <MapPin className="mr-2 h-5 w-5" />
                Stadt wählen
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* MAIN */}
      <main className="flex-1 pb-[calc(96px+env(safe-area-inset-bottom,0px))]">
        <div className="container mx-auto px-4 py-6">
          {loc && (
            <div className="mb-5 space-y-4">
              <div className="relative overflow-hidden rounded-[1.35rem] border border-border/80 gradient-card p-4 shadow-card">
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Suche um</div>
                    <div className="font-semibold">{loc.label}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={useGPS} size="sm" variant="outline" className="rounded-full">
                    <Locate className="mr-1.5 h-4 w-4" /> GPS
                  </Button>
                  <Button onClick={() => setSheetOpen(true)} size="sm" variant="outline" className="rounded-full">
                    Ändern
                  </Button>
                </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs value={fuel} onValueChange={(v) => setFuel(v as FuelType)}>
                  <TabsList>
                    <TabsTrigger value="all">Alle</TabsTrigger>
                    <TabsTrigger value="e5">E5</TabsTrigger>
                    <TabsTrigger value="e10">E10</TabsTrigger>
                    <TabsTrigger value="diesel">Diesel</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1.5 text-xs font-bold text-secondary">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Günstigste oben
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Umkreis:</span>
                  {[5, 10, 20, 25].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadius(r)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        radius === r
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {r} km
                    </button>
                  ))}
                </div>
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
              {cheapest != null && (
                <div className="mb-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-4 py-1.5 text-xs">
                  <TrendingDown className="h-3.5 w-3.5 text-secondary" />
                  <span className="font-bold text-secondary">
                    Bester Preis ({fuelLabel}): {cheapest.toFixed(3).replace(".", ",")} €
                  </span>
                  <span className="text-muted-foreground">· {sortedStations.length} Tankstellen · günstig → teuer</span>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      <AdBanner />
    </div>
  );
}
