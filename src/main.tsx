import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronRight, Clock3, FileSpreadsheet, Filter, MapPin, Menu, Radio, ShieldCheck, Smartphone, UsersRound } from 'lucide-react'
import './styles.css'

type Tab = 'Command' | 'Projects' | 'Rota' | 'Staff' | 'Timesheets' | 'Rules' | 'Mobile'

type Staff = {
  name: string
  role: string
  project: string
  status: 'Clocked in' | 'Late' | 'Outside fence' | 'Off shift' | 'Pending approval'
  phone: string
  hours: number
}

const tabs: Tab[] = ['Command', 'Projects', 'Rota', 'Staff', 'Timesheets', 'Rules', 'Mobile']

const staff: Staff[] = [
  { name: 'Aaron Patel', role: 'Supervisor', project: 'Canary Wharf Fit-Out', status: 'Clocked in', phone: '07700 900101', hours: 42.5 },
  { name: 'Mia O’Connor', role: 'Painter', project: 'Marylebone Hotel', status: 'Late', phone: '07700 900102', hours: 36.0 },
  { name: 'Lewis Grant', role: 'Dryliner', project: 'Battersea Phase 3', status: 'Outside fence', phone: '07700 900103', hours: 44.0 },
  { name: 'Fatima Khan', role: 'Decorator', project: 'King’s Cross Labs', status: 'Clocked in', phone: '07700 900104', hours: 39.5 },
  { name: 'Jack Williams', role: 'Apprentice', project: 'Canary Wharf Fit-Out', status: 'Pending approval', phone: '07700 900105', hours: 31.0 },
  { name: 'Sofia Martins', role: 'Site Admin', project: 'Marylebone Hotel', status: 'Off shift', phone: '07700 900106', hours: 24.0 }
]

const projects = [
  { name: 'Canary Wharf Fit-Out', code: 'CW-184', radius: '125m', staff: 42, inside: 39, exceptions: 3, address: 'Upper Bank Street, London E14' },
  { name: 'Marylebone Hotel', code: 'MYB-042', radius: '90m', staff: 28, inside: 25, exceptions: 4, address: 'Marylebone Road, London NW1' },
  { name: 'Battersea Phase 3', code: 'BAT-319', radius: '160m', staff: 51, inside: 47, exceptions: 2, address: 'Nine Elms Lane, London SW11' },
  { name: 'King’s Cross Labs', code: 'KX-077', radius: '110m', staff: 19, inside: 18, exceptions: 1, address: 'Pancras Square, London N1C' }
]

const rules = [
  ['Grace period', '7 minutes after shift start before late flag', 'Active'],
  ['Rounding', 'Round payable time to nearest 15 minutes after approval', 'Draft'],
  ['Overtime', 'Flag > 9.5 hours/day or > 45 hours/week', 'Active'],
  ['Missed clock-out', 'Auto exception if no clock-out after 12 hours', 'Active'],
  ['Outside geo-fence', 'Allow event but require manager approval reason', 'Active'],
  ['Unscheduled attendance', 'Clock-in allowed only with exception note', 'Review']
]

const timesheets = [
  ['Aaron Patel', 'CW-184', '08:00', '17:05', '9h 05m', 'Clean', 'Approve'],
  ['Mia O’Connor', 'MYB-042', '08:42', '17:00', '8h 18m', 'Late start', 'Review'],
  ['Lewis Grant', 'BAT-319', '07:55', '16:20', '8h 25m', 'Outside fence', 'Review'],
  ['Jack Williams', 'CW-184', '08:03', '—', 'Live', 'Missing clock-out risk', 'Watch']
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
    <Metric label="Exceptions today" value="14" icon={<AlertTriangle size={22}/>} tone="amber" />
    <Metric label="Pending approval" value="23" icon={<ShieldCheck size={22}/>} tone="purple" />
    <Card className="wide">
      <div className="section-head"><div><p className="eyebrow">Live attendance board</p><h2>Today’s site position</h2></div><Pill tone="good"><Radio size={12}/> Live evidence</Pill></div>
      <div className="timeline">
        {projects.map((p, i) => <div className="timeline-row" key={p.code}>
          <div><strong>{p.name}</strong><span>{p.inside}/{p.staff} inside fence · {p.address}</span></div>
          <div className="bar"><i style={{width: `${(p.inside/p.staff)*100}%`}} /></div>
          <Pill tone={p.exceptions > 3 ? 'bad' : p.exceptions > 1 ? 'warn' : 'good'}>{p.exceptions} exceptions</Pill>
        </div>)}
      </div>
    </Card>
    <Card>
      <p className="eyebrow">Manager actions</p><h2>Needs attention</h2>
      <ul className="action-list">
        <li><AlertTriangle/> 4 outside-fence clock-ins need approval reasons</li>
        <li><Clock3/> 6 staff late against rota grace period</li>
        <li><FileSpreadsheet/> 23 timesheet lines ready for approval</li>
        <li><CalendarDays/> 2 rota conflicts next Monday</li>
      </ul>
    </Card>
    <Card>
      <p className="eyebrow">Report snapshot</p><h2>Week-to-date labour</h2>
      <div className="report-card"><b>4,216.5h</b><span>Total recorded hours</span></div>
      <div className="report-card"><b>186.0h</b><span>Overtime flagged</span></div>
      <div className="report-card"><b>£—</b><span>Payroll export parked until rules approved</span></div>
    </Card>
  </div>
}

