// ══════════════════════════════════════════════════════════════
//  BROWSER APP — Safari-like with tabs
// ══════════════════════════════════════════════════════════════
const { useState: useStateBrowser, useRef: useRefBrowser } = React;

function BrowserApp({ openTab, openPortrait }) {
  const D = window.LUMIO_DATA;

  const PORTRAIT_META = {
    theo:    { id: 'portrait-theo',    favicon: 'UD', faviconColor: '#1a2436', host: "usine-digitale.fr", title: "Théo Marczak, l'ingénieur qui a décidé que le stress devait se mesurer · L'Usine Digitale", url: 'https://usine-digitale.fr/article/portrait-theo-marczak', file: '/portraits/portrait_theo_marczak.html' },
    sonia:   { id: 'portrait-sonia',   favicon: 'CB', faviconColor: '#e8173a', host: 'cbnews.fr',         title: "Sonia Ferracci : « J'ai quitté la certitude pour aller là où quelque chose pouvait basculer » · CB News", url: 'https://cbnews.fr/portraits/sonia-ferracci', file: '/portraits/portrait_sonia_ferracci.html' },
    jakob:   { id: 'portrait-jakob',   favicon: 'F',  faviconColor: '#0a0a0a', host: 'forbes.fr',         title: "Jakob Rein : l'homme qui parie que la santé au travail n'est pas un marché de niche · Forbes France", url: 'https://forbes.fr/investisseurs/jakob-rein-northgate', file: '/portraits/portrait_jakob_rein.html' },
    camille: { id: 'portrait-camille', favicon: 'AC', faviconColor: '#1a6b3c', host: 'actionco.fr',       title: "Camille Ott : « Un client DRH ne vous fait pas confiance parce que votre produit est bon » · Action Commerciale", url: 'https://actionco.fr/portraits/camille-ott', file: '/portraits/portrait_camille_ott.html' },
    yassine: { id: 'portrait-yassine', favicon: 'M',  faviconColor: '#6437f0', host: 'maddyness.com',     title: "Yassine Morel : « Dans la santé, le contenu qui rassure est souvent le contenu qui dit ce qu'il ne fait pas » · Maddyness", url: 'https://maddyness.com/portraits/yassine-morel', file: '/portraits/portrait_yassine_morel.html' },
  };

  const portraitTab = openPortrait && PORTRAIT_META[openPortrait]
    ? { ...PORTRAIT_META[openPortrait], type: 'portrait' }
    : null;

  const TABS = [
    {
      id: 't0', favicon: 'L', faviconColor: '#1a2436', host: 'lumio-health.com',
      title: 'Lumio Health · Mesurez le stress invisible',
      url: 'https://lumio-health.com',
      type: 'corporate'
    },
    ...D.pressArticles.map((a, i) => ({
      id: `press-${i}`,
      favicon: a.source[0],
      faviconColor: ['#0a3d62', '#a02020', '#e85d3a'][i],
      host: a.url.split('/')[0],
      title: a.headline,
      url: 'https://' + a.url,
      type: 'article',
      article: a
    })),
    {
      id: 'tlinkedin', favicon: 'in', faviconColor: '#0a66c2', host: 'linkedin.com',
      title: 'Sonia Ferracci · Directrice Marketing chez Lumio Health | LinkedIn',
      url: 'https://linkedin.com/in/sonia-ferracci',
      type: 'linkedin'
    },
    {
      id: 'tsearch', favicon: '🔍', faviconColor: '#5b6b85', host: 'duckduckgo.com',
      title: 'mdr classe iia wearable santé — DuckDuckGo',
      url: 'https://duckduckgo.com/?q=mdr+classe+iia+wearable+santé',
      type: 'search'
    },
    // Fausse Une Les Échos — apparaît dès l'Acte 2 (>= 20 min de session)
    ...((window.LUMIO_TIMER_START && (Date.now() - window.LUMIO_TIMER_START) >= 20 * 60 * 1000) ? [{
      id: 'fausse-une',
      favicon: 'LE',
      faviconColor: '#0a3d62',
      host: 'lesechos.fr',
      title: 'Wearables santé : les mutuelles entrent dans la danse — le B2B explose · Les Échos',
      url: 'https://lesechos.fr/sante/wearables-mutuelles-mdr-explosion',
      type: 'fausse-une'
    }] : []),
    ...(portraitTab ? [portraitTab] : []),
  ];

  const initialTab = portraitTab
    ? portraitTab.id
    : openTab && TABS.find(t => t.id === openTab)
      ? openTab
      : (openTab && TABS.find(t => t.id.startsWith('press-' + openTab))?.id) || 'press-0';
  const [activeTab, setActiveTab] = useStateBrowser(initialTab);
  const tab = TABS.find(t => t.id === activeTab) || TABS[0];

  return (
    <div style={browserStyles.app}>
      <div style={browserStyles.tabBar}>
        {TABS.map(t => (
          <div
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...browserStyles.tab,
              ...(activeTab === t.id ? browserStyles.tabActive : {})
            }}>
            <div style={{ ...browserStyles.favicon, background: t.faviconColor }}>
              {t.favicon}
            </div>
            <span style={browserStyles.tabTitle}>{t.title}</span>
            <span style={browserStyles.tabClose}>×</span>
          </div>
        ))}
        <div style={browserStyles.newTab}>+</div>
      </div>

      <div style={browserStyles.urlBar}>
        <div style={browserStyles.navBtns}>
          <span style={browserStyles.navBtn}>‹</span>
          <span style={browserStyles.navBtn}>›</span>
          <span style={browserStyles.navBtn}>↻</span>
        </div>
        <div style={browserStyles.urlBox}>
          <span style={browserStyles.lock}>🔒</span>
          <span style={browserStyles.urlText}>{tab.url}</span>
        </div>
        <div style={browserStyles.navBtns}>
          <span style={browserStyles.navBtn}>⬇</span>
          <span style={browserStyles.navBtn}>⊕</span>
          <span style={browserStyles.navBtn}>☰</span>
        </div>
      </div>

      <div style={browserStyles.viewport} className="scroll">
        {tab.type === 'article' && <ArticleView article={tab.article} />}
        {tab.type === 'corporate' && <CorporateView />}
        {tab.type === 'linkedin' && <LinkedInView />}
        {tab.type === 'search' && <SearchView />}
        {tab.type === 'fausse-une' && <FausseUneView />}
        {tab.type === 'portrait' && (
          <iframe
            src={tab.file}
            title={tab.title}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation"
          />
        )}
      </div>
    </div>
  );
}

