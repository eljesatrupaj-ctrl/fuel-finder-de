// Bundesländer (republikat) e Gjermanisë me qytete kryesore dhe koordinata
export type City = { name: string; lat: number; lng: number };
export type Bundesland = {
  id: string;
  name: string;
  capital: string;
  lat: number;
  lng: number;
  cities: City[];
};

export const BUNDESLAENDER: Bundesland[] = [
  {
    id: "bw", name: "Baden-Württemberg", capital: "Stuttgart", lat: 48.7758, lng: 9.1829,
    cities: [
      { name: "Stuttgart", lat: 48.7758, lng: 9.1829 },
      { name: "Karlsruhe", lat: 49.0069, lng: 8.4037 },
      { name: "Mannheim", lat: 49.4875, lng: 8.4660 },
      { name: "Freiburg", lat: 47.9990, lng: 7.8421 },
      { name: "Heidelberg", lat: 49.3988, lng: 8.6724 },
      { name: "Ulm", lat: 48.4011, lng: 9.9876 },
    ],
  },
  {
    id: "by", name: "Bayern", capital: "München", lat: 48.1351, lng: 11.5820,
    cities: [
      { name: "München", lat: 48.1351, lng: 11.5820 },
      { name: "Nürnberg", lat: 49.4521, lng: 11.0767 },
      { name: "Augsburg", lat: 48.3705, lng: 10.8978 },
      { name: "Regensburg", lat: 49.0134, lng: 12.1016 },
      { name: "Würzburg", lat: 49.7913, lng: 9.9534 },
      { name: "Ingolstadt", lat: 48.7665, lng: 11.4258 },
    ],
  },
  {
    id: "be", name: "Berlin", capital: "Berlin", lat: 52.5200, lng: 13.4050,
    cities: [
      { name: "Mitte", lat: 52.5200, lng: 13.4050 },
      { name: "Charlottenburg", lat: 52.5167, lng: 13.3000 },
      { name: "Kreuzberg", lat: 52.4979, lng: 13.4030 },
      { name: "Pankow", lat: 52.5690, lng: 13.4022 },
      { name: "Spandau", lat: 52.5354, lng: 13.2007 },
    ],
  },
  {
    id: "bb", name: "Brandenburg", capital: "Potsdam", lat: 52.4009, lng: 13.0591,
    cities: [
      { name: "Potsdam", lat: 52.4009, lng: 13.0591 },
      { name: "Cottbus", lat: 51.7563, lng: 14.3329 },
      { name: "Brandenburg an der Havel", lat: 52.4125, lng: 12.5316 },
      { name: "Frankfurt (Oder)", lat: 52.3471, lng: 14.5506 },
    ],
  },
  {
    id: "hb", name: "Bremen", capital: "Bremen", lat: 53.0793, lng: 8.8017,
    cities: [
      { name: "Bremen", lat: 53.0793, lng: 8.8017 },
      { name: "Bremerhaven", lat: 53.5396, lng: 8.5810 },
    ],
  },
  {
    id: "hh", name: "Hamburg", capital: "Hamburg", lat: 53.5511, lng: 9.9937,
    cities: [
      { name: "Hamburg-Mitte", lat: 53.5511, lng: 9.9937 },
      { name: "Altona", lat: 53.5500, lng: 9.9358 },
      { name: "Harburg", lat: 53.4604, lng: 9.9836 },
      { name: "Wandsbek", lat: 53.5816, lng: 10.0876 },
    ],
  },
  {
    id: "he", name: "Hessen", capital: "Wiesbaden", lat: 50.0826, lng: 8.2400,
    cities: [
      { name: "Frankfurt am Main", lat: 50.1109, lng: 8.6821 },
      { name: "Wiesbaden", lat: 50.0826, lng: 8.2400 },
      { name: "Kassel", lat: 51.3127, lng: 9.4797 },
      { name: "Darmstadt", lat: 49.8728, lng: 8.6512 },
      { name: "Offenbach", lat: 50.0955, lng: 8.7761 },
    ],
  },
  {
    id: "mv", name: "Mecklenburg-Vorpommern", capital: "Schwerin", lat: 53.6355, lng: 11.4010,
    cities: [
      { name: "Schwerin", lat: 53.6355, lng: 11.4010 },
      { name: "Rostock", lat: 54.0887, lng: 12.1404 },
      { name: "Neubrandenburg", lat: 53.5573, lng: 13.2602 },
      { name: "Stralsund", lat: 54.3091, lng: 13.0813 },
    ],
  },
  {
    id: "ni", name: "Niedersachsen", capital: "Hannover", lat: 52.3759, lng: 9.7320,
    cities: [
      { name: "Hannover", lat: 52.3759, lng: 9.7320 },
      { name: "Braunschweig", lat: 52.2689, lng: 10.5268 },
      { name: "Osnabrück", lat: 52.2799, lng: 8.0472 },
      { name: "Oldenburg", lat: 53.1435, lng: 8.2146 },
      { name: "Göttingen", lat: 51.5413, lng: 9.9158 },
    ],
  },
  {
    id: "nw", name: "Nordrhein-Westfalen", capital: "Düsseldorf", lat: 51.2277, lng: 6.7735,
    cities: [
      { name: "Köln", lat: 50.9375, lng: 6.9603 },
      { name: "Düsseldorf", lat: 51.2277, lng: 6.7735 },
      { name: "Dortmund", lat: 51.5136, lng: 7.4653 },
      { name: "Essen", lat: 51.4556, lng: 7.0116 },
      { name: "Duisburg", lat: 51.4344, lng: 6.7623 },
      { name: "Bochum", lat: 51.4818, lng: 7.2162 },
      { name: "Bonn", lat: 50.7374, lng: 7.0982 },
      { name: "Münster", lat: 51.9607, lng: 7.6261 },
      { name: "Aachen", lat: 50.7753, lng: 6.0839 },
    ],
  },
  {
    id: "rp", name: "Rheinland-Pfalz", capital: "Mainz", lat: 49.9929, lng: 8.2473,
    cities: [
      { name: "Mainz", lat: 49.9929, lng: 8.2473 },
      { name: "Koblenz", lat: 50.3569, lng: 7.5890 },
      { name: "Trier", lat: 49.7497, lng: 6.6371 },
      { name: "Ludwigshafen", lat: 49.4774, lng: 8.4452 },
      { name: "Kaiserslautern", lat: 49.4401, lng: 7.7491 },
    ],
  },
  {
    id: "sl", name: "Saarland", capital: "Saarbrücken", lat: 49.2402, lng: 6.9969,
    cities: [
      { name: "Saarbrücken", lat: 49.2402, lng: 6.9969 },
      { name: "Neunkirchen", lat: 49.3470, lng: 7.1797 },
      { name: "Homburg", lat: 49.3247, lng: 7.3360 },
    ],
  },
  {
    id: "sn", name: "Sachsen", capital: "Dresden", lat: 51.0504, lng: 13.7373,
    cities: [
      { name: "Dresden", lat: 51.0504, lng: 13.7373 },
      { name: "Leipzig", lat: 51.3397, lng: 12.3731 },
      { name: "Chemnitz", lat: 50.8278, lng: 12.9214 },
      { name: "Zwickau", lat: 50.7187, lng: 12.4922 },
    ],
  },
  {
    id: "st", name: "Sachsen-Anhalt", capital: "Magdeburg", lat: 52.1205, lng: 11.6276,
    cities: [
      { name: "Magdeburg", lat: 52.1205, lng: 11.6276 },
      { name: "Halle (Saale)", lat: 51.4825, lng: 11.9700 },
      { name: "Dessau-Roßlau", lat: 51.8344, lng: 12.2469 },
    ],
  },
  {
    id: "sh", name: "Schleswig-Holstein", capital: "Kiel", lat: 54.3233, lng: 10.1228,
    cities: [
      { name: "Kiel", lat: 54.3233, lng: 10.1228 },
      { name: "Lübeck", lat: 53.8654, lng: 10.6866 },
      { name: "Flensburg", lat: 54.7937, lng: 9.4460 },
      { name: "Neumünster", lat: 54.0714, lng: 9.9809 },
    ],
  },
  {
    id: "th", name: "Thüringen", capital: "Erfurt", lat: 50.9848, lng: 11.0299,
    cities: [
      { name: "Erfurt", lat: 50.9848, lng: 11.0299 },
      { name: "Jena", lat: 50.9272, lng: 11.5892 },
      { name: "Gera", lat: 50.8807, lng: 12.0832 },
      { name: "Weimar", lat: 50.9795, lng: 11.3235 },
    ],
  },
];
