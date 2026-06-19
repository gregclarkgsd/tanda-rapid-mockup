import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertTriangle, BellRing, CalendarDays, Camera, CheckCircle2, ChevronRight, Clock3, FileSpreadsheet, Filter, Fingerprint, LockKeyhole, MapPin, Menu, Radio, ShieldCheck, Smartphone, TabletSmartphone, UsersRound, WifiOff } from 'lucide-react'
import { classifySample, summariseShift, type Geofence, type LocationSample } from './geo'
import './styles.css'

type Tab = 'Command' | 'Live Tracking' | 'Projects' | 'Rota' | 'Staff' | 'Timesheets' | 'Rules' | 'Mobile'

type Staff = {
  id: string
  name: string
  role: string
  project: string
  status: 'Clocked in' | 'Late' | 'Outside fence' | 'Off shift' | 'Pending approval' | 'Stale GPS'
  phone: string
  hours: number
  lastSeen: string
}

type Project = Geofence & {
  code: string
  staff: number
  inside: number
  exceptions: number
  address: string
  supervisor: string
}

const tabs: Tab[] = ['Command', 'Live Tracking', 'Projects', 'Rota', 'Staff', 'Timesheets', 'Rules', 'Mobile']

const projects: Project[] = [
  { id: 'cw', name: 'Canary Wharf Fit-Out', code: 'CW-184', lat: 51.5055, lng: -0.0235, radiusM: 125, staff: 42, inside: 39, exceptions: 3, address: 'Upper Bank Street, London E14', supervisor: 'Aaron Patel' },
  { id: 'myb', name: 'Marylebone Hotel', code: 'MYB-042', lat: 51.5226, lng: -0.1627, radiusM: 90, staff: 28, inside: 25, exceptions: 4, address: 'Marylebone Road, London NW1', supervisor: 'Nina Brooks' },
  { id: 'bat', name: 'Battersea Phase 3', code: 'BAT-319', lat: 51.4821, lng: -0.1449, radiusM: 160, staff: 51, inside: 47, exceptions: 2, address: 'Nine Elms Lane, London SW11', supervisor: 'Chris Morgan' },
  { id: 'kx', name: 'King’s Cross Labs', code: 'KX-077', lat: 51.5352, lng: -0.1257, radiusM: 110, staff: 19, inside: 18, exceptions: 1, address: 'Pancras Square, London N1C', supervisor: 'Fatima Khan' }
]

const staff: Staff[] = [
  { id: 'aaron', name: 'Aaron Patel', role: 'Supervisor', project: 'Canary Wharf Fit-Out', status: 'Clocked in', phone: '07700 900101', hours: 42.5, lastSeen: '1 min ago' },
  { id: 'mia', name: 'Mia O’Connor', role: 'Painter', project: 'Marylebone Hotel', status: 'Late', phone: '07700 900102', hours: 36.0, lastSeen: '6 min ago' },
  { id: 'lewis', name: 'Lewis Grant', role: 'Dryliner', project: 'Battersea Phase 3', status: 'Outside fence', phone: '07700 900103', hours: 44.0, lastSeen: 'now' },
  { id: 'fatima', name: 'Fatima Khan', role: 'Decorator', project: 'King’s Cross Labs', status: 'Clocked in', phone: '07700 900104', hours: 39.5, lastSeen: '2 min ago' },
  { id: 'jack', name: 'Jack Williams', role: 'Apprentice', project: 'Canary Wharf Fit-Out', status: 'Stale GPS', phone: '07700 900105', hours: 31.0, lastSeen: '18 min ago' },
  { id: 'sofia', name: 'Sofia Martins', role: 'Site Admin', project: 'Marylebone Hotel', status: 'Off shift', phone: '07700 900106', hours: 24.0, lastSeen: 'off shift' }
]

const activeFence = projects[0]
const locationSamples: LocationSample[] = [
  { workerId: 'lewis', projectId: 'bat', lat: 51.4821, lng: -0.1447, accuracyM: 16, capturedAt: '2026-06-19T08:02:00Z', permission: 'granted', battery: 0.82 },
  { workerId: 'lewis', projectId: 'bat', lat: 51.4844, lng: -0.1424, accuracyM: 19, capturedAt: '2026-06-19T10:18:00Z', permission: 'granted', battery: 0.64 },
  { workerId: 'lewis', projectId: 'bat', lat: 51.4849, lng: -0.1419, accuracyM: 21, capturedAt: '2026-06-19T10:27:00Z', permission: 'granted', battery: 0.63 },
  { workerId: 'lewis', projectId: 'bat', lat: 51.4823, lng: -0.1448, accuracyM: 14, capturedAt: '2026-06-19T10:41:00Z', permission: 'granted', battery: 0.60 }
]
const batSummary = summariseShift(locationSamples, projects[2])

