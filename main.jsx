// ══════════════════════════════════════════════════════════════
//  LOGIN SCREEN + ROOT APP
// ══════════════════════════════════════════════════════════════
const { useState: useRootState, useEffect: useRootEffect, useRef: useRootRef } = React;

// ─── SESSION BACKEND ─────────────────────────────────────────
function makeSessionId(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = Math.imul(31, h) + name.charCodeAt(i) | 0;
  return 'sid_' + Math.abs(h).toString(36);
}
async function apiSession(method, id, data) {
  try {
    if (method === 'GET') {
      const r = await fetch(`/api/session?id=${encodeURIComponent(id)}`);
      if (r.status === 404) return null;
      return (await r.json()).session || null;
    }
    const opts = { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, session: data }) };
    if (method === 'DELETE') opts.body = JSON.stringify({ id });
    await fetch('/api/session', opts);
  } catch (e) { console.warn('Session error:', e); }
  return null;
}
window.LUMIO_SESSION = {
  save: (id, data) => apiSession('POST', id, data),
  load: (id) => apiSession('GET', id),
  clear: (id) => apiSession('DELETE', id),
};

// Substitue {{PRENOM}} {{NOM}} {{EMAIL_ETUDIANT}} PARTOUT dans LUMIO_DATA, en un seul passage.
function applyStudent(fullName, email) {
  // Échappe les seules entrées libres de l'étudiant (vecteur XSS via dangerouslySetInnerHTML).
  // Le narratif de data.js, lui, reste du HTML riche contrôlé et n'est pas touché.
  const escHtml = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const prenom = escHtml((fullName || '').split(' ')[0] || '');
  const nom    = escHtml((fullName || '').split(' ').slice(1).join(' '));
  const map = { '{{PRENOM}}': prenom, '{{NOM}}': nom, '{{EMAIL_ETUDIANT}}': escHtml(email || '') };
  try {
    const json = JSON.stringify(window.LUMIO_DATA)
      .replace(/\{\{PRENOM\}\}|\{\{NOM\}\}|\{\{EMAIL_ETUDIANT\}\}/g, m => map[m]);
    window.LUMIO_DATA = JSON.parse(json);
  } catch (e) { /* données déjà substituées */ }
  window.LUMIO_DATA.student = window.LUMIO_DATA.student || {};
  window.LUMIO_DATA.student.name = fullName;
  if (email) window.LUMIO_DATA.student.email = email;
  window.LUMIO_DATA.student.initial = (prenom[0] || '?').toUpperCase();
}

