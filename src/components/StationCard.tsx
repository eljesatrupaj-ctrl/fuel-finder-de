import { motion } from "framer-motion";
import { MapPin, Navigation, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { openInMaps, type Station } from "@/lib/tankerkoenig";

const fmt = (v: number | null) =>
  v == null ? "—" : v.toFixed(3).replace(/0$/, "") + " €";

const brandColor = (brand: string) => {
  const b = (brand || "").toLowerCase();
  if (b.includes("aral")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (b.includes("shell")) return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";
  if (b.includes("esso")) return "bg-red-500/15 text-red-400 border-red-500/30";
  if (b.includes("total")) return "bg-orange-500/15 text-orange-400 border-orange-500/30";
  if (b.includes("jet")) return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  if (b.includes("hem")) return "bg-purple-500/15 text-purple-400 border-purple-500/30";
  return "bg-muted text-muted-foreground border-border";
};

export default function StationCard({ s, index = 0 }: { s: Station; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative overflow-hidden rounded-2xl border border-border gradient-card shadow-card transition-all hover:shadow-elevated hover:border-primary/40"
    >
      <div className="absolute inset-x-0 top-0 h-1 gradient-fuel opacity-70" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${brandColor(s.brand)}`}>
                {s.brand || "Tankstelle"}
              </Badge>
              <span className={`flex items-center gap-1 text-[11px] ${s.isOpen ? "text-success" : "text-destructive"}`}
                style={{ color: s.isOpen ? "hsl(var(--success))" : "hsl(var(--destructive))" }}>
                <Clock className="h-3 w-3" />
                {s.isOpen ? "Hapur" : "Mbyllur"}
              </span>
            </div>
            <h3 className="mt-1.5 truncate text-base font-semibold">{s.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {s.street} {s.houseNumber}, {s.postCode} {s.place}
            </p>
          </div>
          <div className="shrink-0 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            {s.dist.toFixed(1)} km
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "E5", v: s.e5, color: "from-primary/20 to-primary/5" },
            { label: "E10", v: s.e10, color: "from-secondary/20 to-secondary/5" },
            { label: "Diesel", v: s.diesel, color: "from-yellow-500/20 to-yellow-500/5" },
          ].map((f) => (
            <div
              key={f.label}
              className={`rounded-xl border border-border bg-gradient-to-br ${f.color} p-2.5 text-center`}
            >
              <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {f.label}
              </div>
              <div className="mt-0.5 font-mono text-sm font-bold">{fmt(f.v)}</div>
            </div>
          ))}
        </div>

        <Button
          onClick={() => openInMaps(s)}
          className="mt-4 w-full gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
        >
          <Navigation className="mr-2 h-4 w-4" />
          Udhëto te pompa
        </Button>
      </div>
    </motion.article>
  );
}
