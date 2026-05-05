import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Fuel, Locate, Loader2, Search, AlertTriangle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import RegionPicker from "@/components/RegionPicker";
import StationCard from "@/components/StationCard";
import AdBanner from "@/components/AdBanner";
import { fetchStations, type Station } from "@/lib/tankerkoenig";

type FuelType = "all" | "e5" | "e10" | "diesel";
type SortType = "dist" | "price";

export default function Index() {
  const { toast } = useToast();
  const [loc, setLoc] = useState<{ lat: number; lng: number; label: string } | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const [missingKey, setMissingKey] = useState(false);
  const [fuel, setFuel] = useState<FuelType>("all");
  const [sort, setSort] = useState<SortType>("dist");
  const [radius, setRadius] = useState(10);
  const [sheetOpen, setSheetOpen] = useState(false);

  const useGPS = () => {
    if (!navigator.geolocation) {
      toast({ title: "GPS jo i disponueshëm", variant: "destructive" });
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Lokacioni juaj",
        });
      },
      (err) => {
        setLoading(false);
        toast({ title: "GPS dështoi", description: err.message, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!loc) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const r = await fetchStations({ lat: loc.lat, lng: loc.lng, rad: radius, type: fuel, sort });
      if (cancelled) return;
      if (r.missingKey) {
        setMissingKey(true);
        setStations([]);
      } else if (r.stations) {
        setMissingKey(false);
        setStations(r.stations);
      } else if (r.error) {
        toast({ title: "Gabim API", description: r.error, variant: "destructive" });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [loc, fuel, sort, radius, toast]);

  const cheapest = useMemo(() => {
    if (!stations.length) return null;
    const prices = stations
      .map((s) => (fuel === "all" ? s.e5 : s[fuel as "e5" | "e10" | "diesel"]))
      .filter((p): p is number => typeof p === "number");
    if (!prices.length) return null;
    return Math.min(...prices);
  }, [stations, fuel]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Fuel className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight">TankFinder DE</h1>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Çmimet live · Gjermani</p>
            </div>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                Republikat
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Bundesländer</SheetTitle>
                <SheetDescription>Zgjidh republikën dhe qytetin për të parë pompat e afërta</SheetDescription>
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
          <div className="relative container mx-auto flex flex-col items-center px-4 py-16 text-center sm:py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl gradient-primary shadow-elevated"
            >
              <Fuel className="h-10 w-10 text-primary-foreground" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl"
            >
              Gjej <span className="text-gradient">çmimin më të lirë</span> të naftës rreth teje
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 max-w-lg text-base text-muted-foreground"
            >
              Çmime live nga Tankerkönig për mbi 16,000 pompa në Gjermani. Përdor GPS-in ose zgjidh manualisht qytetin.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Button onClick={useGPS} size="lg" className="gradient-primary text-primary-foreground shadow-glow hover:opacity-90">
                <Locate className="mr-2 h-5 w-5" />
                Përdor GPS-in tim
              </Button>
              <Button onClick={() => setSheetOpen(true)} size="lg" variant="outline">
                <MapPin className="mr-2 h-5 w-5" />
                Zgjidh qytetin
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      {/* MAIN */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6">
          {loc && (
            <div className="mb-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border gradient-card p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Po kërkohet rreth</div>
                    <div className="font-semibold">{loc.label}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={useGPS} size="sm" variant="outline">
                    <Locate className="mr-1.5 h-4 w-4" /> GPS
                  </Button>
                  <Button onClick={() => setSheetOpen(true)} size="sm" variant="outline">
                    Ndrysho
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Tabs value={fuel} onValueChange={(v) => setFuel(v as FuelType)}>
                  <TabsList>
                    <TabsTrigger value="all">Të gjitha</TabsTrigger>
                    <TabsTrigger value="e5">E5</TabsTrigger>
                    <TabsTrigger value="e10">E10</TabsTrigger>
                    <TabsTrigger value="diesel">Diesel</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Tabs value={sort} onValueChange={(v) => setSort(v as SortType)}>
                  <TabsList>
                    <TabsTrigger value="dist">Më afër</TabsTrigger>
                    <TabsTrigger value="price">Më lirë</TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Rreze:</span>
                  {[5, 10, 20, 25].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRadius(r)}
                      className={`rounded-md border px-2 py-1 text-xs transition ${
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
            <div className="mx-auto max-w-2xl rounded-2xl border border-warning/40 bg-warning/5 p-6 text-center" style={{ borderColor: "hsl(var(--warning) / 0.4)", background: "hsl(var(--warning) / 0.05)" }}>
              <AlertTriangle className="mx-auto mb-3 h-10 w-10" style={{ color: "hsl(var(--warning))" }} />
              <h3 className="text-lg font-semibold">API Key i Tankerkönig mungon</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Kërko një key falas në{" "}
                <a className="underline text-primary" href="https://creativecommons.tankerkoenig.de/" target="_blank" rel="noreferrer">
                  creativecommons.tankerkoenig.de
                </a>{" "}
                dhe dërgoma për ta shtuar në Cloud secrets si <code className="rounded bg-muted px-1">TANKERKOENIG_API_KEY</code>.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && !missingKey && stations.length > 0 && (
            <>
              {cheapest != null && (
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1 text-xs">
                  <span className="font-semibold" style={{ color: "hsl(var(--secondary))" }}>
                    Çmimi më i ulët: {cheapest.toFixed(3)} €
                  </span>
                  <span className="text-muted-foreground">· {stations.length} pompa</span>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stations.map((s, i) => (
                  <StationCard key={s.id} s={s} index={i} />
                ))}
              </div>
            </>
          )}

          {!loading && !missingKey && loc && stations.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              S'u gjet asnjë pompë në këtë rreze.
            </div>
          )}
        </div>
      </main>

      <AdBanner />
    </div>
  );
}
