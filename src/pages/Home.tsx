import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { Alert } from "@/components/Map";
import AlertCard from "@/components/AlertCard";
import Map from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, MapPin, LayoutGrid, Plus } from "lucide-react";
import AIChatbot from "@/components/AIChatbot";
import { Link, useLocation } from "react-router-dom";

type AlertCategory = "fire" | "crime" | "accident" | "weather" | "other";

const Home = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<AlertCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [highlightedAlertId, setHighlightedAlertId] = useState<string | undefined>();
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);

  const categories: AlertCategory[] = ["fire", "crime", "accident", "weather", "other"];

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    const state = location.state as { newAlertId?: string, alertLocation?: { lat: number, lng: number } } | null;
    
    if (state?.newAlertId) {
      setHighlightedAlertId(state.newAlertId);
      
      if (state.alertLocation) {
        setMapCenter([state.alertLocation.lat, state.alertLocation.lng]);
        setMapZoom(13);
      }
      
      setViewMode("map");
      
      toast({
        title: "Alert Created",
        description: "Your new alert has been added to the map.",
      });
      
      window.history.replaceState({}, document.title);
    }
  }, [location, toast]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const alertsCollection = collection(db, "alerts");
      const alertsQuery = query(
        alertsCollection,
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(alertsQuery);
      const alertsList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title,
          category: data.category,
          location: data.location,
          description: data.description,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt,
          createdBy: data.createdBy
        };
      });
      
      setAlerts(alertsList);
    } catch (error: any) {
      toast({
        title: "Error fetching alerts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category: AlertCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = 
      searchTerm === "" ||
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.description && alert.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      alert.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategories.length === 0 || 
      selectedCategories.includes(alert.category as AlertCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleAlertClick = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert) {
      setHighlightedAlertId(alertId);
      if (viewMode === "grid") {
        setViewMode("map");
      }

      toast({
        title: alert.title,
        description: alert.description || "No description provided",
      });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 3 && viewMode !== "map") {
      setViewMode("map");
    }
  };

  return (
    <div className="bg-gradient-to-b from-background to-secondary/20 min-h-screen">
      <div className="container mx-auto py-8 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-gradient-primary">Community Alerts</h1>
          <p className="text-muted-foreground text-lg">
            Stay informed about what's happening around you. View recent alerts
            posted by members of your community.
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Link to="/create-alert">
            <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-5 shadow-md">
              <Plus className="h-4 w-4" />
              Create Alert
            </Button>
          </Link>
        </div>

        <div className="bg-card shadow-lg rounded-xl p-6 mb-8">
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search alerts by title, description or location..."
                className="pl-10 h-12 border-input bg-background"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-sm font-medium mr-2">Filter by:</span>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className={`cursor-pointer px-3 py-1 text-sm transition-all ${
                    selectedCategories.includes(category) 
                      ? getCategoryBadgeClass(category) 
                      : "hover:bg-secondary"
                  }`}
                  onClick={() => toggleCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Badge>
              ))}
              {selectedCategories.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedCategories([])}
                  className="text-xs ml-2"
                >
                  Clear filters
                </Button>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="grid" value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "map")} className="mb-6">
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-cols-2 w-[300px]">
              <TabsTrigger value="grid" className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>
            <div className="text-sm bg-secondary px-3 py-1 rounded-full text-muted-foreground">
              {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? "s" : ""} found
            </div>
          </div>

          <TabsContent value="grid" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAlerts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlerts.map((alert) => (
                  <AlertCard 
                    key={alert.id} 
                    alert={alert as any} 
                    onClick={() => handleAlertClick(alert.id)} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl shadow p-8">
                <p className="text-muted-foreground">
                  No alerts found. Try adjusting your filters or search term.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Map 
                alerts={filteredAlerts} 
                onMarkerClick={handleAlertClick}
                searchTerm={searchTerm}
                highlightedAlertId={highlightedAlertId}
                center={mapCenter}
                zoom={mapZoom}
              />
            )}
          </TabsContent>
        </Tabs>

        <AIChatbot />
      </div>
    </div>
  );
};

const getCategoryBadgeClass = (category: AlertCategory) => {
  switch (category) {
    case "fire":
      return "bg-alert-fire text-white hover:bg-alert-fire/90";
    case "crime":
      return "bg-alert-crime text-white hover:bg-alert-crime/90";
    case "accident":
      return "bg-alert-accident text-white hover:bg-alert-accident/90";
    case "weather":
      return "bg-alert-weather text-white hover:bg-alert-weather/90";
    default:
      return "bg-alert-other text-white hover:bg-alert-other/90";
  }
};

export default Home;
