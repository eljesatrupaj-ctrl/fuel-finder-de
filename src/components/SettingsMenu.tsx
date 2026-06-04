import { useState } from "react";
import { Settings, Share2, Star, Shield, Sparkles, ExternalLink, Heart, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.tankfinder.de";
const SHARE_TEXT =
  "TankFinder DE — finde die günstigsten Spritpreise in deiner Nähe! Live-Daten für E5, E10 & Diesel.";

export default function SettingsMenu() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareApp = async () => {
    const data = { title: "TankFinder DE", text: SHARE_TEXT, url: PLAY_STORE_URL };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(`${SHARE_TEXT}\n${PLAY_STORE_URL}`);
        toast({ title: "Link kopiert", description: "App-Link in die Zwischenablage kopiert." });
      }
    } catch {}
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(PLAY_STORE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const items = [
    {
      icon: Star,
      title: "App bewerten",
      desc: "Hilf uns mit 5 Sternen im Play Store",
      onClick: () => setRateOpen(true),
      accent: "from-yellow-500/20 to-amber-500/5 text-yellow-400 border-yellow-500/30",
    },
    {
      icon: Share2,
      title: "App teilen",
      desc: "Empfehle TankFinder deinen Freunden",
      onClick: shareApp,
      accent: "from-primary/25 to-primary/5 text-primary border-primary/30",
    },
    {
      icon: Shield,
      title: "Datenschutz",
      desc: "Datenschutzerklärung & Hinweise",
      onClick: () => setPrivacyOpen(true),
      accent: "from-secondary/25 to-secondary/5 text-secondary border-secondary/30",
    },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 shrink-0 rounded-full"
            aria-label="Einstellungen"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto pb-[calc(110px+env(safe-area-inset-bottom,0px))] sm:max-w-md"
        >
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-extrabold tracking-tight">Einstellungen</SheetTitle>
            <SheetDescription>Verwalte deine App-Optionen.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            {items.map((it) => (
              <button
                key={it.title}
                onClick={() => {
                  setOpen(false);
                  setTimeout(it.onClick, 180);
                }}
                className={`group flex w-full items-center gap-3 rounded-2xl border bg-gradient-to-br ${it.accent} p-4 text-left transition hover:scale-[1.01] hover:shadow-card`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background/40 backdrop-blur">
                  <it.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-foreground">{it.title}</div>
                  <div className="text-xs text-muted-foreground">{it.desc}</div>
                </div>
                <ExternalLink className="h-4 w-4 opacity-50 transition group-hover:opacity-100" />
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border/70 bg-card/60 p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="text-sm font-semibold">TankFinder DE</div>
            <div className="text-[11px] text-muted-foreground">Version 1.0 · Live-Spritpreise</div>
            <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground/80">
              Krijuar nga <span className="font-semibold text-foreground/90">DS Interactive</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Privacy Dialog */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Shield className="h-5 w-5 text-secondary" />
              Datenschutzerklärung
            </DialogTitle>
            <DialogDescription>Stand: Juni 2026</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">TankFinder DE</strong> respektiert deine Privatsphäre. Diese App
              verarbeitet personenbezogene Daten nur in dem Umfang, der für die Bereitstellung der
              Funktionalität erforderlich ist.
            </p>
            <div>
              <h4 className="mb-1 font-semibold text-foreground">1. Standortdaten</h4>
              <p>
                Wenn du die GPS-Funktion aktivierst, wird dein Standort ausschließlich lokal auf deinem Gerät
                genutzt, um Tankstellen in der Nähe zu suchen. Es findet keine Speicherung oder Übertragung an
                unsere Server statt.
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-foreground">2. Tankstellendaten</h4>
              <p>
                Live-Spritpreise werden über die offizielle Schnittstelle{" "}
                <a className="text-primary underline" href="https://creativecommons.tankerkoenig.de/" target="_blank" rel="noreferrer">
                  Tankerkönig
                </a>{" "}
                bezogen.
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-foreground">3. Werbung (Google AdMob)</h4>
              <p>
                Die App zeigt Werbeanzeigen über Google AdMob an. Google kann dabei Geräte- und
                Nutzungsdaten gemäß seiner{" "}
                <a className="text-primary underline" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
                  Datenschutzerklärung
                </a>{" "}
                verarbeiten.
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-foreground">4. Lokale Speicherung</h4>
              <p>
                Deine zuletzt gewählte Region wird ausschließlich lokal in deinem Browser/Gerät gespeichert
                (LocalStorage), um beim nächsten Start direkt Ergebnisse anzeigen zu können.
              </p>
            </div>
            <div>
              <h4 className="mb-1 font-semibold text-foreground">5. Kontakt</h4>
              <p>
                Bei Fragen zum Datenschutz: <span className="text-foreground">DS Interactive</span>.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rate Dialog */}
      <Dialog open={rateOpen} onOpenChange={setRateOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 gradient-hero" />
            <div className="relative px-6 pt-8 pb-6 text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-glow">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold">Gefällt dir TankFinder?</DialogTitle>
                <DialogDescription className="mt-2">
                  Hilf uns mit <strong className="text-yellow-400">5 Sternen</strong> und einer netten
                  Bewertung im Play Store. Das motiviert uns enorm! 🙏
                </DialogDescription>
              </DialogHeader>
              <div className="my-5 flex justify-center gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-9 w-9 fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                    style={{ animation: `pulse 1.5s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 px-6 pb-6">
            <Button
              asChild
              className="w-full gradient-primary text-primary-foreground shadow-glow rounded-xl"
              size="lg"
            >
              <a href={PLAY_STORE_URL} target="_blank" rel="noreferrer">
                <Star className="mr-2 h-4 w-4" />
                Jetzt bewerten
              </a>
            </Button>
            <Button variant="outline" className="w-full rounded-xl" onClick={copyLink}>
              {copied ? <Check className="mr-2 h-4 w-4 text-secondary" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Link kopiert!" : "Link kopieren"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
