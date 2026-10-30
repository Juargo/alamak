import { describe, expect, it } from "vitest";
import { preselectRegion } from "./region-preselection";

describe("preselectRegion", () => {
  it("#4 CA-3: preselects the region of the visitor's country", () => {
    expect(preselectRegion({ country: "CL", acceptLanguage: null })).toBe("LAS");
    expect(preselectRegion({ country: "AR", acceptLanguage: null })).toBe("LAS");
    expect(preselectRegion({ country: "MX", acceptLanguage: null })).toBe("LAN");
    expect(preselectRegion({ country: "CO", acceptLanguage: null })).toBe("LAN");
    expect(preselectRegion({ country: "ES", acceptLanguage: null })).toBe("EUW");
  });

  it("#4 CA-3: falls back to the browser language when the country is unknown", () => {
    expect(preselectRegion({ country: null, acceptLanguage: "es-MX,es;q=0.9" })).toBe("LAN");
    expect(preselectRegion({ country: null, acceptLanguage: "es-ES,en;q=0.5" })).toBe("EUW");
    expect(preselectRegion({ country: "", acceptLanguage: "es-cl" })).toBe("LAS");
  });

  it("#4 CA-3: defaults to LAS when nothing identifies the region", () => {
    expect(preselectRegion({ country: null, acceptLanguage: null })).toBe("LAS");
    expect(preselectRegion({ country: "JP", acceptLanguage: "ja" })).toBe("LAS");
    expect(preselectRegion({ country: null, acceptLanguage: "es" })).toBe("LAS");
  });
});
