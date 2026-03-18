import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// ─── Data ────────────────────────────────────────────────────────────────────

const CONCEPTS = [
  {
    icon: "🕷️",
    title: "Crawling",
    tagline: "Discovering the Web",
    explanation:
      "Web crawlers (bots/spiders) systematically browse the internet by following links from page to page, collecting content for indexing. Think of them as digital explorers mapping the web.",
    example:
      "Googlebot visits your website, reads its content, and follows every link to find new pages.",
    progress: 85,
    color: "cyan",
  },
  {
    icon: "🗂️",
    title: "Indexing",
    tagline: "Organizing Information",
    explanation:
      "After crawling, content is organized into a massive searchable database called an index. Like a book's index — it maps each word to the pages/documents it appears in.",
    example:
      "The word 'climate' might be indexed to 2 million documents, allowing instant lookup.",
    progress: 90,
    color: "purple",
  },
  {
    icon: "🔍",
    title: "Query Processing",
    tagline: "Understanding Intent",
    explanation:
      "When you search, the engine parses your query: tokenizes it, removes stop words, applies stemming, and interprets your intent before looking up results.",
    example:
      "'best pizza NYC' → tokens: [best, pizza, NYC] → searches for relevant indexed docs.",
    progress: 78,
    color: "cyan",
  },
  {
    icon: "📊",
    title: "Ranking Algorithms",
    tagline: "Sorting by Relevance",
    explanation:
      "Not all results are equal. Ranking algorithms score and sort documents by relevance using signals like keyword frequency, links, freshness, and user behavior.",
    example:
      "Google uses 200+ ranking signals. A Wikipedia article on 'Python' ranks higher than a blog post.",
    progress: 92,
    color: "purple",
  },
  {
    icon: "📐",
    title: "TF-IDF",
    tagline: "Word Importance Score",
    explanation:
      "Term Frequency–Inverse Document Frequency measures how important a word is. A word appearing in many documents is less useful; one rare word in few docs is more distinctive.",
    example:
      "'jaguar' in a car article scores high TF-IDF vs. 'car' which appears everywhere.",
    progress: 88,
    color: "cyan",
  },
  {
    icon: "🌐",
    title: "PageRank",
    tagline: "Link-Based Authority",
    explanation:
      "Google's original algorithm: pages linked to by many high-quality pages are more authoritative. Like academic citations — being cited by Nature journal carries more weight.",
    example:
      "A Wikipedia link to your site boosts your PageRank far more than a link from a new blog.",
    progress: 94,
    color: "purple",
  },
  {
    icon: "⚖️",
    title: "Precision & Recall",
    tagline: "Measuring Quality",
    explanation:
      "Precision = % of retrieved results that are relevant. Recall = % of all relevant docs that were retrieved. There's a tradeoff — maximizing one often hurts the other.",
    example:
      "A medical search engine prioritizes recall (don't miss any relevant results, even at precision cost).",
    progress: 82,
    color: "cyan",
  },
];

