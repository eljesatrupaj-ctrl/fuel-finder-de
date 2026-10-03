import { useMemo, useState } from "react";
import {
  Fuel,
  Plus,
  Trash2,
  Gauge,
  Euro,
  Droplets,
  Route,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  date: string; // ISO yyyy-mm-dd
  km: number;
  liters: number;
  fuelType: string;
  pricePerLiter: number;
};

const FUEL_TYPES = ["Super E5", "Super E10", "Diesel", "Super Plus", "LPG", "CNG"];

function loadEntries(): FuelEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const fmtEUR = (n: number) =>
  n.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
const fmtNum = (n: number, d = 1) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("de-DE");
};

export default function FuelLog() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<FuelEntry[]>(loadEntries);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Formular-Felder
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [km, setKm] = useState("");
  const [liters, setLiters] = useState("");
  const [price, setPrice] = useState("");
  const [fuelType, setFuelType] = useState("Super E5");

  const persist = (next: FuelEntry[]) => {
    setEntries(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  // Chronologisch sortiert (älteste zuerst) für Verbrauchs-Berechnung
  const chronological = useMemo(
    () =>
      [...entries].sort((a, b) =>
        a.date === b.date ? a.km - b.km : a.date.localeCompare(b.date)
      ),
    [entries]
  );

  const stats = useMemo(() => {
    const totalCost = entries.reduce((s, e) => s + e.liters * e.pricePerLiter, 0);
    const totalLiters = entries.reduce((s, e) => s + e.liters, 0);
    // Verbrauch über alle plausiblen Intervalle
    let dist = 0;
    let fuelUsed = 0;
    for (let i = 1; i < chronological.length; i++) {
      const d = chronological[i].km - chronological[i - 1].km;
      if (d > 0 && d < 5000) {
        dist += d;
        fuelUsed += chronological[i].liters;
      }
    }
    const avgConsumption = dist > 0 ? (fuelUsed / dist) * 100 : null;
    return { totalCost, totalLiters, avgConsumption };
  }, [entries, chronological]);

  const consumptionFor = (entry: FuelEntry): number | null => {
    const idx = chronological.findIndex((e) => e.id === entry.id);
    if (idx <= 0) return null;
    const prev = chronological[idx - 1];
    const dist = entry.km - prev.km;
    if (dist <= 0 || dist >= 5000) return null;
    return (entry.liters / dist) * 100;
  };

  const resetForm = () => {
    setDate(today);
    setKm("");
    setLiters("");
    setPrice("");
    setFuelType("Super E5");
  };

  const save = () => {
    const kmN = parseFloat(km.replace(",", "."));
    const litersN = parseFloat(liters.replace(",", "."));
    const priceN = parseFloat(price.replace(",", "."));
    if (!date) {
      toast({ title: "Datum fehlt", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(kmN) || kmN < 0 || kmN > 2000000) {
      toast({ title: "Kilometerstand ungültig", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(litersN) || litersN <= 0 || litersN > 500) {
      toast({ title: "Liter ungültig", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(priceN) || priceN <= 0 || priceN > 10) {
      toast({ title: "Preis pro Liter ungültig", variant: "destructive" });
      return;
    }
    const entry: FuelEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date,
      km: kmN,
      liters: litersN,
      fuelType,
      pricePerLiter: priceN,
    };
    persist([...entries, entry]);
    toast({ title: "Tankfüllung gespeichert ⛽", description: `${fmtEUR(litersN * priceN)} · ${fmtDate(date)}` });
    resetForm();
    setFormOpen(false);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    persist(entries.filter((e) => e.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Eintrag gelöscht" });
  };

  // Neueste zuerst anzeigen
  const display = [...chronological].reverse();

  return (
    <div className="space-y-4">
      {/* Zusammenfassung */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 to-primary/5 p-3 text-center shadow-card">
          <Euro className="mx-auto mb-1 h-4 w-4 text-primary" />
          <div className="text-sm font-extrabold text-foreground">{fmtEUR(stats.totalCost)}</div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Gesamt</div>
        </div>
        <div className="rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/15 to-secondary/5 p-3 text-center shadow-card">
          <Droplets className="mx-auto mb-1 h-4 w-4 text-secondary" />
          <div className="text-sm font-extrabold text-foreground">{fmtNum(stats.totalLiters)} l</div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Getankt</div>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-to-br from-muted/60 to-muted/20 p-3 text-center shadow-card">
          <Gauge className="mx-auto mb-1 h-4 w-4 text-foreground/70" />
          <div className="text-sm font-extrabold text-foreground">
            {stats.avgConsumption !== null ? `${fmtNum(stats.avgConsumption)} l` : "—"}
          </div>
          <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Ø /100 km</div>
        </div>
      </div>

      {/* Neuer Eintrag */}
      {!formOpen ? (
        <Button
          onClick={() => setFormOpen(true)}
          className="w-full rounded-xl gradient-gold font-bold text-primary-foreground shadow-glow"
          size="lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tankfüllung hinzufügen
        </Button>
      ) : (
        <div className="space-y-3 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-4 shadow-card">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Sparkles className="h-4 w-4 text-primary" />
            Neue Tankfüllung
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fl-date" className="text-xs">Datum</Label>
              <Input
                id="fl-date"
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fl-km" className="text-xs">Kilometerstand</Label>
              <Input
                id="fl-km"
                inputMode="decimal"
                placeholder="z. B. 45230"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fl-liters" className="text-xs">Liter</Label>
              <Input
                id="fl-liters"
                inputMode="decimal"
                placeholder="z. B. 42,5"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fl-price" className="text-xs">Preis pro Liter (€)</Label>
              <Input
                id="fl-price"
                inputMode="decimal"
                placeholder="z. B. 1,699"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kraftstoffart</Label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUEL_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(() => {
            const l = parseFloat(liters.replace(",", "."));
            const p = parseFloat(price.replace(",", "."));
            return Number.isFinite(l) && Number.isFinite(p) && l > 0 && p > 0 ? (
              <div className="rounded-xl bg-secondary/10 px-3 py-2 text-center text-sm font-bold text-secondary">
                Gesamtpreis: {fmtEUR(l * p)}
              </div>
            ) : null;
          })()}
          <div className="flex gap-2">
            <Button onClick={save} className="flex-1 rounded-xl gradient-primary font-bold text-primary-foreground">
              Speichern
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setFormOpen(false);
              }}
              className="rounded-xl"
            >
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      {/* Einträge */}
      {display.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          <Fuel className="mx-auto mb-2 h-8 w-8 opacity-40" />
          Noch keine Tankfüllungen gespeichert.
        </div>
      ) : (
        <div className="space-y-2.5">
          {display.map((e) => {
            const cost = e.liters * e.pricePerLiter;
            const consumption = consumptionFor(e);
            const idx = chronological.findIndex((c) => c.id === e.id);
            const dist = idx > 0 ? e.km - chronological[idx - 1].km : null;
            return (
              <div
                key={e.id}
                className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-3.5 shadow-card"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {fmtDate(e.date)}
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {e.fuelType}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span className="text-lg font-extrabold text-foreground">{fmtEUR(cost)}</span>
                      <span className="text-xs text-muted-foreground">
                        {fmtNum(e.liters)} l × {fmtNum(e.pricePerLiter, 3)} €
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                      <span>{e.km.toLocaleString("de-DE")} km</span>
                      {dist !== null && dist > 0 && dist < 5000 && (
                        <span className="inline-flex items-center gap-1">
                          <Route className="h-3 w-3" />
                          +{dist.toLocaleString("de-DE")} km
                        </span>
                      )}
                      {consumption !== null && (
                        <span className="inline-flex items-center gap-1 font-bold text-secondary">
                          <Gauge className="h-3 w-3" />
                          {fmtNum(consumption)} l/100 km
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteId(e.id)}
                    className="h-9 w-9 shrink-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Eintrag löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Löschen bestätigen */}
      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Tankfüllung wird endgültig aus deinem Tankbuch entfernt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