const rules = [
  ['Grace period', '7 minutes after shift start before late flag', 'Active'],
  ['Rounding', 'Round payable time to nearest 15 minutes after approval', 'Draft'],
  ['Breaks', 'Auto deduct 30m after 6h or rota shift break', 'Active'],
  ['Overtime', 'Flag > 9.5 hours/day or > 45 hours/week', 'Active'],
  ['Missed clock-out', 'Auto exception if no clock-out after 12 hours', 'Active'],
  ['Leave zone', 'Alert manager if clocked-in worker is outside fence for 5+ minutes', 'Active'],
  ['Stale GPS', 'Alert if no location sample for 15 minutes while clocked in', 'Active'],
  ['GPS privacy', 'Track only while clocked in or inside scheduled shift window', 'Locked']
]

const timesheets = [
  ['Aaron Patel', 'CW-184', '08:00', '17:05', '9h 05m', 'Clean', 'Approve'],
  ['Mia O’Connor', 'MYB-042', '08:42', '17:00', '8h 18m', 'Late start', 'Review'],
  ['Lewis Grant', 'BAT-319', '07:55', '16:20', '8h 25m', 'Leave-zone event', 'Review'],
  ['Jack Williams', 'CW-184', '08:03', '—', 'Live', 'Stale GPS risk', 'Watch']
]

const parityItems = [
  ['Kiosk mode', 'Tablet PIN clock-in for shared site device', 'P1'],
  ['Selfie proof', 'Photo on clock-in/out; face match later', 'P1'],
  ['Payroll pack', 'XLSX/CSV by worker, project, trade, overtime and exceptions', 'P0'],
  ['Approvals', 'Supervisor then admin approval; locked once approved', 'P0'],
  ['Offline queue', 'Mobile saves events until signal returns', 'P2']
]

function Pill({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'good' | 'warn' | 'bad' | 'neutral' }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>
}

function Metric({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone?: string }) {
  return <Card className="metric"><div className={`metric-icon ${tone ?? ''}`}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div></Card>
}

function CommandCentre() {
  return <div className="grid command-grid">
    <Metric label="Staff capacity tracked" value="124" icon={<UsersRound size={22}/>} tone="blue" />
    <Metric label="Clocked in now" value="97" icon={<Clock3 size={22}/>} tone="green" />
    <Metric label="Live location alerts" value="7" icon={<BellRing size={22}/>} tone="amber" />
    <Metric label="Pending approval" value="23" icon={<ShieldCheck size={22}/>} tone="purple" />
    <Card className="wide">
      <div className="section-head"><div><p className="eyebrow">Live attendance board</p><h2>Today’s site position</h2></div><Pill tone="good"><Radio size={12}/> Evidence model</Pill></div>
      <div className="timeline">
        {projects.map((p) => <div className="timeline-row" key={p.code}>
          <div><strong>{p.name}</strong><span>{p.inside}/{p.staff} inside fence · {p.address}</span></div>
          <div className="bar"><i style={{width: `${(p.inside/p.staff)*100}%`}} /></div>
          <Pill tone={p.exceptions > 3 ? 'bad' : p.exceptions > 1 ? 'warn' : 'good'}>{p.exceptions} exceptions</Pill>
        </div>)}
      </div>
    </Card>
    <Card>
      <p className="eyebrow">Manager actions</p><h2>Needs attention</h2>
      <ul className="action-list">
        <li><AlertTriangle/> 3 clocked-in workers left geo-fence</li>
        <li><WifiOff/> 4 workers have stale/no GPS samples</li>
        <li><Clock3/> 6 staff late against rota grace period</li>
        <li><FileSpreadsheet/> 23 timesheet lines ready for approval</li>
      </ul>
    </Card>
    <Card>
      <p className="eyebrow">Spend replacement</p><h2>£7k/year target</h2>
      <div className="report-card"><b>100+</b><span>users without per-seat SaaS scaling</span></div>
      <div className="report-card"><b>4,216.5h</b><span>week-to-date labour evidence</span></div>
      <div className="report-card"><b>CSV/XLSX</b><span>payroll export pack planned first</span></div>
    </Card>
  </div>
}