const DEMO_DOCS = [
  {
    id: 1,
    title: "Introduction to Web Crawling",
    snippet:
      "Web crawlers systematically browse the internet following hyperlinks to index content.",
    keywords: [
      "crawl",
      "crawler",
      "web",
      "spider",
      "bot",
      "index",
      "link",
      "browse",
    ],
  },
  {
    id: 2,
    title: "How Search Engines Index Pages",
    snippet:
      "Indexing maps terms to document locations enabling fast information retrieval.",
    keywords: [
      "index",
      "search",
      "engine",
      "term",
      "document",
      "retrieval",
      "fast",
    ],
  },
  {
    id: 3,
    title: "Understanding TF-IDF",
    snippet:
      "TF-IDF scores measure how important a term is to a document relative to a corpus.",
    keywords: [
      "tf",
      "idf",
      "tfidf",
      "term",
      "frequency",
      "document",
      "score",
      "weight",
      "corpus",
    ],
  },
  {
    id: 4,
    title: "PageRank Algorithm Explained",
    snippet:
      "PageRank assigns authority scores to web pages based on the quality of inbound links.",
    keywords: [
      "pagerank",
      "page",
      "rank",
      "authority",
      "link",
      "google",
      "algorithm",
      "web",
    ],
  },
  {
    id: 5,
    title: "Query Optimization Techniques",
    snippet:
      "Query processing involves parsing, stemming, and expanding terms to improve results.",
    keywords: [
      "query",
      "search",
      "process",
      "parse",
      "stem",
      "token",
      "optimize",
      "retrieval",
    ],
  },
  {
    id: 6,
    title: "Precision and Recall in IR",
    snippet:
      "Precision and recall are fundamental metrics for evaluating information retrieval systems.",
    keywords: [
      "precision",
      "recall",
      "metric",
      "evaluate",
      "relevant",
      "retrieval",
      "measure",
      "f1",
    ],
  },
  {
    id: 7,
    title: "Boolean Retrieval Model",
    snippet:
      "Boolean retrieval uses AND, OR, NOT operators to match documents to structured queries.",
    keywords: [
      "boolean",
      "retrieval",
      "and",
      "or",
      "not",
      "query",
      "model",
      "match",
    ],
  },
  {
    id: 8,
    title: "Vector Space Model",
    snippet:
      "Documents and queries are represented as vectors; cosine similarity measures relevance.",
    keywords: [
      "vector",
      "space",
      "model",
      "cosine",
      "similarity",
      "document",
      "query",
      "represent",
    ],
  },
  {
    id: 9,
    title: "Natural Language Processing in Search",
    snippet:
      "NLP techniques like NER, POS tagging and semantic parsing improve search understanding.",
    keywords: [
      "nlp",
      "natural",
      "language",
      "processing",
      "semantic",
      "search",
      "understand",
      "parse",
    ],
  },
  {
    id: 10,
    title: "Machine Learning for Ranking",
    snippet:
      "Learning to rank models use ML to train ranking functions from labeled query-document pairs.",
    keywords: [
      "machine",
      "learning",
      "rank",
      "ranking",
      "ml",
      "model",
      "train",
      "query",
      "neural",
    ],
  },
];

function searchDocs(query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return DEMO_DOCS.map((doc) => {
    let score = 0;
    const allText = `${doc.title} ${doc.snippet}`.toLowerCase();
    for (const t of terms) {
      // TF-like: count occurrences in title (weight 3) and snippet (weight 1)
      const titleCount = (
        doc.title.toLowerCase().match(new RegExp(t, "g")) || []
      ).length;
      const snippetCount = (
        doc.snippet.toLowerCase().match(new RegExp(t, "g")) || []
      ).length;
      const kwMatch = doc.keywords.some((k) => k.includes(t) || t.includes(k))
        ? 2
        : 0;
      score += titleCount * 3 + snippetCount * 1 + kwMatch;
      // IDF-like boost: rare term → not in allText of many docs
      if (allText.includes(t)) score += 1;
    }
    const tfIdfScore = Math.min(99, Math.round(score * 9 + Math.random() * 5));
    return { ...doc, score: tfIdfScore };
  })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

// ─── Three.js Hero Scene ──────────────────────────────────────────────────────

function HeroCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const W = el.clientWidth;
    const H = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
    camera.position.z = 5;

    // Nodes
    const nodeCount = 60;
    const positions: THREE.Vector3[] = [];
    const nodeGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const nodeGroup = new THREE.Group();

    for (let i = 0; i < nodeCount; i++) {
      const v = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
      );
      positions.push(v);
      const color = i % 3 === 0 ? 0xb35cff : i % 3 === 1 ? 0x37e6e0 : 0x2fe3ff;
      const m = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(nodeGeo, m);
      mesh.position.copy(v);
      nodeGroup.add(mesh);
    }
    scene.add(nodeGroup);

    // Edges
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x37e6e0,
      transparent: true,
      opacity: 0.18,
    });
    const edgeGroup = new THREE.Group();
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (positions[i].distanceTo(positions[j]) < 2.5) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            positions[i],
            positions[j],
          ]);
          edgeGroup.add(new THREE.Line(geo, edgeMat));
        }
      }
    }
    scene.add(edgeGroup);

    // Particles
    const pCount = 600;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 20;
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x37e6e0,
      size: 0.03,
      transparent: true,
      opacity: 0.5,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    let frame = 0;
    const animate = () => {
      frame++;
      const t = frame * 0.005;
      nodeGroup.rotation.y = t * 0.3;
      edgeGroup.rotation.y = t * 0.3;
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    let rafId = requestAnimationFrame(animate);

    const onResize = () => {
      const nW = el.clientWidth;
      const nH = el.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", minHeight: 400 }}
    />
  );
}

