/**
 * Pure geo math — no DB. PostGIS / external geocoder integrations stay out of here.
 */
export class GeoService {
  private toRadians(degree: number): number {
    return (degree * Math.PI) / 180;
  }

  haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const earthRadiusKm = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * earthRadiusKm * Math.asin(Math.sqrt(a));
  }

  isWithinRadiusKm(
    centerLat: number,
    centerLng: number,
    pointLat: number,
    pointLng: number,
    radiusKm: number
  ): boolean {
    return this.haversineKm(centerLat, centerLng, pointLat, pointLng) <= radiusKm;
  }
}
