import React, { useEffect, useState } from "react";
import { randomQuote } from "./quotes";

const US_STATES = [
  { value: "", label: "Any state" },
  { value: "AL", label: "Alabama" }, { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" }, { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" }, { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" }, { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" }, { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" }, { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" }, { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" }, { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" }, { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" }, { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" }, { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" }, { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" }, { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" }, { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" }, { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" }, { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" }, { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" }, { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" }, { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" }, { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" }, { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" }, { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" }, { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" }, { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" }, { value: "WY", label: "Wyoming" },
];

const BODY_TYPES = [
  { value: "", label: "Any type — show me everything" },
  { value: "sedan", label: "Sedan — everyday commuter, great gas mileage" },
  { value: "suv", label: "SUV — family hauling & extra cargo room" },
  { value: "truck", label: "Truck — towing, hauling, and off-road work" },
  { value: "coupe", label: "Coupe — sporty two-door styling" },
  { value: "hatchback", label: "Hatchback — compact, efficient, easy to park" },
  { value: "convertible", label: "Convertible — open-air cruiser" },
  { value: "minivan", label: "Minivan — maximum passenger & cargo space" },
  { value: "electric hybrid", label: "Electric / Hybrid — eco-friendly & low fuel cost" },
];

const MARKETPLACES = [
  { key: "facebook", label: "Facebook Marketplace" },
  { key: "enterprise", label: "Enterprise Car Sales" },
  { key: "cargurus", label: "CarGurus" },
  { key: "autotrader", label: "AutoTrader" },
];