// ─── Saisie du nom (avant le login) ─────────────────────────
function NameScreen({ onConfirm }) {
  const [prenom, setPrenom] = useRootState('');
  const [nom, setNom] = useRootState('');
  const [email, setEmail] = useRootState('');
  const [shake, setShake] = useRootState(false);
  const [emailError, setEmailError] = useRootState('');

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const confirm = () => {
    setEmailError('');
    if (!prenom.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (!email.trim() || !isValidEmail(email)) {
      setEmailError('Un email valide est requis pour recevoir ton portfolio.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    const full = `${prenom.trim()}${nom.trim() ? ' ' + nom.trim() : ''}`;
    window.LUMIO_DATA.student.name = full;
    window.LUMIO_DATA.student.email = email.trim().toLowerCase();
    window.LUMIO_DATA.student.initial = prenom.trim()[0].toUpperCase();
    onConfirm(full, email.trim().toLowerCase());
  };

  const inputStyle = (filled) => ({
    width: '100%', padding: '10px 14px',
    border: filled ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid rgba(255,255,255,0.2)',
    borderRadius: 10, background: 'rgba(255,255,255,0.15)',
    color: 'white', fontSize: 14, outline: 'none', transition: 'border-color .2s'
  });

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `
        radial-gradient(ellipse at 30% 20%, #f5d5b8 0%, transparent 50%),
        radial-gradient(ellipse at 75% 80%, #98a8c8 0%, transparent 60%),
        linear-gradient(160deg, #d8a098 0%, #5878a8 100%)
      `,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: 'white', padding: '2rem'
    }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.7, marginBottom: 8 }}>{(window.PAC_CONFIG ? window.PAC_CONFIG.dispositif + ' · ' + window.PAC_CONFIG.bloc : 'PAC')}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 200, letterSpacing: '-0.02em', marginBottom: 8, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>Lumio Health</div>
      <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, opacity: 0.7, marginBottom: 40 }}>Une recommandation à défendre</div>

      <div style={{
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 16,
        padding: '32px 36px',
        width: '100%', maxWidth: 440,
        textAlign: 'center',
        animation: shake ? 'shake 0.4s ease' : 'none'
      }}>
        <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 22, lineHeight: 1.6 }}>
          Tu vas entrer dans ce dossier en tant que consultant·e externe.<br/>
          <span style={{ opacity: 0.7 }}>Identifie-toi pour recevoir ton portfolio de compétences.</span>
        </div>

        {/* Prénom + Nom */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, width: '100%' }}>
          <input
            value={prenom}
            onChange={e => setPrenom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirm(); }}
            placeholder="Prénom *"
            autoFocus
            className="placeholder-dark"
            style={inputStyle(prenom.trim())}
          />
          <input
            value={nom}
            onChange={e => setNom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirm(); }}
            placeholder="Nom"
            className="placeholder-dark"
            style={inputStyle(nom.trim())}
          />
        </div>

        {/* Email école */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') confirm(); }}
            placeholder="Email école (ex: prenom.nom@emineo.fr)"
            className="placeholder-dark"
            style={{
              ...inputStyle(isValidEmail(email)),
              width: '100%',
              border: isValidEmail(email)
                ? '1.5px solid rgba(255,255,255,0.5)'
                : '1.5px solid rgba(255,255,255,0.2)'
            }}
          />
        </div>

        <button
          onClick={confirm}
          style={{
            width: '100%', padding: '11px',
            background: prenom.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
            color: prenom.trim() ? '#1a2436' : 'rgba(255,255,255,0.5)',
            border: 'none', borderRadius: 10,
            fontSize: 13, fontWeight: 600,
            cursor: prenom.trim() ? 'pointer' : 'default',
            transition: 'all .2s', fontFamily: 'inherit'
          }}
        >
          Entrer dans l'affaire →
        </button>
        {(!prenom.trim() || emailError) && (
          <div style={{ fontSize: 11, opacity: 0.5, marginTop: 10 }}>
            {emailError || 'Le prénom est requis'}
          </div>
        )}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, studentName }) {
  const [stage, setStage] = useRootState('idle');
  const [pwd, setPwd] = useRootState('');
  const initial = window.LUMIO_DATA?.student?.initial || studentName?.[0]?.toUpperCase() || '?';

  const onUnlock = () => {
    if (stage === 'unlocking') return;
    setStage('unlocking');
    setTimeout(() => onLogin(), 1200);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: `
        radial-gradient(ellipse at 30% 20%, #f5d5b8 0%, transparent 50%),
        radial-gradient(ellipse at 75% 80%, #98a8c8 0%, transparent 60%),
        linear-gradient(160deg, #d8a098 0%, #5878a8 100%)
      `,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      color: 'white',
      animation: stage === 'unlocking' ? 'fadeOutLogin 1.1s forwards' : 'none'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>lundi 12 octobre 2026</div>
        <div style={{ fontSize: 96, fontWeight: 200, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', lineHeight: 1, textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>07:19</div>
      </div>

      <div style={{
        width: 130, height: 130, borderRadius: '50%',
        background: 'linear-gradient(135deg, #c4420f 0%, #8a2d05 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 56, fontWeight: 200, fontFamily: 'var(--font-display)',
        color: 'white', marginBottom: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
      }}>{initial}</div>
      <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 28, fontFamily: 'var(--font-display)' }}>{studentName}</div>

      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          onFocus={() => setStage('typing')}
          onKeyDown={(e) => { if (e.key === 'Enter') onUnlock(); }}
          placeholder="Mot de passe"
          autoFocus
          style={{
            width: 280, padding: '10px 16px',
            border: 'none', borderRadius: 22,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(12px)',
            color: 'white', fontSize: 14, textAlign: 'center',
            outline: '1.5px solid rgba(255,255,255,0.3)'
          }}
        />
        <button onClick={onUnlock} style={{
          position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
          width: 28, height: 28, borderRadius: '50%',
          background: 'rgba(255,255,255,0.3)', color: 'white',
          border: 'none', cursor: 'pointer', fontSize: 14
        }}>↑</button>
      </div>
      <div style={{ fontSize: 11, opacity: 0.7, fontStyle: 'italic' }}>Touch ID ou mot de passe pour déverrouiller</div>
      <div style={{ position: 'absolute', bottom: 32, left: 0, right: 0, textAlign: 'center', fontSize: 11, opacity: 0.7, letterSpacing: '0.1em' }}>
        ⏏ Annuler · ⏻ Éteindre · ⟲ Redémarrer
      </div>
      {stage === 'unlocking' && (
        <div style={{ position: 'absolute', bottom: 80, fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.85, letterSpacing: '0.12em' }}>
          Déverrouillage en cours…
        </div>
      )}
    </div>
  );
}

