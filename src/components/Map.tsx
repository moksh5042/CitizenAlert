import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertCircle, Flame, ShieldAlert, Car, Cloud, HelpCircle } from "lucide-react";
import { renderToString } from "react-dom/server";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix default Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

export interface Alert {
  id: string;
  title: string;
  description?: string;
  category: "fire" | "crime" | "accident" | "weather" | "other";
  location: {
    lat?: number;
    lng?: number;
    address: string;
  };
  imageUrl?: string;
  createdAt?: any;
  createdBy?: any;
}

interface MapProps {
  alerts: Alert[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (alertId: string) => void;
  searchTerm?: string;
  highlightedAlertId?: string;
}

// 🔄 Geocoding Function
const getCoordinatesFromAddress = async (address: string): Promise<{ lat: number; lng: number }> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
  );
  const data = await response.json();
  if (data.length > 0) {
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    };
  } else {
    throw new Error("Address not found");
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "fire": return <Flame className="h-full w-full text-white" />;
    case "crime": return <ShieldAlert className="h-full w-full text-white" />;
    case "accident": return <Car className="h-full w-full text-white" />;
    case "weather": return <Cloud className="h-full w-full text-white" />;
    default: return <HelpCircle className="h-full w-full text-white" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "fire": return "bg-alert-fire";
    case "crime": return "bg-alert-crime";
    case "accident": return "bg-alert-accident";
    case "weather": return "bg-alert-weather";
    default: return "bg-alert-other";
  }
};

const Map: React.FC<MapProps> = ({
  alerts,
  center = [39.8283, -98.5795],
  zoom = 4,
  onMarkerClick,
  searchTerm = "",
  highlightedAlertId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(center);
  const [currentZoom, setCurrentZoom] = useState<number>(zoom);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setView(center, zoom);
    setCurrentCenter(center);
    setCurrentZoom(zoom);
  }, [center, zoom]);

  useEffect(() => {
    if (!highlightedAlertId || !mapInstance.current) return;
    const highlightedAlert = alerts.find(alert => alert.id === highlightedAlertId);
    if (highlightedAlert) {
      const marker = markersRef.current[highlightedAlertId];
      if (highlightedAlert.location.lat && highlightedAlert.location.lng) {
        mapInstance.current.setView(
          [highlightedAlert.location.lat, highlightedAlert.location.lng],
          12
        );
        if (marker) marker.openPopup();
      }
    }
  }, [highlightedAlertId, alerts]);

  useEffect(() => {
    if (!searchTerm || !mapInstance.current) return;

    const matchingAlerts = alerts.filter(alert =>
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (alert.description && alert.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      alert.location.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchingAlerts.length > 0) {
      const bounds = L.latLngBounds(
        matchingAlerts
          .filter(alert => alert.location.lat && alert.location.lng)
          .map(alert => [alert.location.lat!, alert.location.lng!] as [number, number])
      );
      if (bounds.isValid()) {
        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [searchTerm, alerts]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(currentCenter, currentZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      mapInstance.current.on('moveend', () => {
        if (!mapInstance.current) return;
        const center = mapInstance.current.getCenter();
        setCurrentCenter([center.lat, center.lng]);
        setCurrentZoom(mapInstance.current.getZoom());
      });
    } else {
      mapInstance.current.setView(currentCenter, currentZoom);
    }

    const createCustomIcon = (category: string, isHighlighted: boolean) => {
      const size = isHighlighted ? '40px' : '32px';
      const html = renderToString(
        <div className={`flex items-center justify-center rounded-full ${getCategoryColor(category)}`}
             style={{ width: size, height: size, boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
          {getCategoryIcon(category)}
        </div>
      );
      return L.divIcon({
        html,
        className: "custom-marker-icon",
        iconSize: isHighlighted ? [40, 40] : [32, 32],
        iconAnchor: isHighlighted ? [20, 20] : [16, 16],
      });
    };

    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    alerts.forEach(async (alert) => {
      try {
        let lat = alert.location.lat;
        let lng = alert.location.lng;

        if (lat == null || lng == null) {
          const coords = await getCoordinatesFromAddress(alert.location.address);
          lat = coords.lat;
          lng = coords.lng;
        }

        const isHighlighted = alert.id === highlightedAlertId;
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(alert.category, isHighlighted)
        }).addTo(mapInstance.current!);

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-sm">${alert.title}</h3>
            <p class="text-xs mt-1">${alert.location.address}</p>
            ${alert.description ? `<p class="text-xs mt-1 text-gray-600">${alert.description}</p>` : ''}
          </div>
        `;
        marker.bindPopup(popupContent);
        if (onMarkerClick) marker.on('click', () => onMarkerClick(alert.id));
        markersRef.current[alert.id] = marker;
        if (isHighlighted) marker.openPopup();
      } catch (error) {
        console.error(`Failed to get coordinates for alert ${alert.id}`, error);
      }
    });

    return () => {
      Object.values(markersRef.current).forEach(marker => marker.remove());
      markersRef.current = {};
    };
  }, [alerts, currentCenter, currentZoom, highlightedAlertId, onMarkerClick]);

  return (
    <div className="map-container h-[600px] rounded-xl overflow-hidden border shadow-xl">
      <div ref={mapRef} className="h-full z-0"></div>
    </div>
  );
};

export default Map;
