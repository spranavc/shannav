import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, DollarSign, Lightbulb, Plus, LocateFixed, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const sections = [
  {
    to: "/app/itinerary",
    icon: CalendarDays,
    title: "Itinerary",
    description: "Plan your trip day by day — breakfast, morning, lunch, afternoon, dinner, and evening.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    to: "/app/budget",
    icon: DollarSign,
    title: "Budget",
    description: "Track every expense and see the total split across all attendees.",
    color: "bg-green-100 text-green-600",
  },
  {
    to: "/app/ideas",
    icon: Lightbulb,
    title: "Trip Ideas",
    description: "Capture restaurants, experiences, and stays — whether they make the itinerary or not.",
    color: "bg-amber-100 text-amber-600",
  },
];

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, 13, { animate: true });
  }, [coords, map]);
  return null;
}

function LocationMap() {
  const [userCoords, setUserCoords] = useState(null);
  const [markerCoords, setMarkerCoords] = useState(null);
  const [markerLabel, setMarkerLabel] = useState("You are here");
  const [geoError, setGeoError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchError, setSearchError] = useState(null);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(coords);
        setMarkerCoords(coords);
        setLoading(false);
      },
      () => {
        setGeoError("Location access denied.");
        setLoading(false);
      }
    );
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (!data.length) {
        setSearchError("No results found. Try a different address.");
      } else {
        setMarkerCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setMarkerLabel(data[0].display_name);
      }
    } catch {
      setSearchError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }

  function handleReset() {
    if (userCoords) {
      setMarkerCoords(userCoords);
      setMarkerLabel("You are here");
      setQuery("");
      setSearchError(null);
    }
  }

  if (loading) {
    return (
      <div className="h-72 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
        Locating you…
      </div>
    );
  }

  const initialCenter = userCoords ?? [20, 0];
  const initialZoom = userCoords ? 13 : 2;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 p-3 bg-white border-b border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search an address or place…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Button type="submit" size="sm" disabled={searching}>
          {searching ? "…" : "Go"}
        </Button>
        {userCoords && markerLabel !== "You are here" && (
          <Button type="button" size="sm" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        )}
      </form>

      {/* Error / geo fallback messages */}
      {(searchError || geoError) && (
        <p className="px-3 py-1.5 text-xs text-red-500 bg-red-50 border-b border-red-100">
          {searchError ?? geoError}
        </p>
      )}

      {/* Map */}
      <div className="h-72">
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          zoomControl={true}
          scrollWheelZoom={false}
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <RecenterMap coords={markerCoords} />
          {markerCoords && (
            <Marker position={markerCoords}>
              <Popup>{markerLabel}</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.email?.split("@")[0] ?? "there";

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Greeting */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome back, {firstName} 👋
        </h1>
        <p className="mt-2 text-slate-500">
          Ready to plan your next trip?
        </p>
      </div>

      {/* Location map */}
      <div className="mb-10">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <LocateFixed className="w-4 h-4" />
          Your location
        </h2>
        <LocationMap />
      </div>

      {/* Upcoming trips */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 whitespace-nowrap">Upcoming Trips</h2>
          <div className="flex-1 h-px bg-slate-200" />
        </div>
        <div className="flex items-center justify-center h-24 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 text-sm">
          No upcoming trips yet — create one below.
        </div>
      </div>

      {/* Create trip CTA */}
      <div className="mb-10 p-6 rounded-xl border-2 border-dashed border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Start a new trip</h2>
          <p className="text-sm text-slate-500 mt-1">Create a trip to begin planning your itinerary, budget, and ideas.</p>
        </div>
        <Button onClick={() => navigate("/app/itinerary")} className="shrink-0 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New trip
        </Button>
      </div>

      {/* Section cards */}
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">Sections</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {sections.map(({ to, icon: Icon, title, description, color }) => (
          <Card
            key={to}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(to)}
          >
            <CardHeader>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
