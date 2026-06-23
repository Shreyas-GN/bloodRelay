import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MarkerProps {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  type?: 'donor' | 'hospital';
}

interface MapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MarkerProps[];
  routeGeometry?: any;
  className?: string;
}

const Map: React.FC<MapProps> = ({
  center = [77.5946, 12.9716], // Default to Bangalore lng, lat
  zoom = 12,
  markers = [],
  routeGeometry = null,
  className = "h-full w-full rounded-xl overflow-hidden shadow-lg border border-white/10"
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markerObjects = useRef<{ [key: string]: maplibregl.Marker }>({});

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update center and zoom if they change
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({ center, zoom });
  }, [center, zoom]);

  // Handle Markers
  useEffect(() => {
    if (!map.current) return;

    // Remove old markers that aren't in the new list
    const newMarkerIds = new Set(markers.map(m => m.id));
    Object.keys(markerObjects.current).forEach(id => {
      if (!newMarkerIds.has(id)) {
        markerObjects.current[id].remove();
        delete markerObjects.current[id];
      }
    });

    // Add or update markers
    markers.forEach(m => {
      if (markerObjects.current[m.id]) {
        markerObjects.current[m.id].setLngLat([m.lng, m.lat]);
      } else {
        const el = document.createElement('div');
        el.className = `w-6 h-6 rounded-full border-2 border-white shadow-md ${
          m.type === 'hospital' ? 'bg-red-500' : 'bg-blue-500'
        }`;
        
        const marker = new maplibregl.Marker(el)
          .setLngLat([m.lng, m.lat])
          .addTo(map.current!);
          
        if (m.label) {
          const popup = new maplibregl.Popup({ offset: 25 })
            .setText(m.label);
          marker.setPopup(popup);
        }
        
        markerObjects.current[m.id] = marker;
      }
    });
  }, [markers]);

  // Handle Route Geometry
  useEffect(() => {
    if (!map.current) return;

    const sourceId = 'route-source';
    const layerId = 'route-layer';

    const updateRoute = () => {
      if (!map.current) return;

      if (map.current.getLayer(layerId)) map.current.removeLayer(layerId);
      if (map.current.getSource(sourceId)) map.current.removeSource(sourceId);

      if (routeGeometry) {
        map.current.addSource(sourceId, {
          type: 'geojson',
          data: routeGeometry
        });

        map.current.addLayer({
          id: layerId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 5,
            'line-opacity': 0.75
          }
        });

        // Fit bounds to route
        const coordinates = routeGeometry.coordinates;
        if (coordinates.length > 0) {
          const bounds = coordinates.reduce((acc: maplibregl.LngLatBounds, coord: [number, number]) => {
            return acc.extend(coord);
          }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
          
          map.current.fitBounds(bounds, { padding: 50 });
        }
      }
    };

    if (map.current.isStyleLoaded()) {
      updateRoute();
    } else {
      map.current.once('style.load', updateRoute);
    }
  }, [routeGeometry]);

  return (
    <div className={`p-1.5 rounded-[var(--radius-card)] backdrop-blur-md shadow-[var(--shadow-clay-hard)] border border-[var(--color-base-200)] ${className}`}>
      <div
        ref={mapContainer}
        className="w-full h-full rounded-[calc(var(--radius-card)-0.375rem)] overflow-hidden bg-[var(--color-base-100)]"
      />
    </div>
  );
};

export default Map;
