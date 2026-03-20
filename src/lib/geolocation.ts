/**
 * Fetches the current geographic location of the user.
 * 
 * @returns A promise that resolves to an object containing latitude and longitude,
 *          or rejects with an Error if geolocation fails or is not supported.
 */
export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                reject(new Error(error.message));
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
};
