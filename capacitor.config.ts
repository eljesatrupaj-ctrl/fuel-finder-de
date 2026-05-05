import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.lovable.e53d945afee6439aa5b4d4d0c47ceb18",
  appName: "TankFinder DE",
  webDir: "dist",
  server: {
    url: "https://e53d945a-fee6-439a-a5b4-d4d0c47ceb18.lovableproject.com?forceHideBadge=true",
    cleartext: true,
  },
  plugins: {
    AdMob: {
      appId: "ca-app-pub-3940256099942544~3347511713",
    },
  },
};

export default config;
