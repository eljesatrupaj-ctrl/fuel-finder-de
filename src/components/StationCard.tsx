import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { openInMaps, type Station } from "@/lib/tankerkoenig";

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
  const currentPrice = highlightFuel ? s[highlightFuel] : null;
  const isBest = cheapest != null && currentPrice != null && Math.abs(currentPrice - cheapest) < 0.0005;
  const priceParts = currentPrice && currentPrice > 0 ? currentPrice.toFixed(3).split(".") : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className={`group relative overflow-hidden rounded-xl border bg-card shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated ${isBest ? "border-secondary/55 ring-1 ring-secondary/20" : "border-border/80"}`}
    >
      {isBest && <div className="absolute inset-x-0 top-0 h-1 bg-secondary" />}
      <div className="p-3 sm:p-4">
        {isBest && (
          <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[9px] font-extrabold uppercase text-secondary-foreground">
            <Trophy className="h-3 w-3" /> Günstigster
          </div>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {!isBest && rank != null && <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">{rank}</span>}
              <h3 className="font-display truncate text-sm font-extrabold sm:text-base">{s.name}</h3>
            </div>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{s.street} {s.houseNumber}, {s.postCode} {s.place}</span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            {priceParts ? <div className={`font-display text-2xl font-extrabold tabular-nums ${isBest ? "text-secondary" : "text-foreground"}`}><span className="mr-1 text-[10px]">€</span>{priceParts[0]},{priceParts[1]}</div> : <div className="text-xl font-extrabold text-muted-foreground">—</div>}
            <p className="text-[8px] font-bold uppercase text-muted-foreground">Pro Liter</p>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-primary/14 px-2 py-1 text-[10px] font-bold text-primary-foreground"><Navigation className="h-3 w-3" /> {s.dist.toFixed(1)} km</span>
          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold ${s.isOpen ? "bg-secondary/10 text-secondary" : "bg-destructive/10 text-destructive"}`}><Clock className="h-3 w-3" /> {s.isOpen ? "Offen" : "Geschlossen"}</span>
        </div>

        <Button
          onClick={() => openInMaps(s)}
          className={`mt-2.5 h-9 w-full rounded-lg text-sm font-bold ${isBest ? "bg-secondary text-secondary-foreground hover:bg-secondary/90" : "gradient-primary text-primary-foreground hover:opacity-90"}`}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Route anzeigen
        </Button>
      </div>
    </motion.article>
  );
}
