import React, { useEffect } from "react";
import { useMap } from '@vis.gl/react-google-maps';

export default function ChangeMapViewportGoogle({ center, zoom }) {
    const map = useMap();

    useEffect(() => {
        if (map && center[0] !== undefined && center[1] !== undefined) {
            const targetLatLng = { lat: center[0], lng: center[1] };

            map.panTo(targetLatLng);
            map.setZoom(zoom);
        }
    }, [ center, zoom, map]);

    return null;
}