// ─── Welcome overlay ─────────────────────────────────────────
function WelcomeBriefCard({ onClose, studentName }) {
  const prenom = studentName.split(' ')[0];
  const [accepted, setAccepted] = useRootState(false);

  const handleStart = () => {
    if (!accepted) return;
    onClose();
  };

  // Blocs actes pour visualiser le temps
  const actes = [
    { n: '1', label: 'Ancrage terrain', dur: '20 min', color: '#7a756c' },
    { n: '2', label: 'Entrée dans l\'affaire', dur: '30 min', color: '#1b4f8a' },
    { n: '3', label: 'Diagnostic', dur: '45 min', color: '#1a6641' },
    { n: '4', label: 'Production', dur: '1h20', color: '#c4420f', bold: true },
    { n: '5', label: 'Réflexion', dur: '35 min', color: '#7a756c' },
  ];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 12000,
      background: 'rgba(20,24,36,0.65)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 400ms ease-out',
      padding: '1rem',
      overflowY: 'auto'
    }}>
      <div style={{
        width: '100%', maxWidth: 580, background: 'white', borderRadius: 14,
        padding: '32px 36px', boxShadow: '0 30px 80px rgba(0,0,0,0.45)'
      }}>
        {/* Header */}
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 10 }}>{(window.PAC_CONFIG ? window.PAC_CONFIG.dispositif + ' · ' + window.PAC_CONFIG.bloc : 'PAC')}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.15, marginBottom: 14 }}>
          Bienvenue, {prenom}.
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-soft)', marginBottom: 10 }}>
          Tu es <strong>{studentName}</strong>, consultant·e stratégie marcom. Théo Marczak, CEO de Lumio Health, t'a confié une mission urgente : produire la <strong>recommandation stratégique</strong> que l'entreprise défendra vendredi devant son board d'investisseurs. Tu as accès à un poste de mission : email de Théo, email confidentiel de Jakob, deck board Q3, veille concurrentielle, verbatims terrain. <em>Jakob Rein attend une décision, pas une analyse.</em>
        </p>

        {/* Bloc temporel — central */}
        <div style={{ background: '#1a2436', borderRadius: 10, padding: '16px 20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>3h30</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)' }}>=</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>3 semaines dans la vraie vie</span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {actes.map(a => (
              <div key={a.n} style={{
                flex: '1 1 80px',
                background: a.bold ? a.color : 'rgba(255,255,255,0.07)',
                border: `1px solid ${a.bold ? 'transparent' : 'rgba(255,255,255,0.12)'}`,
                borderRadius: 7, padding: '8px 10px'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: a.bold ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 3 }}>ACTE {a.n}</div>
                <div style={{ fontSize: 11, color: a.bold ? 'white' : 'rgba(255,255,255,0.65)', fontWeight: a.bold ? 600 : 400, lineHeight: 1.3, marginBottom: 4 }}>{a.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: a.bold ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', fontWeight: a.bold ? 700 : 400 }}>{a.dur}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.5 }}>
            ⏱ L'horloge tourne dès que tu cliques sur "Commencer". Garde un œil dessus — le RP ne rallongera pas les actes.
          </div>
        </div>

        {/* Règles du jeu */}
        <div style={{ background: '#f7f4ef', borderRadius: 8, padding: '14px 18px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Trois règles, pas de négociation</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { ico: '📄', txt: 'Tout ce que tu sais, c\'est dans les documents.' },
              { ico: '🤐', txt: 'Jakob ne te dira pas "si c\'est juste". Il teste chaque hypothèse. Il ne cherche pas à t\'aider — il protège son investissement.' },
              { ico: '💬', txt: 'Quand tu as une hypothèse solide → Slack → Jakob. Sa réaction débloque la suite.' },
            ].map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{r.ico}</span>
                <span style={{ fontSize: 13, color: '#2a2620', lineHeight: 1.55 }}>{r.txt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Checkbox engagement + bouton */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, cursor: 'pointer' }} onClick={() => setAccepted(a => !a)}>
          <div style={{
            width: 18, height: 18, borderRadius: 4, flexShrink: 0,
            border: accepted ? 'none' : '1.5px solid #c4420f',
            background: accepted ? '#c4420f' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .15s'
          }}>
            {accepted && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
          </div>
          <span style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.4 }}>
            J'ai lu les règles. Je suis prêt·e à entrer dans l'affaire.
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleStart} style={{
            padding: '11px 26px',
            background: accepted ? 'var(--ink)' : '#d8d2c6',
            color: accepted ? 'white' : '#9a9690',
            border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: accepted ? 'pointer' : 'default',
            transition: 'all .2s', fontFamily: 'inherit'
          }}>Commencer l'affaire →</button>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
// Lit les URL params transmis par le portail (?p=Prénom&n=Nom&e=email).
// Si les 3 sont présents ET email valide → bypass NameScreen + lockscreen.
function readPortalParams() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const p = (sp.get('p') || '').trim();
    const n = (sp.get('n') || '').trim();
    const e = (sp.get('e') || '').trim().toLowerCase();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
    if (p && emailOk) return { prenom: p, nom: n, email: e, fullName: p + (n ? ' ' + n : '') };
  } catch (_) { /* SSR-safe / malformed URL */ }
  return null;
}