function LiveTracking() {
  const lastSample = batSummary.samples[batSummary.samples.length - 1]
  return <div className="grid two">
    <Card>
      <div className="section-head"><div><p className="eyebrow">During-day monitoring</p><h2>Worker geofence timeline</h2></div><Pill tone={batSummary.alerts.length ? 'bad' : 'good'}>{batSummary.alerts.length} live alert</Pill></div>
      <div className="event-stream">
        {batSummary.samples.map((sample) => <div className={`event ${sample.state}`} key={sample.capturedAt}>
          <MapPin/><div><b>{new Date(sample.capturedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {sample.state.replace('_', ' ')}</b><span>{sample.distanceFromFenceM > 0 ? `${sample.distanceFromFenceM}m outside fence` : `${Math.abs(sample.distanceFromFenceM)}m inside fence`} · accuracy {sample.accuracyM}m · confidence {sample.confidence}</span></div>
        </div>)}
      </div>
      <div className="alert-box"><AlertTriangle/><div><b>Lewis Grant left BAT-319 zone for 23 minutes.</b><span>Flag as exception, ask worker for note, or approve with supervisor reason. Location is evidence with accuracy, not payroll truth until approved.</span></div></div>
    </Card>
    <Card>
      <p className="eyebrow">Alert policy</p><h2>What managers get told</h2>
      <div className="policy-list">
        <div><b>Leave-zone</b><span>Outside assigned project fence for 5+ minutes while clocked in.</span></div>
        <div><b>Stale signal</b><span>No mobile location sample for 15 minutes during active shift.</span></div>
        <div><b>GPS disabled</b><span>Worker revokes location permission after clock-in.</span></div>
        <div><b>Low accuracy</b><span>Accuracy worse than 100m; do not auto-fail, require review.</span></div>
      </div>
      <div className="map-evidence"><div className="map-dot"/><div><b>Current sample</b><span>{lastSample.distanceFromFenceM <= 0 ? 'Inside' : 'Outside'} · {Math.abs(lastSample.distanceFromFenceM)}m from fence · battery {Math.round((lastSample.battery ?? 0) * 100)}%</span></div></div>
    </Card>
    <Card className="wide"><p className="eyebrow">Audit trail</p><h2>Evidence events generated from heartbeats</h2><div className="detail-grid">{batSummary.events.map((event) => <div key={event.at}><b>{event.eventType}</b><span>{new Date(event.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {event.distanceFromFenceM}m from fence · severity {event.severity}</span></div>)}</div></Card>
  </div>
}

function Projects() {
  const selected = projects[0]
  return <div className="grid project-grid">{projects.map((p) => <Card key={p.code}>
    <div className="map-card"><MapPin/><div className="rings"><i/><i/><i/></div></div>
    <p className="eyebrow">{p.code}</p><h2>{p.name}</h2><p className="muted">{p.address}</p>
    <div className="split"><span>Geo-fence radius</span><b>{p.radiusM}m</b></div>
    <div className="split"><span>Assigned staff</span><b>{p.staff}</b></div>
    <div className="split"><span>Inside now</span><b>{p.inside}</b></div>
    <div className="split"><span>Supervisor</span><b>{p.supervisor}</b></div>
    <button className="secondary">Edit fence, rota & rules <ChevronRight size={16}/></button>
  </Card>)}<Card className="wide"><p className="eyebrow">Project detail mock</p><h2>{selected.name}</h2><div className="detail-grid"><div><b>Geo-fence</b><span>{selected.radiusM}m radius around {selected.address}</span></div><div><b>Assigned team</b><span>{selected.staff} staff · supervisor {selected.supervisor}</span></div><div><b>Rules attached</b><span>Leave-zone alert, stale GPS, grace period, overtime watchlist</span></div><div><b>Export mapping</b><span>Project code {selected.code} feeds payroll and labour-cost report</span></div></div></Card></div>
}

function Rota() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  return <Card><div className="section-head"><div><p className="eyebrow">Scheduling</p><h2>Rota grid by project and staff</h2></div><button>Publish rota</button></div>
    <div className="rota-grid">
      <div className="rota-head">Staff</div>{days.map(d => <div className="rota-head" key={d}>{d}</div>)}
      {staff.slice(0,5).map((s, i) => <React.Fragment key={s.name}><div className="person-cell"><b>{s.name}</b><span>{s.role}</span></div>{days.map((d, j) => <div className={`shift ${i===1 && j===0 ? 'warning' : ''}`} key={d+j}><b>{j === 4 ? '08:00-14:00' : '08:00-17:00'}</b><span>{s.project}</span></div>)}</React.Fragment>)}
    </div>
    <div className="saved"><b>Mobile rule</b><span>Workers only see projects assigned to today’s rota. Unscheduled clock-in requires exception reason.</span></div>
  </Card>
}

function StaffDirectory() {
  return <Card><div className="section-head"><div><p className="eyebrow">Staff reporting and details</p><h2>124 people · 6 shown</h2></div><div className="toolbar"><button className="secondary"><Filter size={16}/> Filter</button><button>Add staff</button></div></div>
    <div className="table">{staff.map(s => <div className="table-row" key={s.name}>
      <div className="avatar">{s.name.split(' ').map(x=>x[0]).join('')}</div><div><b>{s.name}</b><span>{s.role} · {s.phone} · last seen {s.lastSeen}</span></div><div>{s.project}</div><div>{s.hours}h this week</div><Pill tone={s.status==='Clocked in'?'good':s.status==='Late'||s.status==='Stale GPS'?'warn':s.status==='Outside fence'?'bad':'neutral'}>{s.status}</Pill>
    </div>)}</div>
    <div className="detail-panel"><p className="eyebrow">Access settings parity</p><h2>Aaron Patel</h2><div className="detail-grid"><div><b>Mobile clock-in</b><span>Allowed · GPS required · job required</span></div><div><b>Proof options</b><span>Selfie optional now; face match future toggle</span></div><div><b>Approver role</b><span>Supervisor can approve level-one site exceptions</span></div><div><b>Privacy</b><span>Location monitoring only while clocked in / scheduled</span></div></div></div>
  </Card>
}

function Timesheets() {
  return <Card><div className="section-head"><div><p className="eyebrow">Approval queue</p><h2>Timesheets, clock events and exceptions</h2></div><button>Approve clean lines</button></div>
    <div className="timesheet-list">{timesheets.map(t => <div className="timesheet" key={t[0]}><div><b>{t[0]}</b><span>{t[1]} · {t[2]} → {t[3]} · {t[4]}</span></div><Pill tone={t[5]==='Clean'?'good':t[5].includes('Leave')?'bad':'warn'}>{t[5]}</Pill><button className="secondary">{t[6]}</button></div>)}</div>
    <div className="detail-panel"><p className="eyebrow">Exception review mock</p><h2>Lewis Grant · leave-zone event</h2><div className="detail-grid"><div><b>Evidence</b><span>Exited fence 10:18 · returned 10:41 · GPS accuracy 14-21m</span></div><div><b>Manager decision</b><span>Approve with reason, reject, or request staff note</span></div><div><b>Audit evidence</b><span>Device, timestamp, coordinates, accuracy and manager override stored</span></div><div><b>Payroll state</b><span>Parked until approval workflow signs off payable hours</span></div></div></div>
  </Card>
}

function RulesReports() {
  return <div className="grid two"><Card><p className="eyebrow">Rule engine</p><h2>Attendance rules</h2>{rules.map(r => <div className="rule" key={r[0]}><div><b>{r[0]}</b><span>{r[1]}</span></div><Pill tone={r[2]==='Active'||r[2]==='Locked'?'good':r[2]==='Draft'?'neutral':'warn'}>{r[2]}</Pill></div>)}<div className="saved"><b>Selected rule editor mock</b><span>Leave-zone: alert manager after 5 minutes outside; do not alter payable time until manager approval.</span></div></Card><Card><p className="eyebrow">Custom reporting</p><h2>Saved report builder</h2><div className="builder"><label>Date range<select><option>This week</option><option>This month</option></select></label><label>Project<select><option>All projects</option><option>Canary Wharf Fit-Out</option></select></label><label>Exception type<select><option>All exceptions</option><option>Leave-zone</option><option>Stale GPS</option><option>Late</option></select></label><button><FileSpreadsheet size={16}/> Export CSV/XLSX</button></div><div className="saved"><b>Payroll pack</b><span>Worker hours, breaks, overtime, approvals and exceptions.</span></div><div className="saved"><b>Construction reports</b><span>Project labour hours · geo-fence breaches · lateness · supervisor sign-off.</span></div></Card><Card className="wide"><p className="eyebrow">Competitor parity backlog</p><h2>What we add after live attendance</h2><div className="parity-grid">{parityItems.map(item => <div key={item[0]}><b>{item[0]}</b><span>{item[1]}</span><Pill tone={item[2]==='P0'?'bad':item[2]==='P1'?'warn':'neutral'}>{item[2]}</Pill></div>)}</div></Card></div>
}

function MobileFlow() {
  const [clockedIn, setClockedIn] = useState(false)
  const mobileSample = classifySample({ workerId: 'aaron', projectId: activeFence.id, lat: 51.5057, lng: -0.0231, accuracyM: 12, capturedAt: '2026-06-19T08:04:00Z', permission: 'granted', battery: 0.78 }, activeFence)
  return <div className="mobile-wrap"><div className="phone"><div className="phone-top"><Smartphone/><b>SiteClock Staff</b></div><div className="login-card"><p className="eyebrow">Logged in</p><h2>Morning, Aaron</h2><p className="muted">Today you are rota’d to Canary Wharf Fit-Out.</p></div><div className="mobile-project"><b>Project</b><span>Canary Wharf Fit-Out · {mobileSample.state} fence · GPS accuracy {mobileSample.accuracyM}m</span></div><button className={`clock-button ${clockedIn?'out':''}`} onClick={() => setClockedIn(!clockedIn)}>{clockedIn ? 'Clock out' : 'Clock in'}</button><div className="heartbeat"><Radio/><div><b>{clockedIn ? 'Location heartbeat active' : 'Location starts after clock-in'}</b><span>{clockedIn ? 'Sends site-presence evidence while clocked in only.' : 'No all-day tracking when off shift.'}</span></div></div><div className="hours"><b>{clockedIn ? '02:14 live' : '38.5h'}</b><span>{clockedIn ? 'Current shift duration' : 'Approved this week'}</span></div><div className="mini-timesheets"><b>Timesheets</b><span>Mon 8.9h approved</span><span>Tue 9.1h approved</span><span>Wed live pending</span></div></div><Card className="mobile-side"><p className="eyebrow">Simple worker app</p><h2>Nothing more than needed</h2><div className="policy-list"><div><b>Step 1</b><span>Login with company invite.</span></div><div><b>Step 2</b><span>Pick only today’s rota project.</span></div><div><b>Step 3</b><span>Clock in/out and see hours.</span></div><div><b>Step 4</b><span>Timesheets are read-only unless correction requested.</span></div></div><div className="icon-row"><TabletSmartphone/><Camera/><Fingerprint/><LockKeyhole/></div></Card></div>
}

function App() {
  const [tab, setTab] = useState<Tab>('Command')
  const content = useMemo(() => ({ Command: <CommandCentre/>, 'Live Tracking': <LiveTracking/>, Projects: <Projects/>, Rota: <Rota/>, Staff: <StaffDirectory/>, Timesheets: <Timesheets/>, Rules: <RulesReports/>, Mobile: <MobileFlow/> }[tab]), [tab])
  return <main><aside><div className="brand"><div className="logo">SC</div><div><b>SiteClock Pro</b><span>GSD-owned T&A replacement</span></div></div><nav>{tabs.map(t => <button key={t} className={tab===t?'active':''} onClick={() => setTab(t)}>{t}</button>)}</nav><div className="aside-note"><b>Build target</b><span>Replace £7k/year clocking system with live site evidence, simple mobile clock-in and payroll-ready reporting.</span></div></aside><section className="workspace"><div className="demo-banner"><b>Build lane 1</b><span>Now modelling the real MVP spine: Supabase-ready data, live geofence heartbeats, leave-zone alerts, exception approvals and payroll exports. Still static front-end until backend credentials are connected.</span></div><header><div><p className="eyebrow">Time & attendance control centre</p><h1>{tab}</h1></div><div className="header-actions"><Pill tone="good"><CheckCircle2 size={13}/> 100+ user model</Pill><button>Invite manager</button></div></header>{content}</section></main>
}

createRoot(document.getElementById('root')!).render(<App />)
