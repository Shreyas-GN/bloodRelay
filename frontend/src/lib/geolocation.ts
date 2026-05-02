/**
 * Retrieves the current browser geolocation.
 */
export const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        }
    });
};

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula. Returns distance in meters.
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const p1 = lat1 * Math.PI / 180; // φ, λ in radians
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
};

/**
 * Formats a distance in meters to a human-readable string (km).
 */
export const formatDistance = (meters: number | null | undefined): string => {
    if (meters == null) return "Unknown distance";
    const km = meters / 1000;
    return km < 1 ? `${Math.round(meters)} m away` : `${km.toFixed(1)} km away`;
};

/**
 * Very rough ETA estimation based on distance (assuming ~30km/h average city speed).
 * 30 km/h = 500 meters per minute.
 */
export const estimateETA = (meters: number | null | undefined): number | null => {
    if (meters == null) return null;
    const minutes = Math.ceil(meters / 500);
    return minutes < 1 ? 1 : minutes;
};
