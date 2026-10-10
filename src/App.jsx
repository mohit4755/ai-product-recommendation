import { useMemo, useState } from "react";
import products from "../catalog/products.json";

const CATEGORIES = ["All products", ...new Set(products.map(p => p.category))];
const IDEAS = ["Gaming phone under $500", "Lightweight laptop for college under $750", "Noise-cancelling headphones for travel", "Tablet for drawing and note taking"];
const money = amount => "$" + amount.toLocaleString("en-US");

function ProductImage({ product, featured = false }) {
  return <div className={"art art-" + product.color + (featured ? " featured-art" : "")} aria-label={product.category + " illustration"} role="img">
    <div className="ring outer-ring"></div><div className="ring inner-ring"></div>
    <span className="art-emoji">{product.emoji}</span>
  </div>;
}

function ProductCard({ product, reason }) {
  return <article className={"product-card" + (reason ? " product-match" : "")}>
    <div className="image-wrap"><ProductImage product={product} /><span className="tag">{reason ? "✦ AI MATCH" : product.tag}</span></div>
    <div className="card-body"><span className="category-label">{product.category}</span>
      <div className="card-title"><h3>{product.name}</h3><strong>{money(product.price)}</strong></div>
      <p>{product.description}</p>
      <div className="features">{product.features.map(feature => <span key={feature}>{feature}</span>)}</div>
      {reason && <div className="reason"><span>✦</span> {reason}</div>}
    </div>
  </article>;
}

