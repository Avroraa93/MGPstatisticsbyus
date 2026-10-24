'use client';

import { useEffect, useMemo, useState } from 'react';

const riders = [
  { name: 'Marc Márquez', number: '93', team: 'Ducati Lenovo Team', color: '#ef4444', note: 'Rider profile placeholder' },
  { name: 'Francesco Bagnaia', number: '63', team: 'Ducati Lenovo Team', color: '#e11d48', note: 'Rider profile placeholder' },
  { name: 'Jorge Martín', number: '89', team: 'Aprilia Racing', color: '#f97316', note: 'Rider profile placeholder' },
  { name: 'Fabio Quartararo', number: '20', team: 'Monster Energy Yamaha', color: '#38bdf8', note: 'Rider profile placeholder' }
];
const tracks = [
  { id: 'phillip', name: 'Phillip Island', country: 'Australia' },
  { id: 'mugello', name: 'Mugello', country: 'Italy' },
  { id: 'misano', name: 'Misano', country: 'Italy' },
  { id: 'sepang', name: 'Sepang', country: 'Malaysia' },
  { id: 'assen', name: 'Assen', country: 'Netherlands' },
  { id: 'catalunya', name: 'Barcelona-Catalunya', country: 'Spain' }
];
const weatherLabel = code => ({0:'Clear sky',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Rime fog',51:'Light drizzle',53:'Drizzle',55:'Dense drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',80:'Rain showers',81:'Showers',82:'Heavy showers',95:'Thunderstorm'})[code] || 'Variable conditions';
const fmt = (v, suffix='') => v == null ? '—' : `${Math.round(v * 10) / 10}${suffix}`;

export default function Home() {
  const [tab, setTab] = useState('overview');
  const [track, setTrack] = useState('phillip');
  const [weather, setWeather] = useState(null);
  const [weatherState, setWeatherState] = useState('loading');
  const [wetTrack, setWetTrack] = useState(25);
  const [form, setForm] = useState(70);
  const [racePace, setRacePace] = useState(70);
  const [activeRider, setActiveRider] = useState('Marc Márquez');

  useEffect(() => {
    let cancelled = false;
    setWeatherState('loading');
    fetch(`/api/weather?circuit=${track}`).then(r => { if (!r.ok) throw new Error('Weather unavailable'); return r.json(); })
      .then(data => { if (!cancelled) { setWeather(data); setWeatherState('ready'); } })
      .catch(() => { if (!cancelled) setWeatherState('error'); });
    return () => { cancelled = true; };
  }, [track]);

  const prediction = useMemo(() => {
    // Illustrative heuristic only: not a statistical MotoGP model.
    const raw = Math.max(1, Math.min(99, 18 + (form - 50) * 0.42 + (racePace - 50) * 0.34 - wetTrack * 0.12));
    return Math.round(raw);
  }, [form, racePace, wetTrack]);
  const current = weather?.current;
  const currentHour = weather?.hourly?.time?.[0];
  const upcoming = weather?.hourly?.time?.slice(0, 8).map((time, i) => ({
    time, temp: weather.hourly.temperature_2m[i], rain: weather.hourly.precipitation_probability[i], wind: weather.hourly.wind_speed_10m[i]
  })) || [];

  const nav = [['overview','Overview'],['riders','Riders'],['race','Race replay'],['news','News & injuries']];
  return <main className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="APEX GP home"><span className="brand-mark">A</span><span>APEX <b>GP</b><small>MOTORSPORT INTELLIGENCE</small></span></a>
      <div className="side-label">WORKSPACE</div>
      <nav>{nav.map(([id,label]) => <button key={id} className={`nav-item ${tab===id?'selected':''}`} onClick={() => setTab(id)}><span className="nav-dot" />{label}{id==='news' && <span className="soon">FEED</span>}</button>)}</nav>
      <div className="side-card"><div className="live-indicator"><i/> SYSTEM STATUS</div><strong>Data integrations</strong><p>Weather API connected. Race timing and medical feeds not connected yet.</p><span className="status-pill">PARTIAL DATA</span></div>
      <div className="sidebar-bottom">INDEPENDENT FAN PROJECT<br/>Not affiliated with MotoGP™</div>
    </aside>

    <section className="main-content" id="top">
      <header className="topbar"><div className="breadcrumb">APEX GP <span>/</span> {nav.find(n=>n[0]===tab)?.[1]}</div><div className="top-actions"><span className="api-status"><i/> Weather API</span><button className="avatar" title="APEX GP">AG</button></div></header>
      <div className="page-wrap">
        <section className="hero"><div className="hero-copy"><div className="eyebrow"><span className="red-line"/> RACE INTELLIGENCE PLATFORM</div><h1>Every lap.<br/><em>Every variable.</em></h1><p>Understand the race beyond the leaderboard — conditions, form and data, in one place.</p><div className="hero-actions"><button className="primary-btn" onClick={() => setTab('race')}>Explore race replay <span>↗</span></button><button className="text-btn" onClick={() => setTab('riders')}>Explore riders →</button></div></div><div className="hero-art" aria-hidden="true"><div className="track-ring ring-one"/><div className="track-ring ring-two"/><div className="track-ring ring-three"/><div className="hero-number">93</div><div className="hero-tag">RACE<br/>ANALYTICS</div><div className="hero-coordinate">43°59′N&nbsp; 11°22′E</div></div></section>

        {tab==='overview' && <>
          <div className="section-head"><div><div className="eyebrow">01 / TRACK CONDITIONS</div><h2>Weather intelligence</h2></div><label className="track-select-label">CIRCUIT<select value={track} onChange={e=>setTrack(e.target.value)}>{tracks.map(t=><option value={t.id} key={t.id}>{t.name} · {t.country}</option>)}</select></label></div>
          <div className="weather-grid">
            <article className="panel weather-main"><div className="panel-top"><span className="panel-label">CURRENT CONDITIONS · TRACK AREA</span><span className={`data-tag ${weatherState==='ready'?'live':'muted'}`}><i/>{weatherState==='ready'?'LIVE WEATHER':'FETCHING DATA'}</span></div>
              {weatherState==='loading' ? <div className="loading-block">Loading weather forecast…</div> : weatherState==='error' ? <div className="loading-block">Weather unavailable. Check your connection and retry by changing the circuit.</div> : <><div className="weather-reading"><div><span className="temperature">{fmt(current?.temperature_2m,'°')}</span><span className="unit">C</span><div className="weather-desc">{weatherLabel(current?.weather_code)}</div></div><div className="weather-symbol">{[0,1].includes(current?.weather_code)?'☼':[2,3].includes(current?.weather_code)?'◒':[61,63,65,80,81,82].includes(current?.weather_code)?'☂':'◌'}</div></div><div className="weather-stats"><div><span>HUMIDITY</span><strong>{fmt(current?.relative_humidity_2m,'%')}</strong></div><div><span>WIND</span><strong>{fmt(current?.wind_speed_10m,' km/h')}</strong></div><div><span>GUSTS</span><strong>{fmt(current?.wind_gusts_10m,' km/h')}</strong></div><div><span>RAIN</span><strong>{fmt(current?.precipitation,' mm')}</strong></div></div><div className="source-note">Source: Open-Meteo · air weather forecast, not measured track-surface conditions. Updated {weather?.fetchedAt ? new Date(weather.fetchedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '—'}.</div></>}
            </article>
            <article className="panel forecast-panel"><div className="panel-top"><span className="panel-label">NEXT HOURS</span><span className="muted-text">Local circuit time</span></div>{weatherState==='ready' ? <div className="forecast-list">{upcoming.map((h,i)=><div className="forecast-row" key={h.time}><span className="forecast-time">{h.time.slice(11,16)}</span><span className="forecast-weather">{fmt(h.temp,'°')}</span><span className="rain-chance">{fmt(h.rain,'%')} rain</span><span className="wind-mini">{fmt(h.wind)} km/h</span></div>)}</div>:<div className="loading-block">Hourly forecast appears here.</div>}<div className="source-note">Weather data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · CC BY 4.0</div></article>
          </div>

          <div className="section-head prediction-head"><div><div className="eyebrow">02 / MODEL LAB</div><h2>Win probability explorer</h2><p className="section-sub">Adjust assumptions to explore how conditions could affect a rider.</p></div><span className="demo-badge">ILLUSTRATIVE MODEL</span></div>
          <div className="prediction-grid"><article className="panel probability-panel"><div className="panel-top"><span className="panel-label">SELECTED RIDER</span><select className="rider-select" value={activeRider} onChange={e=>setActiveRider(e.target.value)}>{riders.map(r=><option key={r.name}>{r.name}</option>)}</select></div><div className="probability-body"><div className="probability-ring" style={{'--prob':`${prediction}%`}}><div><strong>{prediction}%</strong><span>WIN CHANCE</span></div></div><div className="probability-copy"><h3>{activeRider}</h3><p>This number is a UI demonstration, not a real prediction. It is not trained on verified race results and must not be used as a factual forecast.</p><div className="confidence"><span>Model confidence</span><strong>Not evaluated</strong></div></div></div><div className="model-disclaimer">A real model requires historical qualifying, lap times, grid position, tyre strategy, rider/team form and weather data.</div></article>
            <article className="panel controls-panel"><div className="panel-top"><span className="panel-label">SCENARIO CONTROLS</span><span className="reset-link" onClick={()=>{setForm(70);setRacePace(70);setWetTrack(25)}}>Reset</span></div>{[["Recent form",form,setForm],["Race pace",racePace,setRacePace],["Wet-track impact",wetTrack,setWetTrack]].map(([label,value,setter])=><label className="slider-control" key={label}><span>{label}<b>{value}/100</b></span><input type="range" min="0" max="100" value={value} onChange={e=>setter(Number(e.target.value))}/><small>{label==='Recent form'?'Illustrative recent performance input':label==='Race pace'?'Illustrative long-run pace input':'Scenario sensitivity only'}</small></label>)}<div className="controls-foot">Scenario output changes locally; no data is sent or saved.</div></article></div>

          <div className="section-head"><div><div className="eyebrow">03 / RIDER DIRECTORY</div><h2>Rider profiles</h2></div><button className="text-btn" onClick={()=>setTab('riders')}>View all →</button></div>
          <div className="rider-grid">{riders.map(r=><button className="rider-card" key={r.number} onClick={()=>{setActiveRider(r.name);setTab('riders')}}><span className="rider-stripe" style={{background:r.color}}/><span className="rider-number">{r.number}</span><span className="rider-info"><strong>{r.name}</strong><small>{r.team}</small></span><span className="rider-arrow">↗</span></button>)}</div>
          <div className="section-head"><div><div className="eyebrow">04 / RACE CENTRE</div><h2>Replay & race history</h2><p className="section-sub">Build the timeline from official lap and sector feeds.</p></div></div>
          <article className="panel replay-panel"><div className="replay-map"><svg viewBox="0 0 500 220" role="img" aria-label="Illustrative circuit outline"><path d="M42 145 C35 105 77 53 128 64 C178 74 161 123 206 134 C252 146 259 45 318 45 C373 45 373 98 423 93 C469 88 469 151 425 170 C378 190 333 144 296 164 C256 185 225 195 183 169 C143 145 101 191 65 175 C52 170 45 160 42 145 Z" fill="none" stroke="#e84444" strokeWidth="3" strokeDasharray="7 5"/><circle cx="42" cy="145" r="5" fill="#fff"/><text x="54" y="136" fill="#fff" fontSize="10">START / FINISH</text></svg><span className="map-watermark">TRACK MAP<br/>PLACEHOLDER</span></div><div className="replay-copy"><span className="demo-badge">REPLAY DATA NOT CONNECTED</span><h3>Lap-by-lap replay</h3><p>Once a licensed timing source is connected, this area can display lap positions, time gaps, overtakes, retirements and sector-by-sector changes.</p><button className="outline-btn" onClick={()=>setTab('race')}>Open replay centre →</button></div></article>
        </>}

        {tab==='riders' && <><div className="section-head"><div><div className="eyebrow">RIDER DATABASE</div><h2>Rider profiles</h2><p className="section-sub">Starter directory. Verified season statistics and injury updates will be added when sources are connected.</p></div></div><div className="rider-grid expanded">{riders.map(r=><article className="panel rider-detail" key={r.number}><span className="rider-stripe" style={{background:r.color}}/><div className="detail-number">{r.number}</div><h3>{r.name}</h3><p>{r.team}</p><div className="detail-stats"><div><small>Season points</small><strong>Not connected</strong></div><div><small>Latest injury update</small><strong>Official feed required</strong></div><div><small>Race pace trend</small><strong>Awaiting data</strong></div></div><button className="outline-btn" onClick={()=>{setActiveRider(r.name);setTab('overview')}}>Open model lab →</button></article>)}</div></>}

        {tab==='race' && <><div className="section-head"><div><div className="eyebrow">RACE ARCHIVE</div><h2>Race replay centre</h2><p className="section-sub">Historical replay is not simulated as if it were official data. This screen is ready for an authorised lap-timing feed.</p></div><span className="demo-badge">SOURCE NEEDED</span></div><article className="panel race-empty"><div className="replay-map large"><svg viewBox="0 0 500 220" role="img" aria-label="Placeholder track outline"><path d="M42 145 C35 105 77 53 128 64 C178 74 161 123 206 134 C252 146 259 45 318 45 C373 45 373 98 423 93 C469 88 469 151 425 170 C378 190 333 144 296 164 C256 185 225 195 183 169 C143 145 101 191 65 175 C52 170 45 160 42 145 Z" fill="none" stroke="#e84444" strokeWidth="3" strokeDasharray="7 5"/></svg></div><h3>Lap timing integration required</h3><p>Target data: session classification, lap number, lap time, sector times, gaps, position history and race control events. Historical records will be tagged with their source and session timestamp.</p><div className="race-steps"><span>01 · Connect timing provider</span><span>02 · Import historical sessions</span><span>03 · Build replay timeline</span></div></article></>}

        {tab==='news' && <><div className="section-head"><div><div className="eyebrow">VERIFIED UPDATES</div><h2>News & rider health</h2><p className="section-sub">Only public statements from official teams, MotoGP and reputable news sources should appear here.</p></div></div><article className="panel news-empty"><div className="news-icon">◎</div><h3>News feed not connected</h3><p>No live injury or rider-condition claims are shown until an authorised source is configured. Each future item will include source, publication time and last checked time.</p><a className="outline-link" href="https://www.motogp.com/" target="_blank" rel="noreferrer">Open official MotoGP website ↗</a></article></>}

        <footer className="footer"><span>© {new Date().getFullYear()} APEX GP · Independent motorsport analytics project</span><span>Weather by Open-Meteo · <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Data attribution</a></span></footer>
      </div>
    </section>
  </main>;
}
