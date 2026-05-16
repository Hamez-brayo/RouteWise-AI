import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { RouteData } from '../types';

interface RouteRendererProps {
  routes: RouteData[];
  selectedRouteId: string | null;
  onRouteClick?: (id: string) => void;
}

export const RouteRenderer = ({ routes, selectedRouteId, onRouteClick }: RouteRendererProps) => {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const markerLib = useMapsLibrary('marker');
  const [elements, setElements] = useState<any[]>([]);

  useEffect(() => {
    if (!map || !mapsLib || !markerLib || !routes.length) return;

    // Clear existing elements
    elements.forEach(el => el.setMap(null));
    const newElements: any[] = [];

    const bounds = new google.maps.LatLngBounds();
    const selectedRoute = routes.find(r => r.id === selectedRouteId) || routes[0];

    routes.forEach(route => {
      const path = google.maps.geometry.encoding.decodePath(route.polyline);
      const isSelected = route.id === selectedRouteId;
      
      // High-visibility blue hierarchy
      let strokeColor = '#3b82f6'; // Default: Blue 500
      let strokeOpacity = 0.5;
      let strokeWeight = 5;
      let zIndex = 10;

      if (route.isRecommended) {
        strokeColor = '#2563eb'; // Blue 600
        strokeOpacity = 0.7;
        zIndex = 20;
      }

      if (isSelected) {
        strokeColor = '#1d4ed8'; // Blue 700 (Strong Primary Blue)
        strokeOpacity = 1.0;
        strokeWeight = 8;
        zIndex = 100;
      }

      const polyline = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: strokeColor,
        strokeOpacity: strokeOpacity,
        strokeWeight: strokeWeight,
        zIndex: zIndex,
        map: map
      });

      path.forEach(p => bounds.extend(p));

      polyline.addListener('click', () => {
        if (onRouteClick) onRouteClick(route.id);
      });

      newElements.push(polyline);
    });

    // Add Start and End Pins with inline styles for guaranteed rendering
    if (selectedRoute) {
      const path = google.maps.geometry.encoding.decodePath(selectedRoute.polyline);
      if (path.length > 0) {
        const startPos = path[0];
        const endPos = path[path.length - 1];

        // Start Pin (White with Blue core)
        const startMarker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: startPos,
          title: 'Start',
          content: (() => {
            const div = document.createElement('div');
            div.style.cssText = 'width: 24px; height: 24px; background: white; border: 3px solid #1d4ed8; border-radius: 50%; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;';
            div.innerHTML = '<div style="width: 8px; height: 8px; background: #1d4ed8; border-radius: 50%;"></div>';
            return div;
          })()
        });

        // Destination Pin (Blue with White core)
        const endMarker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: endPos,
          title: 'Destination',
          content: (() => {
            const div = document.createElement('div');
            div.style.cssText = 'width: 28px; height: 28px; background: #1d4ed8; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;';
            div.innerHTML = '<div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>';
            return div;
          })()
        });

        newElements.push(startMarker, endMarker);
      }
    }

    setElements(newElements);

    if (routes.length > 0) {
      map.fitBounds(bounds, { top: 100, bottom: 100, left: 100, right: 100 });
    }

    return () => {
      newElements.forEach(el => el.setMap(null));
    };
  }, [map, mapsLib, markerLib, routes, selectedRouteId]);

  return null;
};
