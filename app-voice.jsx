// ══════════════════════════════════════════════════════════════
//  VOICE MEMOS — générique · piloté par window.LUMIO_DATA.voiceMemos
//  (alias rétrocompatible : camilleVerbatims). Aucune narration hardcodée.
//  Chaque mémo : { title, author, role, date, durationSec, transcript }
//  PAC · Éminéo
// ══════════════════════════════════════════════════════════════
const { useState: useVoiceState, useEffect: useVoiceEffect, useRef: useVoiceRef } = React;

function VoiceApp() {
  const D = window.LUMIO_DATA || {};
  const src = D.voiceMemos || D.camilleVerbatims || [];
  const memos = src.map((v, i) => ({
    ...v,
    id: `memo-${i}`,
    label: v.title,
    date: v.date || '',
    durationSec: v.durationSec || 60
  }));

  const safeMemos = memos.length ? memos : [{ id: 'memo-0', label: '—', date: '', durationSec: 1, transcript: '', author: '', role: '' }];
  const [selectedId, setSelectedId] = useVoiceState(safeMemos[0].id);
  const [playing, setPlaying] = useVoiceState(false);
  const [position, setPosition] = useVoiceState(0);
  const selected = safeMemos.find(m => m.id === selectedId) || safeMemos[0];
  const intervalRef = useVoiceRef(null);

  useVoiceEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setPosition(p => { if (p >= selected.durationSec) { setPlaying(false); return selected.durationSec; } return p + 0.5; });
      }, 500);
    } else if (intervalRef.current) { clearInterval(intervalRef.current); }
    return () => clearInterval(intervalRef.current);
  }, [playing, selected.durationSec]);

  const fmt = (s) => `${Math.floor(s / 60)}:${(Math.floor(s) % 60).toString().padStart(2, '0')}`;
  const wave = Array.from({ length: 80 }, (_, i) => 0.2 + 0.6 * Math.abs(Math.sin(i * 0.5 + (selected.id.charCodeAt(5) || 3))) + 0.2 * Math.random());
  const transcriptChars = Math.floor((selected.transcript || '').length * (position / selected.durationSec));
  const displayTranscript = (selected.transcript || '').slice(0, transcriptChars);
  const select = (id) => { setSelectedId(id); setPosition(0); setPlaying(false); };

  const headAuthor = selected.author || (D.voiceMemos && D.voiceMemos[0] && D.voiceMemos[0].author) || '';
  const durLabel = (s) => fmt(s);

  return (
    <div style={voiceStyles.app}>
      <div style={voiceStyles.list} className="scroll">
        <div style={voiceStyles.listHead}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Tous les enregistrements</div>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', marginTop: 2 }}>{safeMemos.length} mémos{headAuthor ? ' · ' + headAuthor : ''}</div>
        </div>
        {safeMemos.map(m => (
          <div key={m.id} onClick={() => select(m.id)} style={{ ...voiceStyles.row, ...(selectedId === m.id ? voiceStyles.rowActive : {}) }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{m.label}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)' }}>{m.date}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)' }}>{durLabel(m.durationSec)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={voiceStyles.player}>
        <div style={voiceStyles.playerInfo}>
          <div style={{ fontSize: 11, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{selected.author}{selected.role ? ' · ' + selected.role : ''}</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{selected.label}</h1>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Enregistré le {selected.date}{selected.context ? ' · ' + selected.context : ''}</div>
        </div>

        <div style={voiceStyles.waveBox}>
          <div style={voiceStyles.wave}>
            {wave.map((h, i) => {
              const reached = (i / wave.length) <= (position / selected.durationSec);
              return <div key={i} style={{ flex: 1, height: `${h * 100}%`, background: reached ? '#c4420f' : 'rgba(20,24,36,0.25)', minHeight: 2, borderRadius: 1 }} />;
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-mute)' }}>
            <span>{fmt(position)}</span><span>−{fmt(Math.max(0, selected.durationSec - position))}</span>
          </div>
        </div>

        <div style={voiceStyles.controls}>
          <button style={voiceStyles.skipBtn}>⏪ 15</button>
          <button style={voiceStyles.playBtn} onClick={() => setPlaying(!playing)}>{playing ? '⏸' : '▶'}</button>
          <button style={voiceStyles.skipBtn}>15 ⏩</button>
        </div>

        <div style={voiceStyles.transcriptBox}>
          <div style={{ fontSize: 10, color: 'var(--ink-faint)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 8 }}>
            Transcription {playing ? '· en direct' : (position > 0 ? '· lue' : '')}
          </div>
          {position === 0 && !playing ? (
            <div style={{ fontSize: 13, color: 'var(--ink-faint)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
              ▶ Appuie sur lecture pour entendre l'entretien.<br /><span style={{ fontSize: 11 }}>(la transcription apparaîtra au fil de l'écoute)</span>
            </div>
          ) : (
            <div style={voiceStyles.transcriptText}>{displayTranscript ? '«\u00A0' : ''}{displayTranscript}{playing && '▌'}{position >= selected.durationSec && displayTranscript ? '\u00A0»' : ''}</div>
          )}
        </div>
      </div>
    </div>
  );
}

const voiceStyles = {
  app: { display: 'flex', height: '100%', background: '#fff', overflow: 'hidden' },
  list: { width: 220, flexShrink: 0, background: 'rgba(244,242,238,0.6)', borderRight: '1px solid var(--rule)', overflowY: 'auto' },
  listHead: { padding: '14px 16px', borderBottom: '1px solid var(--rule)' },
  row: { padding: '12px 16px', borderBottom: '1px solid var(--rule)', cursor: 'pointer' },
  rowActive: { background: 'rgba(196,66,15,0.12)' },
  player: { flex: 1, padding: '28px 32px', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  playerInfo: { marginBottom: 24 },
  waveBox: { marginBottom: 18 },
  wave: { display: 'flex', alignItems: 'center', gap: 1.5, height: 70, padding: '0 4px' },
  controls: { display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center', marginBottom: 24 },
  playBtn: { width: 56, height: 56, borderRadius: '50%', background: '#1a2436', color: 'white', border: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  skipBtn: { background: 'transparent', border: 'none', color: 'var(--ink-soft)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-mono)' },
  transcriptBox: { flex: 1, background: '#f4f2ee', borderRadius: 8, padding: '16px 20px', overflow: 'auto' },
  transcriptText: { fontFamily: 'var(--font-display)', fontSize: 14, lineHeight: 1.7, color: 'var(--ink)', fontStyle: 'italic' }
};

window.LUMIO_APPS = window.LUMIO_APPS || {};
window.LUMIO_APPS.voice = VoiceApp;
