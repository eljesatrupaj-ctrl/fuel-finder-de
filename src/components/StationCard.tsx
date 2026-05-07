import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Flame, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { openInMaps, type Station } from "@/lib/tankerkoenig";

const fmt = (v: number | null) =>
  v == null || v <= 0 ? "—" : v.toFixed(3).replace(".", ",") + " €";

const brandColor = (brand: string) => {
  const b = (brand || "").toLowerCase();
  if (b.includes("aral")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (b.includes("shell")) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  if (b.includes("esso")) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (b.includes("total")) return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  if (b.includes("jet")) return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  if (b.includes("hem")) return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  if (b.includes("sprint")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (b.includes("elan")) return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  return "bg-muted text-muted-foreground border-border";
};

type Key = "e5" | "e10" | "diesel";

export default function StationCard({
  s,
  index = 0,
  highlightFuel = null,
  cheapest = null,
  rank = null,
  mostExpensive = null,
}: {
  s: Station;
  index?: number;
  highlightFuel?: Key | null;
  cheapest?: number | null;
  rank?: number | null;
  mostExpensive?: number | null;
}) {
  const fuels: { label: string; key: Key; v: number | null; color: string }[] = [
    { label: "E5", key: "e5", v: s.e5, color: "from-primary/25 to-primary/5" },
    { label: "E10", key: "e10", v: s.e10, color: "from-secondary/25 to-secondary/5" },
    { label: "Diesel", key: "diesel", v: s.diesel, color: "from-yellow-500/25 to-yellow-500/5" },
  ];

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative overflow-hidden rounded-[1.35rem] border border-border/80 gradient-card shadow-card transition-all hover:shadow-elevated hover:border-primary/45 hover:-translate-y-0.5"
    >
      <div className="absolute inset-x-0 top-0 h-1 gradient-fuel opacity-80" />
      <div className="absolute -right-12 -top-12 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${brandColor(s.brand)}`}>
                {s.brand || "Tankstelle"}
              </Badge>
              <span className="flex items-center gap-1 text-[11px]"
                style={{ color: s.isOpen ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>
                <Clock className="h-3 w-3" />
                {s.isOpen ? "Geöffnet" : "Geschlossen"}
              </span>
            </div>
            <h3 className="mt-1.5 truncate text-base font-semibold">{s.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{s.street} {s.houseNumber}, {s.postCode} {s.place}</span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {rank != null && (
              <div className="rounded-full border border-secondary/35 bg-secondary/12 px-2.5 py-1 text-[11px] font-extrabold text-secondary">
                #{rank}
              </div>
            )}
            <div className="rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
              {s.dist.toFixed(1)} km
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {fuels.map((f) => {
            const isBest =
              cheapest != null &&
              highlightFuel === f.key &&
              f.v != null &&
              Math.abs(f.v - cheapest) < 0.0005;
            return (
              <div
                key={f.label}
                className={`relative min-h-[70px] rounded-xl border bg-gradient-to-br ${f.color} p-2.5 text-center ${
                  isBest ? "border-secondary ring-2 ring-secondary/40" : "border-border"
                }`}
              >
                {isBest && (
                  <Flame className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-secondary p-0.5 text-secondary-foreground" />
                )}
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {f.label}
                </div>
                <div className="mt-0.5 font-mono text-sm font-bold tabular-nums">{fmt(f.v)}</div>
                {highlightFuel === f.key && f.v != null && f.v > 0 && (
                  <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                    {isBest ? <TrendingDown className="h-3 w-3 text-secondary" /> : f.v === mostExpensive ? <TrendingUp className="h-3 w-3 text-destructive" /> : null}
                    <span>{isBest ? "Bestpreis" : f.v === mostExpensive ? "Teuer" : "Live"}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={() => openInMaps(s)}
          className="mt-4 w-full gradient-primary text-primary-foreground hover:opacity-90 shadow-glow rounded-xl"
        >
          <Navigation className="mr-2 h-4 w-4" />
          Route starten
        </Button>
      </div>
    </motion.article>
  );
}