function Projects() {
  return <div className="grid project-grid">{projects.map((p) => <Card key={p.code}>
    <div className="map-card"><MapPin/><div className="rings"><i/><i/><i/></div></div>
    <p className="eyebrow">{p.code}</p><h2>{p.name}</h2><p className="muted">{p.address}</p>
    <div className="split"><span>Geo-fence radius</span><b>{p.radius}</b></div>
    <div className="split"><span>Assigned staff</span><b>{p.staff}</b></div>
    <div className="split"><span>Inside now</span><b>{p.inside}</b></div>
    <button className="secondary">Edit fence & rules <ChevronRight size={16}/></button>
  </Card>)}</div>
}

function Rota() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  return <Card><div className="section-head"><div><p className="eyebrow">Scheduling</p><h2>Rota grid by project and staff</h2></div><button>Publish rota</button></div>
    <div className="rota-grid">
      <div className="rota-head">Staff</div>{days.map(d => <div className="rota-head" key={d}>{d}</div>)}
      {staff.slice(0,5).map((s, i) => <React.Fragment key={s.name}><div className="person-cell"><b>{s.name}</b><span>{s.role}</span></div>{days.map((d, j) => <div className={`shift ${i===1 && j===0 ? 'warning' : ''}`} key={d+j}><b>{j === 4 ? '08:00-14:00' : '08:00-17:00'}</b><span>{s.project}</span></div>)}</React.Fragment>)}
    </div>
  </Card>
}

function StaffDirectory() {
  return <Card><div className="section-head"><div><p className="eyebrow">Staff reporting and details</p><h2>124 people · 6 shown</h2></div><div className="toolbar"><button className="secondary"><Filter size={16}/> Filter</button><button>Add staff</button></div></div>
    <div className="table">{staff.map(s => <div className="table-row" key={s.name}>
      <div className="avatar">{s.name.split(' ').map(x=>x[0]).join('')}</div><div><b>{s.name}</b><span>{s.role} · {s.phone}</span></div><div>{s.project}</div><div>{s.hours}h this week</div><Pill tone={s.status==='Clocked in'?'good':s.status==='Late'?'warn':s.status==='Outside fence'?'bad':'neutral'}>{s.status}</Pill>
    </div>)}</div>
  </Card>
}

function Timesheets() {
  return <Card><div className="section-head"><div><p className="eyebrow">Approval queue</p><h2>Timesheets, clock events and exceptions</h2></div><button>Approve clean lines</button></div>
    <div className="timesheet-list">{timesheets.map(t => <div className="timesheet" key={t[0]}><div><b>{t[0]}</b><span>{t[1]} · {t[2]} → {t[3]} · {t[4]}</span></div><Pill tone={t[5]==='Clean'?'good':t[5].includes('Outside')?'bad':'warn'}>{t[5]}</Pill><button className="secondary">{t[6]}</button></div>)}</div>
  </Card>
}

function RulesReports() {
  return <div className="grid two"><Card><p className="eyebrow">Rule engine</p><h2>Attendance rules</h2>{rules.map(r => <div className="rule" key={r[0]}><div><b>{r[0]}</b><span>{r[1]}</span></div><Pill tone={r[2]==='Active'?'good':r[2]==='Draft'?'neutral':'warn'}>{r[2]}</Pill></div>)}</Card><Card><p className="eyebrow">Custom reporting</p><h2>Saved report builder</h2><div className="builder"><label>Date range<select><option>This week</option><option>This month</option></select></label><label>Project<select><option>All projects</option><option>Canary Wharf Fit-Out</option></select></label><label>Exception type<select><option>All exceptions</option><option>Late</option><option>Outside fence</option></select></label><button><FileSpreadsheet size={16}/> Export CSV/XLSX</button></div><div className="saved"><b>Saved reports</b><span>Weekly payroll pack · Project cost hours · Geo-fence breaches · Overtime watchlist</span></div></Card></div>
}

function MobileFlow() {
  const [clockedIn, setClockedIn] = useState(false)
  return <div className="mobile-wrap"><div className="phone"><div className="phone-top"><Smartphone/><b>SiteClock Staff</b></div><div className="login-card"><p className="eyebrow">Logged in</p><h2>Morning, Aaron</h2><p className="muted">Today you are rota’d to Canary Wharf Fit-Out.</p></div><div className="mobile-project"><b>Project</b><span>Canary Wharf Fit-Out · inside fence · GPS accuracy 12m</span></div><button className={`clock-button ${clockedIn?'out':''}`} onClick={() => setClockedIn(!clockedIn)}>{clockedIn ? 'Clock out' : 'Clock in'}</button><div className="hours"><b>{clockedIn ? '02:14 live' : '38.5h'}</b><span>{clockedIn ? 'Current shift duration' : 'Approved this week'}</span></div><div className="mini-timesheets"><b>Timesheets</b><span>Mon 8.9h approved</span><span>Tue 9.1h approved</span><span>Wed live pending</span></div></div></div>
}

function App() {
  const [tab, setTab] = useState<Tab>('Command')
  const content = useMemo(() => ({ Command: <CommandCentre/>, Projects: <Projects/>, Rota: <Rota/>, Staff: <StaffDirectory/>, Timesheets: <Timesheets/>, Rules: <RulesReports/>, Mobile: <MobileFlow/> }[tab]), [tab])
  return <main><aside><div className="brand"><div className="logo">SC</div><div><b>SiteClock Pro</b><span>Rapid product mockup</span></div></div><nav>{tabs.map(t => <button key={t} className={tab===t?'active':''} onClick={() => setTab(t)}>{t}</button>)}</nav><div className="aside-note"><b>Tonight target</b><span>Full clickable mockup; Supabase/Vercel ready once tokens are connected.</span></div></aside><section className="workspace"><header><div><p className="eyebrow">Time & attendance control centre</p><h1>{tab}</h1></div><div className="header-actions"><Pill tone="good"><CheckCircle2 size={13}/> 100+ user model</Pill><button>Invite manager</button></div></header>{content}</section></main>
}

createRoot(document.getElementById('root')!).render(<App />)
