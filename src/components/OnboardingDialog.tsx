import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Locate, MapPin, Sparkles, Fuel } from "lucide-react";
import RegionPicker from "@/components/RegionPicker";

type Loc = { lat: number; lng: number; label: string };

export default function OnboardingDialog({
  open,
  onOpenChange,
  onPick,
  onUseGPS,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (l: Loc) => void;
  onUseGPS: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Fuel className="h-8 w-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-center text-2xl font-extrabold">
            Willkommen bei TankFinder
          </DialogTitle>
          <DialogDescription className="text-center">
            Wähle deinen Standort, um die günstigsten Tankstellen in deiner Nähe zu finden.
            Deine Auswahl wird für den nächsten Besuch gespeichert.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 grid gap-2">
          <Button
            onClick={onUseGPS}
            size="lg"
            className="gradient-primary text-primary-foreground shadow-glow rounded-xl"
          >
            <Locate className="mr-2 h-5 w-5" />
            Aktuellen Standort verwenden
          </Button>
          <div className="relative my-1 text-center">
            <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-border" />
            <span className="bg-background px-3 text-[11px] uppercase tracking-widest text-muted-foreground">
              oder
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Bundesland & Stadt wählen</span>
          </div>
          <div className="max-h-[45vh] overflow-y-auto rounded-xl border border-border/60 bg-card/40 p-2">
            <RegionPicker onPick={onPick} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
