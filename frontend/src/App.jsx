import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Clock, DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Clock,
    title: "Time",
    description: "See exactly how long each activity, transit leg, and stay will take. No more guessing.",
  },
  {
    icon: DollarSign,
    title: "Budget",
    description: "Set a trip budget and track costs per item. Know what you're spending before you spend it.",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Understand where everything is relative to you — distances, travel times, and clusters.",
  },
];

function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-brand-600">Shannav</span>
          <Button variant="outline" size="sm">Sign in</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-brand-50 to-slate-50">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 max-w-2xl leading-tight">
          Plan smarter trips
        </h1>
        <p className="mt-4 text-lg text-slate-500 max-w-xl">
          Built around the three things that matter most — time, money, and where you are.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button size="lg">Start planning</Button>
          <Button size="lg" variant="outline">See how it works</Button>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-16 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
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

      {/* Footer */}
      <footer className="border-t border-slate-200 text-center py-6 text-sm text-slate-400">
        © {new Date().getFullYear()} Shannav
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