// ─── Network Graph Canvas ─────────────────────────────────────────────────────

function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const W = canvas.width;
    const H = canvas.height;

    const nodes = [
      {
        id: 0,
        label: "Query",
        x: W / 2,
        y: H / 2,
        r: 16,
        color: "#37E6E0",
        type: "query",
      },
      {
        id: 1,
        label: "Doc A",
        x: W * 0.2,
        y: H * 0.25,
        r: 10,
        color: "#B35CFF",
        type: "doc",
      },
      {
        id: 2,
        label: "Doc B",
        x: W * 0.75,
        y: H * 0.2,
        r: 10,
        color: "#B35CFF",
        type: "doc",
      },
      {
        id: 3,
        label: "Doc C",
        x: W * 0.15,
        y: H * 0.65,
        r: 10,
        color: "#B35CFF",
        type: "doc",
      },
      {
        id: 4,
        label: "Doc D",
        x: W * 0.8,
        y: H * 0.7,
        r: 10,
        color: "#B35CFF",
        type: "doc",
      },
      {
        id: 5,
        label: "Doc E",
        x: W * 0.5,
        y: H * 0.85,
        r: 10,
        color: "#8A4DFF",
        type: "doc",
      },
      {
        id: 6,
        label: "Index",
        x: W * 0.38,
        y: H * 0.32,
        r: 13,
        color: "#2FE3FF",
        type: "index",
      },
      {
        id: 7,
        label: "Index",
        x: W * 0.62,
        y: H * 0.4,
        r: 13,
        color: "#2FE3FF",
        type: "index",
      },
    ];
    const edges = [
      [0, 6],
      [0, 7],
      [6, 1],
      [6, 3],
      [7, 2],
      [7, 4],
      [6, 7],
      [5, 6],
      [5, 7],
    ];

    let t = 0;
    let rafId: number;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      t += 0.015;

      // Draw edges with animated dash
      for (const [a, b] of edges) {
        const na = nodes[a];
        const nb = nodes[b];
        ctx.save();
        ctx.setLineDash([6, 10]);
        ctx.lineDashOffset = -t * 12;
        const isQueryEdge = a === 0 || b === 0;
        ctx.strokeStyle = isQueryEdge
          ? "rgba(55,230,224,0.55)"
          : "rgba(179,92,255,0.35)";
        ctx.lineWidth = isQueryEdge ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.stroke();
        ctx.restore();
      }

      // Draw nodes
      nodes.forEach((n, i) => {
        const pulse = n.type === "query" ? Math.sin(t * 2) * 4 : 0;
        const r = n.r + pulse;

        // Glow
        const grad = ctx.createRadialGradient(
          n.x,
          n.y,
          r * 0.2,
          n.x,
          n.y,
          r * 2.5,
        );
        grad.addColorStop(0, `${n.color}99`);
        grad.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}33`;
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = i === 0 ? "#37E6E0" : "#A7B3C7";
        ctx.font = `bold ${n.type === "query" ? 11 : 9}px Space Grotesk, sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + r + 14);
      });

      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="network-canvas"
      style={{ width: "100%", height: "100%", minHeight: 320 }}
    />
  );
}

