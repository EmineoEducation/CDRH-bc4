// ══════════════════════════════════════════════════════════════
//  BROWSER APP — générique · piloté par window.LUMIO_DATA.browser
//  corporate / article / linkedin / search / fausse-une / portrait
//  Aucune narration hardcodée. PAC · Éminéo
// ══════════════════════════════════════════════════════════════
const { useState: useStateBrowser, useEffect: useStateBrowserEffect } = React;

function BrowserApp({ openTab, openPortrait }) {
  const D = window.LUMIO_DATA || {};
  const B = D.browser || {};
  const portraits = D.portraits || [];

  // Portraits demandés via Finder : on les ACCUMULE en onglets (un nouvel onglet
  // par portrait ouvert), au lieu de remplacer l'onglet courant.
  const [openedPortraitKeys, setOpenedPortraitKeys] = useStateBrowser(openPortrait ? [openPortrait] : []);
  const [activeTab, setActiveTab] = useStateBrowser(openPortrait ? ('portrait-' + openPortrait) : (openTab || null));

  useStateBrowserEffect(() => {
    if (openPortrait) {
      setOpenedPortraitKeys(keys => keys.includes(openPortrait) ? keys : [...keys, openPortrait]);
      setActiveTab('portrait-' + openPortrait);
    }
  }, [openPortrait]);

  const portraitTabs = openedPortraitKeys
    .map(k => portraits.find(p => p.key === k))
    .filter(Boolean)
    .map(p => ({ ...p, id: p.id || ('portrait-' + p.key), type: 'portrait' }));

  // Onglets : sites pilotés par data + articles presse + fausse Une (Acte 2) + portraits
  const sites = (B.sites || []).map(s => ({ ...s }));
  const articleTabs = (D.pressArticles || []).map((a, i) => ({
    id: 'press-' + i,
    favicon: (a.source || '?')[0],
    faviconColor: (B.articleColors && B.articleColors[i]) || ['#0a3d62', '#a02020', '#e85d3a'][i] || '#5b6b85',
    host: (a.url || '').split('/')[0],
    title: a.headline,
    url: 'https://' + (a.url || ''),
    type: 'article',
    article: a
  }));

  const uneActive = window.LUMIO_TIMER_START && (Date.now() - window.LUMIO_TIMER_START) >= 20 * 60 * 1000;
  const uneTab = (uneActive && D.fausseUne) ? [{
    id: 'fausse-une',
    favicon: (D.fausseUne.source || 'LE').slice(0, 2),
    faviconColor: '#0a3d62',
    host: (D.fausseUne.host) || 'presse.fr',
    title: D.fausseUne.headline,
    url: 'https://' + ((D.fausseUne.host) || 'presse.fr') + '/une',
    type: 'fausse-une'
  }] : [];

  const TABS = [...sites, ...articleTabs, ...uneTab, ...portraitTabs];
  if (TABS.length === 0) TABS.push({ id: 'blank', favicon: '·', faviconColor: '#5b6b85', host: '', title: 'Nouvel onglet', url: 'about:blank', type: 'blank' });

  const effectiveActive = (activeTab && TABS.find(t => t.id === activeTab)) ? activeTab : (TABS[0] && TABS[0].id);
  const tab = TABS.find(t => t.id === effectiveActive) || TABS[0];

  return (
    <div style={browserStyles.app}>
      <div style={browserStyles.tabBar}>
        {TABS.map(t => (
          <div key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ ...browserStyles.tab, ...(effectiveActive === t.id ? browserStyles.tabActive : {}) }}>
            <div style={{ ...browserStyles.favicon, background: t.faviconColor }}>{t.favicon}</div>
            <span style={browserStyles.tabTitle}>{t.title}</span>
            <span style={browserStyles.tabClose}>×</span>
          </div>
        ))}
        <div style={browserStyles.newTab}>+</div>
      </div>

      <div style={browserStyles.urlBar}>
        <div style={browserStyles.navBtns}><span style={browserStyles.navBtn}>‹</span><span style={browserStyles.navBtn}>›</span><span style={browserStyles.navBtn}>↻</span></div>
        <div style={browserStyles.urlBox}><span style={browserStyles.lock}>🔒</span><span style={browserStyles.urlText}>{tab.url}</span></div>
        <div style={browserStyles.navBtns}><span style={browserStyles.navBtn}>⬇</span><span style={browserStyles.navBtn}>⊕</span><span style={browserStyles.navBtn}>☰</span></div>
      </div>

      <div style={browserStyles.viewport} className="scroll">
        {tab.type === 'article' && <ArticleView article={tab.article} related={B.relatedArticles} />}
        {tab.type === 'corporate' && <CorporateView site={tab} />}
        {tab.type === 'linkedin' && <LinkedInView site={tab} />}
        {tab.type === 'search' && <SearchView site={tab} />}
        {tab.type === 'fausse-une' && <FausseUneView />}
        {tab.type === 'blank' && <div style={{ padding: 60, color: 'var(--ink-faint)' }}>—</div>}
        {tab.type === 'portrait' && (
          <iframe src={tab.file} title={tab.title}
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation-by-user-activation" />
        )}
      </div>
    </div>
  );
}