function Root() {
  const [phase, setPhase] = useRootState('loading'); // loading | name | login | brief | desktop
  const [studentName, setStudentName] = useRootState('');
  const [showLogin, setShowLogin] = useRootState(false);
  const [sessionId, setSessionId] = useRootState(null);
  const [timerStart, setTimerStart] = useRootState(null);

  // Au montage : 1) URL params du portail → bypass direct au brief
  //              2) sinon, tenter de restaurer une session existante
  //              3) sinon, démarrer en NameScreen
  useRootEffect(() => {
    // ── 1. URL params du portail (?p=&n=&e=) ──
    const portal = readPortalParams();
    if (portal) {
      const sid = makeSessionId(portal.fullName + Date.now());
      localStorage.setItem('lumio_sid', sid);
      setSessionId(sid);
      setStudentName(portal.fullName);
      applyStudent(portal.fullName, portal.email);
      window.LUMIO_SESSION.save(sid, {
        studentName: portal.fullName,
        studentEmail: portal.email,
        phase: 'brief',
        fromPortal: true
      });
      // Direct au brief (sans NameScreen ni lockscreen)
      setPhase('brief');
      return;
    }

    // ── 2. Session existante en cache ──
    const savedId = localStorage.getItem('lumio_sid');
    if (!savedId) { setPhase('name'); return; }
    window.LUMIO_SESSION.load(savedId).then(session => {
      if (!session || !session.studentName) { setPhase('name'); return; }
      // Session trouvée — restaurer
      const n = session.studentName;
      setStudentName(n);
      setSessionId(savedId);
      if (session.timerStart) {
        setTimerStart(session.timerStart);
        window.LUMIO_TIMER_START = session.timerStart; // FIX : sans ça le timer repartait de 0 au reload
      }
      // Substituer le nom/email partout dans les données
      applyStudent(n, session.studentEmail);
      // Reprendre directement sur le bureau
      setPhase('desktop');
    });
  }, []);

  const handleNameConfirm = (name, studentEmail) => {
    const sid = makeSessionId(name + Date.now());
    localStorage.setItem('lumio_sid', sid);
    setSessionId(sid);
    setStudentName(name);
    applyStudent(name, studentEmail || `${name.split(' ')[0].toLowerCase()}@consult.fr`);
    window.LUMIO_SESSION.save(sid, { studentName: name, studentEmail: studentEmail || '', phase: 'login' });
    setShowLogin(true);
    setPhase('login');
  };

  const handleLogin = () => {
    setShowLogin(false);
    window.LUMIO_SESSION.save(sessionId, { phase: 'brief' });
    setTimeout(() => setPhase('brief'), 200);
  };

  const dismissBrief = () => {
    const ts = Date.now();
    setTimerStart(ts);
    window.LUMIO_SESSION.save(sessionId, { phase: 'desktop', timerStart: ts });
    // Exposer le timerStart pour desktop.jsx
    window.LUMIO_TIMER_START = ts;
    setPhase('desktop');
  };

  const logout = () => {
    window.LUMIO_SESSION.save(sessionId, { phase: 'login' });
    setPhase('login');
    setShowLogin(true);
  };

  const resetSession = () => {
    if (sessionId) window.LUMIO_SESSION.clear(sessionId);
    localStorage.removeItem('lumio_sid');
    window.location.reload();
  };
  // Exposer reset pour un éventuel bouton dans le bureau
  window.LUMIO_RESET = resetSession;

  if (phase === 'loading') return (
    <div style={{ position: 'fixed', inset: 0, background: '#1a2436', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em' }}>RESTAURATION SESSION…</div>
    </div>
  );

  return (
    <>
      {phase === 'name' && <NameScreen onConfirm={handleNameConfirm} />}
      {phase === 'desktop' && <window.LumioDesktop onLogout={logout} studentName={studentName} timerStart={timerStart} />}
      {phase === 'brief' && <WelcomeBriefCard onClose={dismissBrief} studentName={studentName} />}
      {showLogin && phase !== 'name' && <LoginScreen onLogin={handleLogin} studentName={studentName} />}
    </>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