// ─── Particle Background ──────────────────────────────────────────────────────

function ParticleBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(55,230,224,${p.opacity})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(draw);
    };
    draw();

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} id="particle-canvas" />;
}

// ─── Loading Screen ───────────────────────────────────────────────────────────

function LoadingScreen({ hidden }: { hidden: boolean }) {
  return (
    <div className={`loading-screen${hidden ? " hidden" : ""}`}>
      <div
        style={{
          position: "relative",
          width: 120,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="loading-ring-outer" style={{ position: "absolute" }} />
        <div className="loading-ring" />
        <span style={{ position: "absolute", fontSize: 28 }}>🔍</span>
      </div>
      <p
        style={{
          marginTop: 28,
          color: "var(--cyan)",
          fontWeight: 600,
          fontSize: 16,
          letterSpacing: "0.1em",
        }}
      >
        LOADING IR SYSTEM
      </p>
      <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 13 }}>
        Initializing knowledge graph...
      </p>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(6,10,18,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(55,230,224,0.1)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--cyan), var(--purple))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              boxShadow: "0 0 16px rgba(55,230,224,0.4)",
            }}
          >
            🔍
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: "var(--text-primary)",
            }}
          >
            IR <span style={{ color: "var(--cyan)" }}>Explorer</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div
          style={{ display: "flex", gap: 32, alignItems: "center" }}
          className="nav-desktop"
        >
          {[
            ["Home", "hero"],
            ["Concepts", "concepts"],
            ["Visualization", "viz"],
            ["Demo", "demo"],
            ["Team", "contributors"],
          ].map(([label, id]) => (
            <button
              type="button"
              key={id}
              className="nav-link"
              onClick={() => scrollTo(id)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "none",
            border: "none",
            color: "var(--cyan)",
            fontSize: 22,
            cursor: "pointer",
            display: "none",
          }}
          className="menu-btn"
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          style={{
            background: "rgba(6,10,18,0.97)",
            borderTop: "1px solid rgba(55,230,224,0.1)",
            padding: "16px 24px",
          }}
        >
          {[
            ["Home", "hero"],
            ["Concepts", "concepts"],
            ["Visualization", "viz"],
            ["Demo", "demo"],
            ["Team", "contributors"],
          ].map(([label, id]) => (
            <button
              type="button"
              key={id}
              className="nav-link"
              onClick={() => scrollTo(id)}
              style={{
                display: "block",
                padding: "10px 0",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                textAlign: "left",
                width: "100%",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ─── Concept Card ─────────────────────────────────────────────────────────────

function ConceptCard({ c, index }: { c: (typeof CONCEPTS)[0]; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setProgress(c.progress);
      },
      { threshold: 0.3 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [c.progress]);

  return (
    <button
      ref={ref}
      type="button"
      className={`concept-card reveal reveal-delay-${Math.min(index + 1, 7)}`}
      onClick={() => setExpanded((v) => !v)}
      style={{
        textAlign: "left",
        width: "100%",
        display: "block",
        background: "unset",
        padding: 0,
        font: "inherit",
        border: "none",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 14 }}>{c.icon}</div>
      <span className="tag" style={{ marginBottom: 10 }}>
        {c.tagline}
      </span>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 10,
          color: "var(--text-primary)",
        }}
      >
        {c.title}
      </h3>
      <p
        style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.65 }}
      >
        {c.explanation}
      </p>

      {expanded && (
        <div
          style={{
            marginTop: 14,
            padding: "12px 14px",
            background: "rgba(55,230,224,0.05)",
            borderRadius: 10,
            borderLeft: "2px solid var(--cyan)",
          }}
        >
          <p
            style={{
              fontSize: 12.5,
              color: "var(--cyan)",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            💡 Example
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            {c.example}
          </p>
        </div>
      )}

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Mastery Level
        </span>
        <span style={{ fontSize: 11, color: "var(--cyan)", fontWeight: 600 }}>
          {c.progress}%
        </span>
      </div>

      <div
        style={{
          marginTop: 14,
          display: "flex",
          alignItems: "center",
          gap: 6,
          color: "var(--cyan)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {expanded ? "▲ Less" : "▼ Learn More"}
      </div>
    </button>
  );
}

// ─── Search Demo ──────────────────────────────────────────────────────────────

const STEPS = [
  "🔤 Parsing query tokens...",
  "📚 Searching index...",
  "📊 Scoring with TF-IDF...",
  "🏆 Ranking results...",
];

function SearchDemo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    Array<(typeof DEMO_DOCS)[0] & { score: number }>
  >([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    setLoading(true);
    setSteps([]);
    setResults([]);
    setSearched(true);

    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setSteps((prev) => [...prev, step]);
        if (i === STEPS.length - 1) {
          setTimeout(() => {
            setResults(searchDocs(query) as typeof results);
            setLoading(false);
          }, 300);
        }
      }, i * 350);
    });
  }, [query]);

  return (
    <div className="glass" style={{ padding: 28, height: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ff5f56",
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ffbd2e",
          }}
        />
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#27c93f",
          }}
        />
        <span
          style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}
        >
          IR Simulator v1.0
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          className="search-input"
          style={{ flex: 1, padding: "10px 16px" }}
          placeholder="Try: pagerank, tfidf, crawling..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          type="button"
          className="btn-cyan"
          style={{ padding: "10px 22px" }}
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Steps */}
      {searched && (
        <div style={{ marginBottom: 16 }}>
          {steps.map((s, i) => (
            <div
              key={s}
              className="step-item"
              style={{
                animationDelay: `${i * 0.1}s`,
                background: "rgba(55,230,224,0.05)",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {s}
              </span>
              {i < steps.length - 1 || !loading ? (
                <span
                  style={{ marginLeft: "auto", fontSize: 11, color: "#27c93f" }}
                >
                  ✓ done
                </span>
              ) : (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: "var(--cyan)",
                  }}
                >
                  ...
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 12,
              color: "var(--text-muted)",
              marginBottom: 10,
            }}
          >
            Found {results.length} relevant documents
          </p>
          {results.map((r, i) => (
            <div
              key={r.id}
              className="result-card"
              style={{ marginBottom: 8, animationDelay: `${i * 0.08}s` }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  #{i + 1} {r.title}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--cyan)",
                    background: "rgba(55,230,224,0.1)",
                    borderRadius: 6,
                    padding: "2px 8px",
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}
                >
                  Score: {r.score}
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text-muted)",
                  lineHeight: 1.5,
                }}
              >
                {r.snippet}
              </p>
            </div>
          ))}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p
          style={{
            fontSize: 13,
            color: "var(--text-muted)",
            textAlign: "center",
            padding: "20px 0",
          }}
        >
          No matching documents found. Try different keywords.
        </p>
      )}

      {!searched && (
        <div
          style={{
            textAlign: "center",
            padding: "30px 0",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔎</div>
          <p>Enter a search query to simulate information retrieval</p>
          <p style={{ marginTop: 6, fontSize: 12 }}>
            Try: <span style={{ color: "var(--cyan)" }}>"crawling"</span>,{" "}
            <span style={{ color: "var(--cyan)" }}>"ranking"</span>,{" "}
            <span style={{ color: "var(--cyan)" }}>"vector space"</span>
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2200);
    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for reveal animations
  // biome-ignore lint/correctness/useExhaustiveDependencies: loaded triggers re-observation of reveal elements
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("visible");
        }
      },
      { threshold: 0.12 },
    );
    for (const el of document.querySelectorAll(".reveal")) {
      observer.observe(el);
    }
    return () => observer.disconnect();
  }, [loaded]);

  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <LoadingScreen hidden={loaded} />
      <ParticleBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
        <Navbar />

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          id="hero"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            padding: "80px 24px 60px",
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
            <div
              className="hero-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 60,
                alignItems: "center",
              }}
            >
              {/* Left */}
              <div>
                <div
                  className="tag reveal"
                  style={{ marginBottom: 16, display: "inline-block" }}
                >
                  INFORMATION RETRIEVAL
                </div>
                <h1
                  className="reveal reveal-delay-1"
                  style={{
                    fontSize: "clamp(36px, 5vw, 58px)",
                    fontWeight: 800,
                    lineHeight: 1.08,
                    marginBottom: 22,
                  }}
                >
                  Mastering the
                  <br />
                  <span
                    style={{
                      background:
                        "linear-gradient(90deg, var(--cyan), var(--purple))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Architecture of
                  </span>
                  <br />
                  Information Retrieval
                </h1>
                <p
                  className="reveal reveal-delay-2"
                  style={{
                    fontSize: 16,
                    color: "var(--text-muted)",
                    lineHeight: 1.75,
                    marginBottom: 36,
                    maxWidth: 480,
                  }}
                >
                  Explore how search engines work — from crawling the web to
                  ranking results. An interactive, visual guide for engineering
                  students.
                </p>
                <div
                  className="reveal reveal-delay-3"
                  style={{ display: "flex", gap: 16, flexWrap: "wrap" }}
                >
                  <button
                    type="button"
                    className="btn-cyan"
                    style={{ padding: "14px 32px" }}
                    onClick={() =>
                      document
                        .getElementById("concepts")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Explore Concepts →
                  </button>
                  <button
                    type="button"
                    className="btn-cyan"
                    style={{
                      padding: "14px 28px",
                      borderColor: "var(--purple)",
                      color: "var(--purple)",
                    }}
                    onClick={() =>
                      document
                        .getElementById("demo")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Try the Demo
                  </button>
                </div>

                {/* Stats */}
                <div
                  className="reveal reveal-delay-4"
                  style={{ display: "flex", gap: 32, marginTop: 48 }}
                >
                  {[
                    ["7", "Core Concepts"],
                    ["3D", "Visualizations"],
                    ["Live", "Demo"],
                  ].map(([n, l]) => (
                    <div key={l}>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: "var(--cyan)",
                        }}
                      >
                        {n}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: 3D Canvas */}
              <div
                className="reveal reveal-delay-2"
                style={{
                  position: "relative",
                  borderRadius: 24,
                  background: "rgba(14,20,35,0.5)",
                  border: "1px solid rgba(55,230,224,0.15)",
                  overflow: "hidden",
                  minHeight: 420,
                  boxShadow: "0 0 60px rgba(55,230,224,0.08)",
                }}
              >
                <HeroCanvas />
                <div style={{ position: "absolute", top: 16, left: 16 }}>
                  <span className="tag">3D Node Network</span>
                </div>
                {/* Overlay labels */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 20,
                    left: 20,
                    right: 20,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {["Crawling", "Indexing", "Ranking"].map((l) => (
                    <span
                      key={l}
                      style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        background: "rgba(6,10,18,0.6)",
                        padding: "4px 10px",
                        borderRadius: 20,
                        border: "1px solid rgba(55,230,224,0.15)",
                      }}
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CONCEPTS ─────────────────────────────────────── */}
        <section id="concepts" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              className="reveal"
              style={{ textAlign: "center", marginBottom: 56 }}
            >
              <span className="tag">CORE TOPICS</span>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 800,
                  marginTop: 12,
                  marginBottom: 14,
                }}
              >
                IR Concepts
              </h2>
              <div className="section-divider" style={{ margin: "0 auto" }} />
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 15,
                  maxWidth: 500,
                  margin: "0 auto",
                }}
              >
                Click any card to expand examples. Watch the mastery bars
                animate as you scroll.
              </p>
            </div>

            <div
              className="concepts-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 22,
              }}
            >
              {CONCEPTS.map((c, i) => (
                <ConceptCard key={c.title} c={c} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── VISUALIZATION ─────────────────────────────────── */}
        <section id="viz" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              className="reveal"
              style={{ textAlign: "center", marginBottom: 56 }}
            >
              <span className="tag">VISUALIZE</span>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 800,
                  marginTop: 12,
                  marginBottom: 14,
                }}
              >
                How Search Works
              </h2>
              <div className="section-divider" style={{ margin: "0 auto" }} />
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 15,
                  maxWidth: 500,
                  margin: "0 auto",
                }}
              >
                An animated graph showing how queries flow through indexes to
                retrieve ranked documents.
              </p>
            </div>

            <div
              className="viz-grid reveal reveal-delay-2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 28,
              }}
            >
              {/* Network Graph */}
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  Dynamic Graph Visualization
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginBottom: 16,
                  }}
                >
                  Animated query–index–document network with real-time edge flow
                </p>
                <div className="glass" style={{ padding: 12, height: 380 }}>
                  <NetworkGraph />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    marginTop: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    ["var(--cyan)", "Query Node"],
                    ["var(--purple)", "Document"],
                    ["#2FE3FF", "Index"],
                  ].map(([color, label]) => (
                    <div
                      key={label}
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: color,
                        }}
                      />
                      <span
                        style={{ fontSize: 12, color: "var(--text-muted)" }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How it works */}
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    marginBottom: 8,
                    color: "var(--text-primary)",
                  }}
                >
                  IR Pipeline
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    marginBottom: 16,
                  }}
                >
                  Step-by-step breakdown of the retrieval process
                </p>
                <div className="glass" style={{ padding: 24, height: 380 }}>
                  {[
                    {
                      step: 1,
                      icon: "🕷️",
                      title: "Crawl",
                      desc: "Bots discover and download web pages by following links.",
                      color: "var(--cyan)",
                    },
                    {
                      step: 2,
                      icon: "🗂️",
                      title: "Index",
                      desc: "Extracted terms are stored in an inverted index for fast lookup.",
                      color: "var(--purple)",
                    },
                    {
                      step: 3,
                      icon: "🔍",
                      title: "Query",
                      desc: "User queries are parsed, tokenized and matched against the index.",
                      color: "var(--cyan)",
                    },
                    {
                      step: 4,
                      icon: "📊",
                      title: "Rank",
                      desc: "TF-IDF and PageRank scores determine result order.",
                      color: "var(--purple)",
                    },
                    {
                      step: 5,
                      icon: "✅",
                      title: "Return",
                      desc: "Top-ranked, most relevant documents are returned to the user.",
                      color: "var(--cyan)",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      style={{
                        display: "flex",
                        gap: 14,
                        marginBottom: 20,
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: `linear-gradient(135deg, ${item.color}22, ${item.color}11)`,
                          border: `1px solid ${item.color}55`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "var(--text-primary)",
                            marginBottom: 2,
                          }}
                        >
                          <span style={{ color: item.color }}>
                            {item.step}.
                          </span>{" "}
                          {item.title}
                        </div>
                        <div
                          style={{
                            fontSize: 12.5,
                            color: "var(--text-muted)",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── DEMO ─────────────────────────────────────────── */}
        <section id="demo" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              className="reveal"
              style={{ textAlign: "center", marginBottom: 56 }}
            >
              <span className="tag">INTERACTIVE</span>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 800,
                  marginTop: 12,
                  marginBottom: 14,
                }}
              >
                Retrieval Simulator
              </h2>
              <div className="section-divider" style={{ margin: "0 auto" }} />
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: 15,
                  maxWidth: 500,
                  margin: "0 auto",
                }}
              >
                Experience IR in action. See how queries get parsed, scored with
                TF-IDF, and ranked in real time.
              </p>
            </div>
            <div
              className="reveal reveal-delay-2"
              style={{ maxWidth: 700, margin: "0 auto" }}
            >
              <SearchDemo />
            </div>
          </div>
        </section>

        {/* ── CONTRIBUTORS ──────────────────────────────────── */}
        <section id="contributors" style={{ padding: "80px 24px" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              className="reveal"
              style={{ textAlign: "center", marginBottom: 56 }}
            >
              <span className="tag">TEAM</span>
              <h2
                style={{
                  fontSize: "clamp(28px, 4vw, 42px)",
                  fontWeight: 800,
                  marginTop: 12,
                  marginBottom: 14,
                }}
              >
                Contributors
              </h2>
              <div className="section-divider" style={{ margin: "0 auto" }} />
              <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
                The minds behind this educational platform
              </p>
            </div>

            <div
              className="contributors-grid reveal reveal-delay-2"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 28,
                maxWidth: 700,
                margin: "0 auto",
              }}
            >
              {[
                {
                  name: "PAVITHRA",
                  role: "Information Retrieval Researcher",
                  initial: "P",
                  github: "https://github.com/pavithraB-wec",
                },
                {
                  name: "RANJANA DEVI",
                  role: "Information Retrieval Researcher",
                  initial: "R",
                  github: "https://github.com/ranjanadevi1802",
                },
              ].map((c) => (
                <div key={c.name} className="contributor-card">
                  <div className="avatar-ring" style={{ fontSize: 36 }}>
                    {c.initial}
                  </div>
                  <h3
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginBottom: 6,
                    }}
                  >
                    {c.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--text-muted)",
                      marginBottom: 20,
                    }}
                  >
                    {c.role}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 12,
                    }}
                  >
                    <a
                      href={c.github}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 12,
                        color: "var(--cyan)",
                        textDecoration: "none",
                        padding: "6px 16px",
                        border: "1px solid rgba(55,230,224,0.3)",
                        borderRadius: 20,
                        transition: "all 0.2s",
                      }}
                      className="nav-link"
                    >
                      GitHub →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ────────────────────────────────────────── */}
        <footer
          style={{
            padding: "48px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            marginTop: 40,
          }}
        >
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 24,
                marginBottom: 32,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--cyan), var(--purple))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                  }}
                >
                  🔍
                </div>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 17,
                    color: "var(--text-primary)",
                  }}
                >
                  IR <span style={{ color: "var(--cyan)" }}>Explorer</span>
                </span>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[
                  ["Concepts", "concepts"],
                  ["Visualization", "viz"],
                  ["Demo", "demo"],
                  ["Team", "contributors"],
                ].map(([l, id]) => (
                  <button
                    type="button"
                    key={id}
                    className="nav-link"
                    style={{
                      fontSize: 13,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      document
                        .getElementById(id)
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
              <a
                href="https://github.com/pavithraB-wec"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--text-muted)",
                  textDecoration: "none",
                  fontSize: 14,
                }}
                className="nav-link"
              >
                <span style={{ fontSize: 18 }}>⌥</span> GitHub
              </a>
            </div>
            <div
              style={{
                borderTop: "1px solid rgba(255,255,255,0.05)",
                paddingTop: 20,
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: 13, color: "rgba(167,179,199,0.5)" }}>
                © 2024 IR Explorer — Built for educational purposes ·
                Information Retrieval Systems
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "rgba(167,179,199,0.3)",
                  marginTop: 6,
                }}
              >
                PAVITHRA & RANJANA DEVI ·{" "}
                <a
                  href="https://github.com/pavithraB-wec"
                  style={{ color: "var(--cyan)", textDecoration: "none" }}
                >
                  github.com/pavithraB-wec
                </a>{" "}
                ·{" "}
                <a
                  href="https://github.com/ranjanadevi1802"
                  style={{ color: "var(--cyan)", textDecoration: "none" }}
                >
                  github.com/ranjanadevi1802
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile CSS patch */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .menu-btn { display: block !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .viz-grid { grid-template-columns: 1fr !important; }
          .concepts-grid { grid-template-columns: 1fr 1fr !important; }
          .contributors-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 520px) {
          .concepts-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
