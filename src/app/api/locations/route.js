// Place this file at: app/api/locations/route.js
//
// This import stays server-side only (API routes run on the server, never
// bundled to the client), so the full 60KB JSON never reaches the browser.
import bdLocations from "@/data/bd-locations.json";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const district = searchParams.get("district");
  const upazila = searchParams.get("upazila");

  // district + upazila given -> return the union list for that upazila
  if (district && upazila) {
    const unions = bdLocations[district]?.[upazila] || [];
    return Response.json({ unions });
  }

  // only district given -> return that district's upazila names
  if (district) {
    const districtData = bdLocations[district];
    if (!districtData) {
      return Response.json({ error: "District not found" }, { status: 404 });
    }
    return Response.json({ upazilas: Object.keys(districtData).sort() });
  }

  // nothing given -> return just the district name list (smallest payload,
  // this is what loads on initial page render)
  return Response.json({ districts: Object.keys(bdLocations).sort() });
}