function ArticleView({ article, related }) {
  if (!article) return null;
  return (
    <div style={browserStyles.articleWrap}>
      <div style={browserStyles.articleHeader}>
        <div style={browserStyles.source}>{article.source}</div>
        <div style={browserStyles.byline}>{article.author} · {article.date}</div>
      </div>
      <h1 style={browserStyles.headline}>{article.headline}</h1>
      {article.lede && <p style={browserStyles.lede}>{article.lede}</p>}
      <div style={browserStyles.placeholder} aria-hidden="true" />
      <div style={browserStyles.body}>
        {(article.body || '').split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
      </div>
      {related && related.length > 0 && (
        <div style={browserStyles.related}>
          <div style={browserStyles.relatedTitle}>SUR LE MÊME SUJET</div>
          {related.map((t, i) => <div key={i}>· « {t} »</div>)}
        </div>
      )}
    </div>
  );
}

function CorporateView({ site }) {
  const c = site.corporate || {};
  return (
    <div style={browserStyles.corpWrap}>
      <div style={browserStyles.corpHero}>
        <div style={{ position: 'absolute', top: 24, left: 32, display: 'flex', alignItems: 'center', gap: 10, color: 'white' }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="10" stroke="white" strokeWidth="1.5" /><circle cx="11" cy="11" r="3.5" fill="white" /></svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400, letterSpacing: '-0.01em' }}>{c.brand || 'Lumio Health'}</span>
        </div>
        <div style={{ position: 'absolute', top: 28, right: 32, display: 'flex', gap: 24, color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
          {(c.nav || ['Solution', 'Sciences', 'Clients', 'Carrières']).map((n, i) => <span key={i}>{n}</span>)}
          <span style={{ background: 'white', color: '#1a2436', padding: '5px 14px', borderRadius: 18, fontWeight: 500 }}>{c.cta || 'Demander une démo'}</span>
        </div>
        <div style={browserStyles.corpHeroText}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 300, lineHeight: 1.05, color: 'white', letterSpacing: '-0.02em' }}>{c.hero || ''}</h1>
          {c.subhero && <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', maxWidth: 560, marginTop: 18, lineHeight: 1.6 }}>{c.subhero}</p>}
        </div>
      </div>
      {c.stats && c.stats.length > 0 && (
        <div style={browserStyles.corpStats}>
          {c.stats.map((s, i) => <div key={i}><strong>{s.value}</strong> {s.label}</div>)}
        </div>
      )}
      <div style={browserStyles.corpFooter}>{c.footer || '© Lumio Health · Mentions légales · Politique de confidentialité'}</div>
    </div>
  );
}

function LinkedInView({ site }) {
  const li = site.linkedin || {};
  const initials = (li.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={browserStyles.liWrap}>
      <div style={browserStyles.liHeader}>
        <div style={{ background: '#0a66c2', color: 'white', fontWeight: 700, padding: '4px 8px', borderRadius: 4, fontSize: 18 }}>in</div>
        <input style={browserStyles.liSearch} value={(li.name || '').toLowerCase()} readOnly />
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 11, color: '#666' }}>
          <span>Accueil</span><span>Réseau</span><span>Emplois</span><span>Messages</span><span>Notifications</span>
        </div>
      </div>
      <div style={browserStyles.liCard}>
        <div style={browserStyles.liCover}></div>
        <div style={{ ...browserStyles.liAvatar, background: li.color || '#c4420f' }}>{initials}</div>
        <div style={{ padding: '60px 24px 20px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#000' }}>{li.name}</h1>
          <div style={{ fontSize: 14, color: '#444', marginTop: 4 }}>{li.headline}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{li.location || 'Paris, Île-de-France'} · 500+ relations</div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            <span style={{ background: '#0a66c2', color: 'white', padding: '6px 16px', borderRadius: 18, fontSize: 13, fontWeight: 600 }}>+ Se connecter</span>
            <span style={{ border: '1px solid #0a66c2', color: '#0a66c2', padding: '6px 16px', borderRadius: 18, fontSize: 13, fontWeight: 600 }}>Message</span>
          </div>
        </div>
      </div>
      {li.experience && li.experience.length > 0 && (
        <div style={browserStyles.liCard}>
          <h2 style={{ fontSize: 18, fontWeight: 600, padding: '16px 24px 8px' }}>Expérience</h2>
          {li.experience.map((e, i) => (
            <div key={i} style={{ padding: '8px 24px 16px', borderBottom: i < li.experience.length - 1 ? '1px solid #eee' : 'none' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{e.role}</div>
              <div style={{ fontSize: 13, color: '#444' }}>{e.org}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{e.period}</div>
            </div>
          ))}
        </div>
      )}
      {li.posts && li.posts.length > 0 && (
        <div style={browserStyles.liCard}>
          <h2 style={{ fontSize: 18, fontWeight: 600, padding: '16px 24px 8px' }}>Activité récente · Posts</h2>
          {li.posts.map((p, i) => (
            <div key={i} style={{ padding: '8px 24px 16px', fontSize: 13, color: '#444', lineHeight: 1.5 }}>
              <p style={{ marginBottom: 10 }}>« {p.text} »</p>
              <div style={{ fontSize: 11, color: '#888' }}>{p.meta}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchView({ site }) {
  const s = site.search || {};
  const results = s.results || [];
  return (
    <div style={browserStyles.searchWrap}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#de5833' }}>{s.engine || 'DuckDuckGo'}</div>
        <input style={browserStyles.searchInput} value={s.query || ''} readOnly />
      </div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 18 }}>Environ {s.count || '12 000'} résultats</div>
      {results.map((r, i) => (
        <div key={i} style={browserStyles.searchResult}>
          <div style={{ fontSize: 11, color: '#888' }}>{r.url}</div>
          <div style={{ fontSize: 16, color: '#1a4d7a', fontWeight: 400, margin: '2px 0 4px', cursor: 'pointer' }}>{r.title}</div>
          <div style={{ fontSize: 12.5, color: '#444', lineHeight: 1.5 }}>{r.desc}</div>
        </div>
      ))}
    </div>
  );
}

function FausseUneView() {
  const D = window.LUMIO_DATA || {};
  const u = D.fausseUne || {};
  const C = { dark: '#1a1a2e', accent: '#0a3d62', muted: '#5b6473', rule: '#e8e6e0' };
  const corps = u.corps || u.body || '';
  return (
    <div style={{ background: 'white', minHeight: '100%', fontFamily: 'var(--font-sans)' }}>
      <div style={{ borderBottom: `3px solid ${C.dark}`, padding: '12px 0 10px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6 }}>
            {u.source || 'Presse'} · {u.rubrique || 'Économie & Entreprises'} · Mis à jour le {u.date}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: C.dark }}>{u.source || 'Presse'}</div>
        </div>
      </div>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 24px' }}>
        {u.kicker && <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 12 }}>{u.kicker}</div>}
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, lineHeight: 1.12, color: C.dark, marginBottom: 16 }}>{u.headline}</h1>
        {(u.chapeau || u.chapo) && <p style={{ fontSize: 17, lineHeight: 1.65, color: '#2a3142', fontWeight: 400, marginBottom: 18, borderLeft: `3px solid ${C.accent}`, paddingLeft: 16 }}>{u.chapeau || u.chapo}</p>}
        {u.encadre && (
          <div style={{ background: '#f0f4fa', border: '1px solid #1b3a6b', borderRadius: 6, padding: '14px 18px', marginBottom: 22, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{u.encadre.icone || '🏆'}</div>
            <div>
              <div style={{ fontWeight: 700, color: '#1b3a6b', fontSize: 13, marginBottom: 4 }}>{u.encadre.titre}</div>
              <div style={{ fontSize: 12, color: '#2a3142', lineHeight: 1.6 }}>{u.encadre.texte}</div>
            </div>
          </div>
        )}
        <div style={{ fontSize: 15, lineHeight: 1.8, color: '#1a1a2e' }}>
          {corps.split('\n\n').map((p, i) => <p key={i} style={{ marginBottom: 18 }}>{p}</p>)}
        </div>
        <div style={{ marginTop: 32, paddingTop: 18, borderTop: `1px solid ${C.rule}`, fontSize: 12, color: C.muted }}>{u.signature || ''} · {u.source} · {u.date}</div>
        {u.relatedUne && u.relatedUne.length > 0 && (
          <div style={{ marginTop: 28, padding: '18px 0', borderTop: `2px solid ${C.dark}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>SUR LE MÊME SUJET</div>
            {u.relatedUne.map((t, i) => <div key={i} style={{ padding: '8px 0', borderBottom: `1px solid ${C.rule}`, fontSize: 14, color: C.accent, cursor: 'pointer' }}>· {t}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

const browserStyles = {
  app: { display: 'flex', flexDirection: 'column', height: '100%', background: '#f4f2ee', overflow: 'hidden' },
  tabBar: { display: 'flex', background: 'linear-gradient(180deg, #e8e6e0, #d8d6d0)', borderBottom: '1px solid rgba(0,0,0,0.12)', padding: '6px 6px 0', gap: 2 },
  tab: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'rgba(255,255,255,0.4)', borderRadius: '7px 7px 0 0', fontSize: 12, color: 'var(--ink-soft)', maxWidth: 200, minWidth: 140, cursor: 'pointer' },
  tabActive: { background: '#fff', color: 'var(--ink)', fontWeight: 500 },
  favicon: { width: 16, height: 16, borderRadius: 3, color: 'white', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tabTitle: { flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  tabClose: { color: 'var(--ink-faint)', fontSize: 14, lineHeight: 1 },
  newTab: { padding: '7px 12px', color: 'var(--ink-faint)', fontSize: 16, cursor: 'pointer' },
  urlBar: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#fff', borderBottom: '1px solid var(--rule)' },
  navBtns: { display: 'flex', gap: 4 },
  navBtn: { width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-mute)', fontSize: 16, cursor: 'pointer', borderRadius: 4 },
  urlBox: { flex: 1, background: '#f0eee8', border: '1px solid var(--rule)', borderRadius: 6, padding: '5px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-soft)' },
  lock: { fontSize: 11 },
  urlText: { fontFamily: 'var(--font-mono)', fontSize: 11.5 },
  viewport: { flex: 1, background: 'white', overflowY: 'auto', minHeight: 0 },
  articleWrap: { maxWidth: 720, margin: '0 auto', padding: '40px 32px 60px', fontFamily: 'Georgia, var(--font-display), serif' },
  articleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 18, paddingBottom: 12, borderBottom: '2px solid var(--ink)' },
  source: { fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)' },
  byline: { fontSize: 12, color: 'var(--ink-mute)', fontStyle: 'italic' },
  headline: { fontSize: 36, lineHeight: 1.15, fontWeight: 400, color: 'var(--ink)', marginBottom: 14, letterSpacing: '-0.01em' },
  lede: { fontSize: 17, lineHeight: 1.55, color: 'var(--ink-soft)', fontStyle: 'italic', marginBottom: 18 },
  placeholder: { height: 220, background: 'repeating-linear-gradient(45deg, #f0eee8, #f0eee8 10px, #e8e6e0 10px, #e8e6e0 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px 0' },
  body: { fontSize: 15.5, lineHeight: 1.75, color: 'var(--ink-soft)' },
  related: { marginTop: 36, paddingTop: 18, borderTop: '1px solid var(--rule)', fontSize: 13, lineHeight: 1.9, color: 'var(--ink-mute)' },
  relatedTitle: { fontFamily: 'var(--font-sans)', fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', color: 'var(--accent)', marginBottom: 8 },
  corpWrap: { background: 'white', minHeight: '100%' },
  corpHero: { height: 480, background: 'linear-gradient(135deg, #1a2436 0%, #2b3a5a 60%, #4a5d80 100%)', position: 'relative', overflow: 'hidden' },
  corpHeroText: { position: 'absolute', left: 60, bottom: 80 },
  corpStats: { display: 'flex', gap: 60, padding: '40px 60px', background: '#f4ede0', fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--ink)' },
  corpFooter: { padding: '24px 60px', fontSize: 11, color: 'var(--ink-mute)', borderTop: '1px solid var(--rule)' },
  liWrap: { background: '#f3f2ef', minHeight: '100%', padding: '0 0 40px' },
  liHeader: { display: 'flex', alignItems: 'center', gap: 14, padding: '8px 24px', background: 'white', borderBottom: '1px solid #e8e8e8', position: 'sticky', top: 0, zIndex: 5 },
  liSearch: { width: 240, padding: '5px 10px', fontSize: 12, background: '#edf3f8', border: 'none', borderRadius: 4, fontFamily: 'inherit' },
  liCard: { background: 'white', borderRadius: 8, margin: '16px auto', maxWidth: 720, border: '1px solid #e8e8e8', position: 'relative', overflow: 'hidden' },
  liCover: { height: 100, background: 'linear-gradient(135deg, #c4a890, #8a7a78)' },
  liAvatar: { position: 'absolute', top: 50, left: 24, width: 96, height: 96, borderRadius: '50%', background: '#c4420f', color: 'white', fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid white' },
  searchWrap: { padding: '40px 60px', maxWidth: 720, margin: '0 auto' },
  searchInput: { padding: '8px 14px', fontSize: 13, border: '1px solid #ccc', borderRadius: 18, width: 360, fontFamily: 'inherit' },
  searchResult: { marginBottom: 24 }
};

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.browser = BrowserApp;
