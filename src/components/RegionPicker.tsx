import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, MapPin } from "lucide-react";
import { BUNDESLAENDER, type Bundesland, type City } from "@/data/germany";

type Props = {
  onPick: (loc: { lat: number; lng: number; label: string }) => void;
};

export default function RegionPicker({ onPick }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const handleLand = (b: Bundesland) => {
    setOpenId(openId === b.id ? null : b.id);
  };
  const handleCity = (b: Bundesland, c: City) => {
    onPick({ lat: c.lat, lng: c.lng, label: `${c.name}, ${b.name}` });
  };

  return (
    <div className="space-y-2">
      {BUNDESLAENDER.map((b) => (
        <div key={b.id} className="overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur">
          <button
            onClick={() => handleLand(b)}
            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-muted/40"
          >
            <div>
              <div className="font-semibold">{b.name}</div>
              <div className="text-xs text-muted-foreground">Kryeqyteti: {b.capital} · {b.cities.length} qytete</div>
            </div>
            <motion.div animate={{ rotate: openId === b.id ? 90 : 0 }}>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </button>
          <AnimatePresence initial={false}>
            {openId === b.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-border bg-background/40"
              >
                <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3">
                  {b.cities.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleCity(b, c)}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm transition hover:border-primary hover:bg-primary/5"
                    >
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
