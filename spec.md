# Information Retrieval Concepts - Educational Website

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Hero section with 3D animated particle/node background (Three.js) and rotating globe
- Navigation bar with smooth scroll links
- Loading screen animation
- IR Concepts section with 7 glassmorphism cards: Crawling, Indexing, Query Processing, Ranking Algorithms, TF-IDF, PageRank, Precision & Recall
  - Each card: simple student-friendly explanation, animated icon, real-world example, animated progress indicator
- Visualization section: animated network graph showing documents, queries, and connections
- Demo section: interactive search bar simulation that shows how queries return ranked results
- Contributors section: profile cards for PAVITHRA and RANJANA DEVI
- Footer with GitHub link (https://github.com/pavithraB-wec)
- Floating particles background (Three.js)
- GSAP scroll animations for all sections
- Dark theme with neon cyan/purple accents, glassmorphism panels

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: Simple Motoko actor with search demo data (documents with titles/snippets, keyword matching)
2. Frontend: Full single-page app with:
   - Three.js particle field + rotating 3D node network (hero background)
   - GSAP ScrollTrigger animations for section reveals
   - 7 IR concept cards with CSS animations and explanatory content
   - D3/Canvas animated network graph visualization
   - Search demo wired to backend query API
   - Contributors and footer sections
   - Responsive layout (mobile-first Tailwind)
