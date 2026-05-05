import { supabase } from "@/integrations/supabase/client";

export type Station = {
  id: string;
  name: string;
  brand: string;
  street: string;
  place: string;
  houseNumber: string;
  postCode: number;
  lat: number;
  lng: number;
  dist: number;
  diesel: number | null;
  e5: number | null;
  e10: number | null;
  isOpen: boolean;
};

export type ListResponse = {
  ok?: boolean;
  status?: string;
  stations?: Station[];
  error?: string;
  missingKey?: boolean;
};

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tankerkoenig`;

export async function fetchStations(params: {
  lat: number;
  lng: number;
  rad?: number;
  type?: "all" | "diesel" | "e5" | "e10";
  sort?: "dist" | "price";
}): Promise<ListResponse> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const q = new URLSearchParams({
    action: "list",
    lat: String(params.lat),
    lng: String(params.lng),
    rad: String(params.rad ?? 10),
    type: params.type ?? "all",
    sort: params.sort ?? "dist",
  });
  const res = await fetch(`${FN_URL}?${q.toString()}`, {
    headers: {
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export function openInMaps(s: { lat: number; lng: number; name: string }) {
  const label = encodeURIComponent(s.name);
  const url = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}&destination_place_id=${label}&travelmode=driving`;
  window.open(url, "_blank");
}