function ArticleView({ article }) {
  return (
    <div style={browserStyles.articleWrap}>
      <div style={browserStyles.articleHeader}>
        <div style={browserStyles.source}>{article.source}</div>
        <div style={browserStyles.byline}>{article.author} · {article.date}</div>
      </div>
      <h1 style={browserStyles.headline}>{article.headline}</h1>
      <p style={browserStyles.lede}>{article.lede}</p>
      <div style={browserStyles.placeholder}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9a9ea8', letterSpacing: '0.1em' }}>PHOTO ILLUSTRATIVE — wearable santé sur poignet</span>
      </div>
      <div style={browserStyles.body}>
        {article.body.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div style={browserStyles.related}>
        <div style={browserStyles.relatedTitle}>SUR LE MÊME SUJET</div>
        <div>· « MDR : pourquoi 40 % des startups healthtech ne suivent pas »</div>
        <div>· « Apple, Withings, Lumio : qui gagnera le marché du stress ? »</div>
        <div>· « DRH : les 5 critères qui changent la donne en 2026 »</div>
      </div>
    </div>
  );
}

function CorporateView() {
  return (
    <div style={browserStyles.corpWrap}>
      <div style={browserStyles.corpHero}>
        <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.5"/><circle cx="11" cy="11" r="3.5" fill="white"/></svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em' }}>Lumio Health</span>
        </div>
        <div style={{ position: 'absolute', top: 28, right: 32, display: 'flex', gap: 24, color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
          <span>Solution</span><span>Sciences</span><span>Clients</span><span>Carrières</span>
          <span style={{ background: 'white', color: '#1a2436', padding: '5px 14px', borderRadius: 18, fontWeight: 500 }}>Demander une démo</span>
        </div>
        <div style={browserStyles.corpHeroText}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 300, lineHeight: 1.05, color: 'white', letterSpacing: '-0.02em' }}>
            La santé que les chiffres<br/>ne montrent pas <em style={{ fontStyle: 'italic', color: '#d18a3c' }}>encore.</em>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', maxWidth: 560, marginTop: 18, lineHeight: 1.6 }}>
            Lumio mesure le stress chronique au travail. Pour les DRH qui veulent comprendre avant que les chiffres ne le racontent.
          </p>
        </div>
      </div>
      <div style={browserStyles.corpStats}>
        <div><strong>230</strong> entreprises clientes</div>
        <div><strong>8 ans</strong> de données propriétaires</div>
        <div><strong>FR · UE · CH</strong> implantations</div>
      </div>
      <div style={browserStyles.corpFooter}>
        © 2026 Lumio Health · Mentions légales · Politique de confidentialité · Données scientifiques
      </div>
    </div>
  );
}

function LinkedInView() {
  return (
    <div style={browserStyles.liWrap}>
      <div style={browserStyles.liHeader}>
        <div style={{ background: '#0a66c2', color: 'white', fontWeight: 700, padding: '4px 8px', borderRadius: 4, fontSize: 18 }}>in</div>
        <input style={browserStyles.liSearch} value="sonia ferracci" readOnly />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 11, color: '#666' }}>
          <span>Accueil</span><span>Réseau</span><span>Emplois</span><span>Messages</span><span>Notifications</span>
        </div>
      </div>
      <div style={browserStyles.liCard}>
        <div style={browserStyles.liCover}></div>
        <div style={browserStyles.liAvatar}>SF</div>
        <div style={{ padding: '60px 24px 20px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#000' }}>Sonia Ferracci</h1>
          <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>Directrice Marketing chez Lumio Health · Brand strategy · Healthtech</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Paris, Île-de-France · 500+ relations</div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <span style={{ background: '#0a66c2', color: 'white', padding: '6px 16px', borderRadius: 18, fontSize: 13, fontWeight: 600 }}>+ Se connecter</span>
            <span style={{ border: '1px solid #0a66c2', color: '#0a66c2', padding: '6px 16px', borderRadius: 18, fontSize: 13, fontWeight: 600 }}>Message</span>
          </div>
        </div>
      </div>
      <div style={browserStyles.liCard}>
        <h2 style={{ fontSize: 18, fontWeight: 600, padding: '16px 24px 8px' }}>Expérience</h2>
        <div style={{ padding: '8px 24px 16px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Directrice Marketing</div>
          <div style={{ fontSize: 13, color: '#444' }}>Lumio Health · Temps plein</div>
          <div style={{ fontSize: 12, color: '#888' }}>févr. 2026 – aujourd'hui · 7 mois · Paris</div>
        </div>
        <div style={{ padding: '12px 24px 16px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Brand Director</div>
          <div style={{ fontSize: 13, color: '#444' }}>Maison Plisson · Temps plein</div>
          <div style={{ fontSize: 12, color: '#888' }}>2022 – 2025 · 3 ans</div>
        </div>
        <div style={{ padding: '12px 24px 16px', borderBottom: '1px solid #eee' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Strategic Planner</div>
          <div style={{ fontSize: 13, color: '#444' }}>BETC · CDI</div>
          <div style={{ fontSize: 12, color: '#888' }}>2018 – 2022 · 4 ans</div>
        </div>
        <div style={{ padding: '12px 24px 16px' }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Junior Strategist</div>
          <div style={{ fontSize: 13, color: '#444' }}>Saatchi & Saatchi · CDI</div>
          <div style={{ fontSize: 12, color: '#888' }}>2015 – 2018 · 3 ans</div>
        </div>
      </div>
      <div style={browserStyles.liCard}>
        <h2 style={{ fontSize: 18, fontWeight: 600, padding: '16px 24px 8px' }}>Activité récente · Posts</h2>
        <div style={{ padding: '8px 24px 16px', fontSize: 13, color: '#444', lineHeight: 1.5 }}>
          <p style={{ marginBottom: 10 }}>« Sept mois dans cette nouvelle aventure. Ce que j'apprends : qu'une marque B2B mature qui veut se réinventer, ce n'est pas un repositionnement, c'est une opération à cœur ouvert. On ne change pas l'identité d'une boîte sans toucher à ce qui la tient debout. »</p>
          <div style={{ fontSize: 11, color: '#888' }}>il y a 3 semaines · 247 réactions</div>
        </div>
      </div>
    </div>
  );
}

function SearchView() {
  return (
    <div style={browserStyles.searchWrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#de5833' }}>DuckDuckGo</div>
        <input style={browserStyles.searchInput} value="mdr classe iia wearable santé" readOnly />
      </div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 18 }}>Environ 14 200 résultats</div>

      {[
        { url: 'sante-publique.gouv.fr › reglement-mdr-2024', title: 'Le règlement MDR (UE) 2017/745 — application 2024', desc: 'Le règlement (UE) 2017/745 relatif aux dispositifs médicaux est entré en pleine application. La classification IIa concerne notamment les dispositifs destinés à des fonctions de surveillance physiologique non vitales…' },
        { url: 'biostream.com › press › certification-2026', title: 'Biostream obtient la certification MDR Classe IIa pour Flow Patch Pro', desc: '« Une étape réglementaire majeure qui valide huit ans de R&D », commente Marc Léger, CEO. La certification ouvre l\'accès aux marchés hospitaliers et permet une revendication médicale étendue.' },
        { url: 'snitem.fr › classement-mdr-iia-criteres', title: 'Classification MDR IIa : critères et procédure', desc: 'La classe IIa regroupe les dispositifs présentant un risque modéré. La procédure d\'évaluation par un organisme notifié dure en moyenne 14 à 22 mois selon le type de dispositif…' },
        { url: 'wikipedia.org › Lumio_Health', title: 'Lumio Health — Wikipédia', desc: 'Lumio Health est une medtech française fondée en 2018, spécialisée dans la mesure du stress chronique en milieu professionnel. L\'entreprise a levé 22 M$ en série B en 2025…' },
        { url: 'usine-digitale.fr › lumio-health-leve-22m', title: 'Lumio Health lève 22 M$ pour passer au grand public', desc: 'La startup parisienne, jusque-là discrète sur le segment B2B, ambitionne d\'atteindre 20 M€ de chiffre d\'affaires en 36 mois. Le tour est mené par le fonds américain Athena Health Capital…' }
      ].map((r, i) => (
        <div key={i} style={browserStyles.searchResult}>
          <div style={{ fontSize: 11, color: '#888' }}>{r.url}</div>
          <div style={{ fontSize: 16, color: '#1a4d7a', fontWeight: 400, margin: '2px 0 4px', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent' }}>{r.title}</div>
          <div style={{ fontSize: 12.5, color: '#444', lineHeight: 1.5 }}>{r.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ── Fausse Une — Les Échos · déclenchée à l'Acte 2 ──────────
function FausseUneView() {
  const D = window.LUMIO_DATA;
  const u = D.fausseUne;
  const C = { dark: '#1a1a2e', accent: '#0a3d62', muted: '#5b6473', rule: '#e8e6e0' };
  return (
    <div style={{ background: 'white', minHeight: '100%', fontFamily: 'var(--font-sans)' }}>

      {/* Header journal */}
      <div style={{ borderBottom: `3px solid ${C.dark}`, padding: '12px 0 10px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            Les Échos · Économie & Entreprises · Mis à jour le {u.date}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: C.dark }}>
            Les Échos
          </div>
        </div>
      </div>

      {/* Article */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 24px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>
          Santé au travail · Wearables
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, lineHeight: 1.12, color: C.dark, marginBottom: 16 }}>
          {u.headline}
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.65, color: '#2a3142', fontWeight: 400, marginBottom: 18, borderLeft: `3px solid ${C.accent}`, paddingLeft: 16 }}>
          {u.chapeau}
        </p>

        {/* Encadré signal fort */}
        <div style={{ background: '#f0f4fa', border: '1px solid #1b3a6b', borderRadius: 6, padding: '14px 18px', marginBottom: 22, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ fontSize: 24, flexShrink: 0 }}>🏆</div>
          <div>
            <div style={{ fontWeight: 700, color: '#1b3a6b', fontSize: 13, marginBottom: 4 }}>Signal fort B2B · À retenir pour votre recommandation</div>
            <div style={{ fontSize: 12, color: '#2a3142', lineHeight: 1.6 }}>
              Un appel d'offres mutuelles de <strong>45 M€ sur 3 ans</strong> vient de s'ouvrir — avec <strong>MDR IIa obligatoire</strong>. Biostream et Neuroflow sont en position de force. Les acteurs non certifiés, dont Lumio, sont mécaniquement exclus à ce stade.
            </div>
          </div>
        </div>

        {/* Corps */}
        <div style={{ fontSize: 15, lineHeight: 1.8, color: '#1a1a2e' }}>
          {u.corps.split('\n\n').map((p, i) => (
            <p key={i} style={{ marginBottom: 18 }}>{p}</p>
          ))}
        </div>

        <div style={{ marginTop: 32, paddingTop: 18, borderTop: `1px solid ${C.rule}`, fontSize: 12, color: C.muted }}>
          Émilie Vasseur · Les Échos · {u.date}
        </div>

        {/* Articles liés */}
        <div style={{ marginTop: 28, padding: '18px 0', borderTop: `2px solid ${C.dark}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>SUR LE MÊME SUJET</div>
          {['Biostream : après la MDR, le B2B institutionnel s\'ouvre',
            'Wearables en entreprise : ce que les DRH exigent désormais',
            'Northgate Capital : la healthtech B2C, un pari risqué en 2026 ?'].map((t, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${C.rule}`, fontSize: 14, color: C.accent, cursor: 'pointer' }}>· {t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const browserStyles = {
  app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#f4f2ee', overflow: 'hidden' },
  tabBar: {
    display: 'flex',
    background: 'linear-gradient(180deg, #e8e6e0, #d8d6d0)',
    borderBottom: '1px solid rgba(0,0,0,0.12)',
    padding: '6px 6px 0', gap: 2
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '7px 12px',
    background: 'rgba(255,255,255,0.4)',
    borderRadius: '7px 7px 0 0',
    fontSize: 12, color: 'var(--ink-soft)',
    maxWidth: 200, minWidth: 140,
    cursor: 'pointer'
  },
  tabActive: { background: '#fff', color: 'var(--ink)', fontWeight: 500 },
  favicon: {
    width: 16, height: 16, borderRadius: 3,
    color: 'white', fontSize: 9, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  },
  tabTitle: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tabClose: { color: 'var(--ink-faint)', fontSize: 14, lineHeight: 1 },
  newTab: { padding: '7px 12px', color: 'var(--ink-faint)', fontSize: 16, cursor: 'pointer' },

  urlBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 12px',
    background: '#fff',
    borderBottom: '1px solid var(--rule)'
  },
  navBtns: { display: 'flex', gap: 4 },
  navBtn: { width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)', fontSize: 16, cursor: 'pointer', borderRadius: 4 },
  urlBox: {
    flex: 1,
    background: '#f0eee8',
    border: '1px solid var(--rule)',
    borderRadius: 6,
    padding: '5px 12px',
    fontSize: 12,
    display: 'flex', alignItems: 'center', gap: 6,
    color: 'var(--ink-soft)'
  },
  lock: { fontSize: 11 },
  urlText: { fontFamily: 'var(--font-mono)', fontSize: 11.5 },

  viewport: { flex: 1, background: 'white', overflowY: 'auto', minHeight: 0 },

  // Article
  articleWrap: { maxWidth: 720, margin: '0 auto', padding: '40px 32px 60px', fontFamily: 'Georgia, var(--font-display), serif' },
  articleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, paddingBottom: 12, borderBottom: '2px solid var(--ink)' },
  source: { fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)' },
  byline: { fontSize: 12, color: 'var(--ink-mute)', fontStyle: 'italic' },
  headline: { fontSize: 36, lineHeight: 1.15, fontWeight: 400, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-0.01em' },
  lede: { fontSize: 17, lineHeight: 1.55, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: 18 },
  placeholder: {
    height: 220,
    background: 'repeating-linear-gradient(45deg, #f0eee8, #f0eee8 10px, #e8e6e0 10px, #e8e6e0 20px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '20px 0'
  },
  body: { fontSize: 15.5, lineHeight: 1.75, color: 'var(--ink-soft)' },
  related: { marginTop: 36, paddingTop: 18, borderTop: '1px solid var(--rule)', fontSize: 13, lineHeight: 1.9, color: 'var(--ink-mute)' },
  relatedTitle: { fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: 8 },

  // Corporate
  corpWrap: { background: 'white', minHeight: '100%' },
  corpHero: {
    height: 480,
    background: 'linear-gradient(135deg, #1a2436 0%, #2b3a5a 60%, #4a5d80 100%)',
    position: 'relative', overflow: 'hidden'
  },
  corpHeroText: { position: 'absolute', left: 60, bottom: 80 },
  corpStats: { display: 'flex', gap: 60, padding: '40px 60px', background: '#f4ede0', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' },
  corpFooter: { padding: '24px 60px', fontSize: 11, color: 'var(--ink-mute)', borderTop: '1px solid var(--rule)' },

  // LinkedIn
  liWrap: { background: '#f3f2ef', minHeight: '100%', padding: '0 0 40px' },
  liHeader: { display: 'flex', alignItems: 'center', gap: 14, padding: '8px 24px', background: 'white', borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 0, zIndex: 5 },
  liSearch: { width: 240, padding: '5px 10px', fontSize: 12, background: '#edf3f8', border: 'none', borderRadius: 4, fontFamily: 'inherit' },
  liCard: { background: 'white', borderRadius: 8, margin: '16px auto', maxWidth: 720, border: '1px solid #e8e8e8', position: 'relative', overflow: 'hidden' },
  liCover: { height: 100, background: 'linear-gradient(135deg, #c4a890, #8a7a78)' },
  liAvatar: {
    position: 'absolute', top: 50, left: 24,
    width: 96, height: 96, borderRadius: '50%',
    background: '#c4420f', color: 'white',
    fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 400,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '4px solid white'
  },

  // Search
  searchWrap: { padding: '40px 60px', maxWidth: 720, margin: '0 auto' },
  searchInput: { padding: '8px 14px', fontSize: 13, border: '1px solid #ccc', borderRadius: 18, width: 360, fontFamily: 'inherit' },
  searchResult: { marginBottom: 24 }
};

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.browser = BrowserApp;