export default function App() {
  const [quote] = useState(randomQuote());
  const [form, setForm] = useState({
    make: "",
    model: "",
    cargurusMakeId: "",
    cargurusModelId: "",
    yearMin: "",
    yearMax: "",
    priceMin: "",
    priceMax: "",
    zip: "",
    state: "",
    radius: "50",
    mileageMin: "",
    mileageMax: "",
    bodyType: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [makesError, setMakesError] = useState(false);

  useEffect(() => {
    fetch("/api/cargurus/makes")
      .then((res) => res.json())
      .then((data) => setMakes(data.makes || []))
      .catch(() => setMakesError(true));
  }, []);

  useEffect(() => {
    if (!form.cargurusMakeId) {
      setModels([]);
      return;
    }
    fetch(`/api/cargurus/models?makeId=${form.cargurusMakeId}`)
      .then((res) => res.json())
      .then((data) => setModels(data.models || []))
      .catch(() => setModels([]));
  }, [form.cargurusMakeId]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleMakeChange(e) {
    const selectedId = e.target.value;
    const selectedMake = makes.find((m) => m.id === selectedId);
    setForm((f) => ({
      ...f,
      cargurusMakeId: selectedId,
      make: selectedMake ? selectedMake.name : "",
      cargurusModelId: "",
      model: "",
    }));
  }

  function handleModelChange(e) {
    const selectedId = e.target.value;
    const selectedModel = models.find((m) => m.id === selectedId);
    setForm((f) => ({
      ...f,
      cargurusModelId: selectedId,
      model: selectedModel ? selectedModel.name : "",
    }));
  }

  async function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const params = new URLSearchParams(form).toString();
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Could not reach the search service. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="quote">&ldquo;{quote}&rdquo;</p>
        <h1>Car Finder</h1>
        <p className="subtitle">
          Search local listings across the marketplaces you trust — one form, every site.
        </p>
      </header>

      <form className="search-card" onSubmit={handleSearch}>
        <div className="grid">
          <label>
            Make
            {makesError ? (
              <input
                placeholder="e.g. Toyota"
                value={form.make}
                onChange={(e) => update("make", e.target.value)}
              />
            ) : (
              <select value={form.cargurusMakeId} onChange={handleMakeChange}>
                <option value="">Any make</option>
                {makes.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label>
            Model
            {makesError ? (
              <input
                placeholder="e.g. Camry"
                value={form.model}
                onChange={(e) => update("model", e.target.value)}
              />
            ) : (
              <select
                value={form.cargurusModelId}
                onChange={handleModelChange}
                disabled={!form.cargurusMakeId}
              >
                <option value="">
                  {form.cargurusMakeId ? "Any model" : "Choose a make first"}
                </option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </label>
          <label>
            Year (min)
            <input
              type="number"
              placeholder="2015"
              value={form.yearMin}
              onChange={(e) => update("yearMin", e.target.value)}
            />
          </label>
          <label>
            Year (max)
            <input
              type="number"
              placeholder="2024"
              value={form.yearMax}
              onChange={(e) => update("yearMax", e.target.value)}
            />
          </label>
          <label>
            Price (min)
            <input
              type="number"
              placeholder="5000"
              value={form.priceMin}
              onChange={(e) => update("priceMin", e.target.value)}
            />
          </label>
          <label>
            Price (max)
            <input
              type="number"
              placeholder="20000"
              value={form.priceMax}
              onChange={(e) => update("priceMax", e.target.value)}
            />
          </label>
          <label>
            State
            <select value={form.state} onChange={(e) => update("state", e.target.value)}>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </label>
          <label>
            Distance from you (miles)
            <input
              type="number"
              placeholder="50"
              value={form.radius}
              onChange={(e) => update("radius", e.target.value)}
            />
          </label>
          <label>
            Mileage (min)
            <input
              type="number"
              placeholder="0"
              value={form.mileageMin}
              onChange={(e) => update("mileageMin", e.target.value)}
            />
          </label>
          <label>
            Mileage (max)
            <input
              type="number"
              placeholder="100000"
              value={form.mileageMax}
              onChange={(e) => update("mileageMax", e.target.value)}
            />
          </label>
          <label className="full-width">
            What kind of car are you looking for?
            <select
              value={form.bodyType}
              onChange={(e) => update("bodyType", e.target.value)}
            >
              {BODY_TYPES.map((bt) => (
                <option key={bt.value} value={bt.value}>
                  {bt.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Cars"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className="results">
          {result.featured && (
            <div className="featured-card">
              <span className="featured-label">Featured Search</span>
              <h3 className="featured-title">{result.featured.title}</h3>
              <p className="featured-meta">
                {[result.featured.yearRange, result.featured.priceRange, result.featured.bodyTypeLabel]
                  .filter(Boolean)
                  .join(" · ") || "All years · All prices · Any type"}
              </p>
              <p className="featured-subtext">
                See every matching listing at this price across all 4 sites:
              </p>
              <div className="marketplace-row">
                {MARKETPLACES.map((m) => (
                  <a
                    key={m.key}
                    className="marketplace-btn"
                    href={result.featured.links[m.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {m.label}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="fb-tip">
            <span className="fb-tip-icon">⚠️</span>
            <span>
              <strong>Before clicking Facebook Marketplace:</strong> make sure you're already logged into Facebook in another tab.
              If you click it while logged out, Facebook will drop your search after login.{" "}
              <a href="https://www.facebook.com/login" target="_blank" rel="noopener noreferrer" className="fb-login-link">
                Log into Facebook first →
              </a>
            </span>
          </div>

          <h2>Jump straight to a marketplace</h2>
          <div className="marketplace-row">
            {MARKETPLACES.map((m) => (
              <a
                key={m.key}
                className="marketplace-btn"
                href={result.links[m.key]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m.label}
              </a>
            ))}
          </div>
          <p className="note">
            <strong>CarGurus & AutoTrader:</strong> open with your filters pre-applied. &nbsp;
            <strong>Enterprise:</strong> search manually once it opens — their site doesn't support pre-filled links.
          </p>
          {result.notes?.aggregationStatus && (
            <p className="note">{result.notes.aggregationStatus}</p>
          )}

          {result.aggregated.length > 0 && (
            <>
              <h2>Listings found</h2>
              <div className="listing-grid">
                {result.aggregated.map((listing, i) => (
                  <a
                    key={i}
                    className="listing-card"
                    href={listing.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {listing.image && (
                      <img className="listing-image" src={listing.image} alt={listing.title} />
                    )}
                    <span className="listing-source">{listing.source}</span>
                    <span className="listing-title">{listing.title}</span>
                    <span className="listing-price">{listing.price}</span>
                    {listing.mileage && (
                      <span className="listing-mileage">{listing.mileage}</span>
                    )}
                  </a>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