export default function App() {
  const [preference, setPreference] = useState("");
  const [category, setCategory] = useState("All products");
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState(null);
  const [matchesOnly, setMatchesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reasons = useMemo(() => new Map((response?.recommendations || []).map(item => [item.product.id, item.reason])), [response]);
  const visible = useMemo(() => {
    const matched = matchesOnly && response ? products.filter(p => reasons.has(p.id)) : products;
    const filtered = matched.filter(p =>
      (category === "All products" || p.category === category) &&
      (p.name + " " + p.description + " " + p.features.join(" ")).toLowerCase().includes(query.toLowerCase().trim())
    );
    if (matchesOnly && response) filtered.sort((a, b) =>
      response.recommendations.findIndex(x => x.product.id === a.id) -
      response.recommendations.findIndex(x => x.product.id === b.id));
    return filtered;
  }, [category, query, matchesOnly, response, reasons]);

  async function findMatches(event) {
    event.preventDefault();
    if (loading) return;
    const text = preference.trim();
    if (text.length < 8) { setError("Please describe your needs in at least 8 characters."); return; }
    setLoading(true); setError(""); setResponse(null); setMatchesOnly(false); setCategory("All products"); setQuery("");
    try {
      const res = await fetch("/api/recommend", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({preference:text})});
      const data = await res.json().catch(() => null);
      if (!res.ok) throw Error(typeof data?.detail === "string" ? data.detail : "Recommendation service unavailable.");
      if (!Array.isArray(data?.recommendations)) throw Error("Unexpected AI response. Please try again.");
      setResponse(data); setMatchesOnly(true);
    } catch (err) { setError(err.message || "Couldn't get recommendations."); }
    finally { setLoading(false); }
  }

  function showAll() {setMatchesOnly(false);setCategory("All products");setQuery("");}

  return <div className="site">
    <header className="header"><div className="container header-content"><a className="brand" href="#home"><span className="brand-mark">✦</span> pickwise<span className="brand-period">.</span></a><nav><a href="#products">Explore products</a><a href="#assistant">How it works</a></nav><span className="live-pill"><span className="live-dot"/> AI-powered shopping assistant</span></div></header>
    <main id="home">
      <section className="hero container"><div className="hero-copy"><div className="eyebrow">— SMARTER CHOICES, LESS SCROLLING</div>
      <h1>Find your next favorite thing <em>effortlessly.</em></h1>
      <p>Skip the endless comparisons. Tell our AI what matters to you and discover products that actually fit your needs.</p>
      <div className="benefits"><span>✓ Personalized picks</span><span>✓ Budget-aware</span><span>✓ No guesswork</span></div></div>
      <div className="hero-image"><div className="feature-label">✦ &nbsp; CURATED FOR YOU</div><ProductImage product={products[1]} featured/><div className="feature-bottom"><div><small>THE SMARTER WAY TO SHOP</small><strong>Good finds, made simple.</strong></div><span className="round-arrow">↗</span></div></div>
      </section>
      <section className="assistant" id="assistant"><div className="container assistant-container">
        <div className="assistant-heading"><span className="sparkle-icon">✦</span><div><div className="small-label">YOUR PERSONAL SHOPPING ASSISTANT</div><h2>What are you looking for?</h2><p>Be as specific as you like — budget, features, or how you plan to use it.</p></div></div>
        <form className="preference-form" onSubmit={findMatches}>
          <label className="sr-only" htmlFor="preference">Describe your ideal product</label>
          <textarea id="preference" value={preference} maxLength={500} disabled={loading} rows={3} onChange={e=>{setPreference(e.target.value);setError("");}} placeholder="e.g. I need a gaming phone under $500 with great battery life..."/>
          <div className="form-actions"><span>✦ Describe your ideal product in your own words</span><button className="primary-btn" disabled={!preference.trim() || loading} type="submit">{loading ? "Finding matches..." : "Find my matches ↗"}</button></div>
        </form>
        <div className="suggestions"><strong>TRY AN EXAMPLE</strong><div>{IDEAS.map(idea=><button type="button" disabled={loading} key={idea} onClick={()=>{setPreference(idea);setError("");}}>{idea} ↗</button>)}</div></div>
        {loading && <div className="message info" role="status">✦ Gemini is comparing your preferences with the catalog...</div>}
        {error && <div className="message warning" role="alert">⚠ {error} <button aria-label="Dismiss error" onClick={()=>setError("")}>×</button></div>}
        {response && !loading && <div className="result-notice"><span className="sparkle-icon">✦</span><div><small>YOUR AI SHOPPING SHORTLIST</small><h3>{response.recommendations.length} recommended product{response.recommendations.length === 1 ? "" : "s"}</h3><p>{response.summary}</p></div><button type="button" onClick={showAll}>See all products ↗</button></div>}
      </div></section>
      <section className="catalog container" id="products">
        <div className="catalog-header"><div><span className="small-label">DISCOVER SOMETHING GREAT</span><h2>{matchesOnly && response ? "Made for you." : "Explore the collection."}</h2><p>{matchesOnly && response ? "Recommended for your needs, from our demo catalog." : "Thoughtfully selected tech for every kind of day."}</p></div><span className="count">{visible.length} product{visible.length === 1 ? "" : "s"} ↗</span></div>
        <div className="filters"><div className="tabs">{CATEGORIES.map(c=><button key={c} className={c === category ? "selected" : ""} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="filter-right"><label className="search"><span>⌕</span><input aria-label="Search products" placeholder="Search products" value={query} onChange={e=>setQuery(e.target.value)}/></label>{response && <button type="button" className="toggle" onClick={()=>{setMatchesOnly(!matchesOnly);setCategory("All products");setQuery("");}}>{matchesOnly ? "Show all" : "Only AI matches"}</button>}</div></div>
        {visible.length ? <div className="grid">{visible.map(product=><ProductCard key={product.id} product={product} reason={matchesOnly ? reasons.get(product.id) : ""}/>)}</div> : <div className="empty"><h3>No products match these filters.</h3><p>Try broadening your search or exploring the full catalog.</p><button onClick={showAll}>View all products</button></div>}
        <div className="disclaimer">ⓘ &nbsp; Demo catalog: product names, prices and specifications are fictional sample data, not real-time listings. AI recommendations are restricted to these products.</div>
      </section>
    </main>
    <footer className="footer"><div className="container"><b>✦ pickwise.</b><span>Thoughtful tech. Smarter choices.</span><span>Built with React + Python + Gemini AI</span></div></footer>
  </div>;
}
