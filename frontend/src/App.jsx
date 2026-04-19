import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Clock, DollarSign, MapPin } from "lucide-react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";

const features = [
  { icon: Clock, title: "Time", description: "See exactly how long each activity, transit leg, and stay will take." },
  { icon: DollarSign, title: "Budget", description: "Set a trip budget and track costs per item." },
  { icon: MapPin, title: "Location", description: "Understand where everything is relative to you." },
];

function SlowDrift() {
  const map = useMap();
  useEffect(() => {
    let frame;
    const speed = 0.015;
    function drift() {
      const { lat, lng } = map.getCenter();
      map.setView([lat, lng + speed], map.getZoom(), { animate: false });
      frame = requestAnimationFrame(drift);
    }
    frame = requestAnimationFrame(drift);
    return () => cancelAnimationFrame(frame);
  }, [map]);
  return null;
}

function Home() {
  const { user } = useAuth();
  return (
    <div className="relative min-h-screen flex flex-col">

      {/* Full-screen map background */}
      <div className="fixed inset-0 z-0">
        <MapContainer
          center={[20, 0]}
          zoom={2.5}
          zoomControl={true}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          keyboard={true}
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          {/* Natural earth tile — green land, ocean blue */}
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}" />
          <SlowDrift />
        </MapContainer>
        {/* Subtle overlay — keeps readability without killing the map colors */}
        <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />
      </div>

      {/* Content on top of map */}
      <div className="relative z-10 flex flex-col min-h-screen pointer-events-none">
        {/* Header — re-enable pointer events */}
        <header className="bg-transparent pointer-events-auto">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">Shannav</a>
            {user
              ? <Button variant="outline" size="sm" className="bg-white/90 text-slate-800 border-white hover:bg-white" onClick={() => window.location.href = "/app"}>Open app</Button>
              : <Button variant="outline" size="sm" className="bg-white/90 text-slate-800 border-white hover:bg-white" onClick={() => window.location.href = "/login"}>Sign in</Button>
            }
          </div>
        </header>

        {/* Hero */}
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 pointer-events-none">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white max-w-2xl leading-tight [text-shadow:0_2px_20px_rgba(0,0,0,0.9)]">
            Plan smarter trips
          </h1>
          <p className="mt-4 text-lg text-white max-w-xl [text-shadow:0_1px_10px_rgba(0,0,0,0.9)]">
            Built around the three things that matter most — time, money, and where you are.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 pointer-events-auto">
            <Button size="lg" onClick={() => window.location.href = "/app/itinerary"}>
              Start planning
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-black border-white hover:bg-white/90 hover:text-black"
            >
              See how it works
            </Button>
          </div>
        </section>

        {/* Feature cards */}
        <section className="max-w-5xl mx-auto px-4 py-16 w-full pointer-events-none">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="bg-white/90 backdrop-blur hover:shadow-md transition-shadow pointer-events-auto">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-500">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="text-center py-6 text-sm text-white/60 pointer-events-none">
          © {new Date().getFullYear()} Shannav
        </footer>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-400">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      {title} — coming soon
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="itinerary" element={<PlaceholderPage title="Itinerary" />} />
                    <Route path="budget" element={<PlaceholderPage title="Budget" />} />
                    <Route path="ideas" element={<PlaceholderPage title="Trip Ideas" />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
