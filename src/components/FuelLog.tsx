import { useMemo, useState } from "react";
import { Fuel, Trash2, Calculator, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY = "tankfinder.fuelLog";

export type FuelEntry = {
  id: string;
  date: string;
  km: number;
  liters: number;
  fuelType?: string;
  pricePerLiter?: number;
};

function loadEntries(): FuelEntry[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const num = (s: string) => parseFloat(s.replace(",", "."));
const fmt = (n: number, d = 2) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtKm = (n: number) => n.toLocaleString("de-DE");
const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("de-DE");
};

export default function FuelLog() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<FuelEntry[]>(loadEntries);
  const [km, setKm] = useState("");
  const [liters, setLiters] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearAll, setClearAll] = useState(false);

  const persist = (next: FuelEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const chrono = useMemo(
    () => [...entries].sort((a, b) => a.km - b.km),
    [entries]
  );
  const last = chrono[chrono.length - 1];

  const save = () => {
    const kmN = num(km);
    const lN = num(liters);
    if (!Number.isFinite(kmN) || kmN < 0 || kmN > 2000000) {
      toast({ title: "Ungültiger Kilometerstand", variant: "destructive" });
      return;
    }
    if (last && kmN <= last.km) {
      toast({
        title: "Kilometerstand zu niedrig",
        description: `Muss größer als ${fmtKm(last.km)} km sein.`,
        variant: "destructive",
      });
      return;
    }
    if (last && (!Number.isFinite(lN) || lN <= 0 || lN > 500)) {
      toast({ title: "Ungültige Litermenge", variant: "destructive" });
      return;
    }
    const entry: FuelEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString().slice(0, 10),
      km: kmN,
      liters: Number.isFinite(lN) && lN > 0 ? lN : 0,
    };
    persist([...entries, entry]);
    if (last) {
      const dist = kmN - last.km;
      toast({
        title: `Verbrauch: ${fmt((entry.liters / dist) * 100)} L/100 km`,
        description: `Strecke: ${fmtKm(dist)} km`,
      });
    } else {
      toast({ title: "Kilometerstand gespeichert", description: "Beim nächsten Tanken wird der Verbrauch berechnet." });
    }
    setKm("");
    setLiters("");
  };

  // Ergebnisse: jede Füllung ab der zweiten, neueste zuerst
  const results = chrono
    .map((e, i) => (i === 0 ? null : { e, prev: chrono[i - 1] }))
    .filter(Boolean)
    .reverse() as { e: FuelEntry; prev: FuelEntry }[];

  return (
    <div className="space-y-4">
      {/* Letzter Km-Stand */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Letzte Tankfüllung
        </div>
        <div className="mt-1 font-display text-3xl font-extrabold text-foreground">
          {last ? fmtKm(last.km) : "—"}{" "}
          <span className="text-base font-medium text-muted-foreground">km</span>
        </div>
        {last && <div className="text-xs text-muted-foreground">am {fmtDate(last.date)}</div>}
      </div>

      {/* Neue Tankfüllung */}
      <div className="space-y-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-card">
        <div className="text-[11px] font-bold uppercase tracking-widest text-secondary">
          Neue Tankfüllung
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fl-km">Km-Stand jetzt</Label>
          <Input id="fl-km" inputMode="decimal" placeholder="z. B. 45720" value={km}
            onChange={(e) => setKm(e.target.value)} className="h-12 rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fl-liters">Getankte Liter (L)</Label>
          <Input id="fl-liters" inputMode="decimal" placeholder="z. B. 42" value={liters}
            onChange={(e) => setLiters(e.target.value)} className="h-12 rounded-xl" />
        </div>
        <Button onClick={save} size="lg"
          className="w-full rounded-xl gradient-gold font-bold text-primary-foreground shadow-glow">
          <Calculator className="mr-2 h-4 w-4" />
          {last ? "Berechnen" : "Kilometerstand speichern"}
        </Button>
        {!last && (
          <p className="text-center text-xs text-muted-foreground">
            Erste Eingabe: Kilometerstand beim Volltanken speichern.
          </p>
        )}
      </div>

      {/* Verlauf */}
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold">Verlauf ({results.length})</h3>
        {entries.length > 0 && (
          <button onClick={() => setClearAll(true)} className="text-sm font-bold text-destructive">
            Alle löschen
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <Fuel className="mx-auto mb-2 h-8 w-8 opacity-40" />
          Noch keine Ergebnisse.
        </div>
      ) : (
        <div className="space-y-3">
          {results.map(({ e, prev }) => {
            const dist = e.km - prev.km;
            const cons = dist > 0 ? (e.liters / dist) * 100 : 0;
            return (
              <div key={e.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">{fmtDate(e.date)}</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {fmtKm(prev.km)} km <span className="text-primary">→</span> {fmtKm(e.km)} km · {fmt(e.liters, 1)} L
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteId(e.id)}
                    aria-label="Eintrag löschen"
                    className="h-9 w-9 shrink-0 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-muted/50 p-2.5 text-center">
                    <div className="text-xs text-muted-foreground">Strecke</div>
                    <div className="font-display text-xl font-extrabold">
                      {fmtKm(dist)} <span className="text-xs font-medium text-muted-foreground">km</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-secondary/10 p-2.5 text-center">
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Gauge className="h-3 w-3" /> Verbrauch
                    </div>
                    <div className="font-display text-xl font-extrabold text-secondary">
                      {fmt(cons)} <span className="text-xs font-bold">L/100 km</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>Dieses Ergebnis wird endgültig entfernt.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { persist(entries.filter((x) => x.id !== deleteId)); setDeleteId(null); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={clearAll} onOpenChange={setClearAll}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alles löschen?</AlertDialogTitle>
            <AlertDialogDescription>Alle Kilometerstände und Ergebnisse werden entfernt.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={() => { persist([]); setClearAll(false); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Alle löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
