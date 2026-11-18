import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Play, Square, Settings, Activity, ShieldAlert,
  CheckCircle2, Sliders, RotateCcw, BookOpen, Wrench, Gauge
} from 'lucide-react';

const TABS = [
  { id: 'caustic', name: '1. Caustic Soda (TK-801)' },
  { id: 'reactivation', name: '2. Reactivation Gas (C-801)' },
  { id: 'sealoil', name: '3. Seal Oil (D-811)' },
  { id: 'brine', name: '4. Brine System (PK-821)' },
  { id: 'water_n2', name: '5. Water & Nitrogen' },
  { id: 'steam', name: '6. Steam & Hot Water' },
  { id: 'air', name: '7. Plant & Inst. Air' },
  { id: 'flare', name: '8. Flare & Recovery' },
];

const SCENARIOS = [
  {
    id: 'sc1',
    tab: 'caustic',
    title: 'Sự cố 1: Kẹt mở van nước DMW (FV-804) -> Nguy cơ tràn bồn TK-801',
    desc: 'Van FV-804 vô tình mở 100%, mức bồn LI-801 tăng nhanh vượt 82.4% (H) tiến tới 93.1% (I-801).',
    sop: [
      'Boardman: Chuyển FIC-804 sang chế độ MAN và đóng MV về 0%.',
      'Field Operator: Đóng van chặn tay đường cấp DMW vào MX-8001.',
      'Lấy mẫu kiểm tra nồng độ xút trong TK-801 đảm bảo đạt 25% wt trước khi cấp cho M-721.'
    ]
  },
  {
    id: 'sc2',
    tab: 'sealoil',
    title: 'Sự cố 2: Nghẹt lọc dầu làm kín STR-811A -> Áp suất sau lọc PZI-813 tụt thấp',
    desc: 'Bộ lọc STR-811A bị bẩn làm PI-812 tăng >14 kg/cm2g trong khi PZI-813 giảm dưới 11 kg/cm2g (nguy cơ trip I-811 ở 10 kg/cm2g).',
    sop: [
      'Field Operator: Kiểm tra áp suất chênh lệch lọc và áp suất xả bơm PI-812.',
      'Chuyển đổi van sang bộ lọc dự phòng sạch STR-811B.',
      'Cô lập và vệ sinh lõi lọc STR-811A.'
    ]
  },
  {
    id: 'sc3',
    tab: 'reactivation',
    title: 'Sự cố 3: Quá nhiệt bộ gia nhiệt khí tái sinh E-801 (TIC-801 > 250°C)',
    desc: 'Van hơi cao áp TV-801 mở quá mức khiến nhiệt độ đầu ra E-801 vượt 250°C (nguy cơ tự bốc cháy Hexane).',
    sop: [
      'Boardman: Đặt TIC-801 sang chế độ MAN và giảm độ mở van TV-801.',
      'Field Operator: Kiểm tra nhiệt kế tại chỗ TG-8003, điều tiết van bypass hoặc cô lập hơi HS nếu van kẹt.'
    ]
  },
  {
    id: 'sc4',
    tab: 'air',
    title: 'Sự cố 4: Sụt áp khí điều khiển Instrument Air (PZI-873 <= 4.2 kg/cm2g)',
    desc: 'Mất nguồn cấp IA từ nhà máy PP (Package C), áp suất PZI-873 tụt kích hoạt khóa liên động ESD I-001.',
    sop: [
      'Boardman: Xác nhận tình trạng với phòng điều khiển nhà máy PP (Upstream).',
      'Field Operator: Kiểm tra van chặn tại ranh giới B/L và đồng hồ PG-8701.',
      'Khôi phục áp suất IA > 7.0 kg/cm2g trước khi Reset ESD I-001.'
    ]
  },
  {
    id: 'sc5',
    tab: 'steam',
    title: 'Sự cố 5: Trip bơm nước khử quá nhiệt P-853A -> Quá nhiệt hơi HS/MS/LS',
    desc: 'Bơm P-853A dừng đột ngột làm áp suất PIC-856 tụt dưới 45 kg/cm2g, nhiệt độ hơi sau ZZ-841/842/843 tăng cao.',
    sop: [
      'Boardman: Kiểm tra trạng thái chạy của P-853A/B và giám sát TI-862, TI-863, TI-864.',
      'Field Operator: Khởi động ngay bơm dự phòng P-853B để khôi phục áp suất nước khử quá nhiệt.'
    ]
  },
  {
    id: 'sc6',
    tab: 'brine',
    title: 'Sự cố 6: Trip bơm nước muối P-821A -> Mất lạnh hệ thống thu hồi Hexane',
    desc: 'Bơm P-821A ngừng chạy khiến lưu lượng FI-823 giảm sâu dưới 156.83 t/h (trip I-821 ở 122 t/h).',
    sop: [
      'Field Operator: Khởi động ngay bơm nước muối dự phòng P-821B.',
      'Boardman: Đối chiếu lưu lượng FI-823 và áp suất PI-821 (duy trì 5.0 kg/cm2g).'
    ]
  },
  {
    id: 'sc7',
    tab: 'flare',
    title: 'Sự cố 7: Mức cao bình tách lỏng Flare KO Drum D-881 (LZI-881 > 73.3%)',
    desc: 'Ngưng tụ Hexane tích tụ trong D-881 vượt mức báo động cao 73.3%, nguy cơ kích hoạt LZA-881 -> I-001.',
    sop: [
      'Field Operator: Kiểm tra kính thủy LG-8801 tại hiện trường.',
      'Xác nhận với Boardman và khởi động bơm P-881 để bơm Hexane ngưng tụ về D-701.'
    ]
  }
];

const INITIAL_STATE = {
  // Caustic
  li801: 52.0,
  fv804: { mode: 'AUTO', mv: 35, stuck: false },
  p803: true,
  p801a: true,
  p801b: false,
  fi703: 18.5,
  // Reactivation
  c801: true,
  pzi815: 3.5,
  tic801: 220.0,
  tv801: { mode: 'AUTO', mv: 45, stuck: false },
  pic801: 3.0,
  pv801: { mode: 'AUTO', mv: 20 },
  lic802: 30.0,
  lv802: { mode: 'AUTO', mv: 30 },
  ti802: 40.0,
  // Seal Oil
  pi811: 10.0,
  li811: 55.0,
  p811a: true,
  p811b: false,
  pi812: 12.5,
  pzi813: 12.1,
  filter811: 'A', // 'A' or 'B'
  filter811AClogged: false,
  // Brine
  p821a: true,
  p821b: false,
  pi821: 5.0,
  fi823: 174.25,
  ti821: -10.0,
  c821: true,
  // Water & N2
  pi833: 7.0, // TW
  pi832: 7.0, // PTW
  pi837: 7.0, // DMW
  pi861: 13.0, // MN1
  pi863: 9.0,  // MN2
  pi865: 2.0,  // LN
  // Steam & Hot Water
  pi851: 42.0,
  ti862: 254.0,
  ti863: 212.0,
  ti864: 159.0,
  p853a: true,
  p853b: false,
  pic856: 46.8,
  p851a: true,
  tic851: 75.0,
  // Air
  paPress: 7.0,
  pzi873: 8.2,
  iaSupplyLoss: false,
  // Flare
  c881a: true,
  c881b: false,
  pic881: 125.0,
  lzi881: 42.0,
  p881: false,
  pic882: 3.0,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('caustic');
  const [sim, setSim] = useState(INITIAL_STATE);
  const [selectedControl, setSelectedControl] = useState(null);
  const [activeScenario, setActiveScenario] = useState(null);
  const [alarms, setAlarms] = useState([]);

  // Physics & Control Loop Simulation (500ms tick)
  useEffect(() => {
    const timer = setInterval(() => {
      setSim((prev) => {
        const next = { ...prev };

        // 1. Caustic Soda Physics
        const inflow = (next.fv804.mv / 100) * 1.8 + (next.p803 ? 0.4 : 0);
        const outflow = (next.p801a || next.p801b) ? 0.65 : 0;
        if (next.li801 >= 93.1) {
          // Interlock I-801 trips inlet
          next.p803 = false;
          if (!next.fv804.stuck) next.fv804 = { ...next.fv804, mv: 0 };
        }
        next.li801 = Math.max(0, Math.min(100, next.li801 + (inflow - outflow) * 0.25));
        next.fi703 = (next.p801a || next.p801b) ? (next.li801 > 2 ? 18.5 : 0) : 0;

        // 2. Reactivation Gas Physics
        if (next.c801) {
          next.pzi815 = 3.5 + (next.tv801.mv - 45) * 0.005;
          const targetTemp = 120 + (next.tv801.mv / 100) * 222;
          next.tic801 += (targetTemp - next.tic801) * 0.15;
          if (next.tv801.mode === 'AUTO' && !next.tv801.stuck) {
            const err = 220 - next.tic801;
            next.tv801 = { ...next.tv801, mv: Math.max(0, Math.min(100, next.tv801.mv + err * 0.1)) };
          }
        } else {
          next.pzi815 = Math.max(0, next.pzi815 - 0.3);
          next.tic801 += (40 - next.tic801) * 0.1;
        }

        // 3. Seal Oil Physics
        const oilPumpRunning = next.p811a || next.p811b;
        if (oilPumpRunning) {
          const isClogged = next.filter811 === 'A' && next.filter811AClogged;
          next.pi812 += ((isClogged ? 14.8 : 12.5) - next.pi812) * 0.25;
          next.pzi813 += ((isClogged ? 10.3 : 12.1) - next.pzi813) * 0.25;
        } else {
          next.pi812 = Math.max(0, next.pi812 - 1.2);
          next.pzi813 = Math.max(0, next.pzi813 - 1.2);
        }

        // 4. Brine Physics
        const brinePumpRunning = next.p821a || next.p821b;
        if (brinePumpRunning) {
          next.pi821 += (5.0 - next.pi821) * 0.25;
          next.fi823 += (174.25 - next.fi823) * 0.25;
          next.ti821 += ((next.c821 ? -10.0 : -2.0) - next.ti821) * 0.15;
        } else {
          next.pi821 = Math.max(0, next.pi821 - 0.8);
          next.fi823 = Math.max(0, next.fi823 - 25);
          next.ti821 += (-2.0 - next.ti821) * 0.15;
        }

        // 5. Steam Desuperheater Physics
        const desupRunning = next.p853a || next.p853b;
        next.pic856 += ((desupRunning ? 46.8 : 12.0) - next.pic856) * 0.25;
        next.ti862 += ((desupRunning ? 254.0 : 340.0) - next.ti862) * 0.15;
        next.ti863 += ((desupRunning ? 212.0 : 275.0) - next.ti863) * 0.15;
        next.ti864 += ((desupRunning ? 159.0 : 198.0) - next.ti864) * 0.15;

        // 6. Instrument Air Physics
        next.pzi873 += ((next.iaSupplyLoss ? 3.8 : 8.2) - next.pzi873) * 0.2;

        // 7. Flare Physics
        const flareIn = 0.25;
        const flareOut = next.p881 ? 1.1 : 0;
        next.lzi881 = Math.max(10, Math.min(95, next.lzi881 + (flareIn - flareOut) * 0.3));
        if (next.lzi881 <= 15 && next.p881) next.p881 = false;

        return next;
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);

  // Alarm Evaluation
  useEffect(() => {
    const list = [];
    if (sim.li801 >= 93.1) list.push({ tag: 'LI-801', level: 'HH / I-801', msg: `Mức bồn xút TK-801 quá cao (${sim.li801.toFixed(1)}%) - TRIP I-801` });
    else if (sim.li801 >= 82.4) list.push({ tag: 'LI-801', level: 'H', msg: `Cảnh báo mức cao TK-801 (${sim.li801.toFixed(1)}%)` });
    if (sim.li801 <= 2.3) list.push({ tag: 'LI-801', level: 'L', msg: `Cảnh báo mức thấp TK-801 (${sim.li801.toFixed(1)}%)` });

    if (sim.tic801 >= 250) list.push({ tag: 'TIC-801', level: 'H', msg: `Quá nhiệt khí tái sinh đầu ra E-801 (${sim.tic801.toFixed(1)}°C)` });
    if (sim.pi812 >= 14) list.push({ tag: 'PI-812', level: 'H', msg: `Áp suất xả bơm dầu làm kín cao (${sim.pi812.toFixed(1)} kg/cm2g)` });
    if (sim.pzi813 <= 10) list.push({ tag: 'PZI-813', level: 'LL / I-811', msg: `Áp suất dầu làm kín sau lọc quá thấp (${sim.pzi813.toFixed(1)} kg/cm2g)` });
    else if (sim.pzi813 <= 11) list.push({ tag: 'PZI-813', level: 'L', msg: `Áp suất dầu làm kín sau lọc thấp (${sim.pzi813.toFixed(1)} kg/cm2g)` });

    if (sim.fi823 <= 122) list.push({ tag: 'FI-823', level: 'LL / I-821', msg: `Lưu lượng nước muối quá thấp (${sim.fi823.toFixed(1)} t/h)` });
    else if (sim.fi823 <= 156.83) list.push({ tag: 'FI-823', level: 'L', msg: `Lưu lượng nước muối thấp (${sim.fi823.toFixed(1)} t/h)` });

    if (sim.ti862 >= 264) list.push({ tag: 'TI-862', level: 'H', msg: `Nhiệt độ hơi HS sau khử quá nhiệt cao (${sim.ti862.toFixed(1)}°C)` });
    if (sim.pzi873 <= 4.2) list.push({ tag: 'PZI-873', level: 'LL / I-001', msg: `MẤT KHÍ ĐIỀU KHIỂN IA (${sim.pzi873.toFixed(2)} kg/cm2g) -> EMERGENCY SHUTDOWN I-001` });
    else if (sim.pzi873 <= 5.0) list.push({ tag: 'PZI-873', level: 'L', msg: `Áp suất khí điều khiển IA thấp (${sim.pzi873.toFixed(2)} kg/cm2g)` });

    if (sim.lzi881 >= 73.3) list.push({ tag: 'LZI-881', level: 'H / LZA-881', msg: `Mức bình Flare KO Drum D-881 cao (${sim.lzi881.toFixed(1)}%)` });

    setAlarms(list);
  }, [sim]);

  const injectScenario = (sc) => {
    setActiveScenario(sc);
    setActiveTab(sc.tab);
    setSim((prev) => {
      const s = { ...INITIAL_STATE };
      if (sc.id === 'sc1') {
        s.li801 = 80.5;
        s.fv804 = { mode: 'MAN', mv: 100, stuck: true };
      } else if (sc.id === 'sc2') {
        s.filter811AClogged = true;
      } else if (sc.id === 'sc3') {
        s.tv801 = { mode: 'MAN', mv: 95, stuck: true };
        s.tic801 = 252.0;
      } else if (sc.id === 'sc4') {
        s.iaSupplyLoss = true;
        s.pzi873 = 4.6;
      } else if (sc.id === 'sc5') {
        s.p853a = false;
        s.p853b = false;
      } else if (sc.id === 'sc6') {
        s.p821a = false;
        s.p821b = false;
      } else if (sc.id === 'sc7') {
        s.lzi881 = 74.5;
      }
      return s;
    });
  };

  const resetAll = () => {
    setSim(INITIAL_STATE);
    setActiveScenario(null);
    setSelectedControl(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header & Alarm Annunciator */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">
              DCS SIMULATOR — SECTION #800 (UTILITIES)
            </h1>
            <p className="text-xs text-slate-400">HDPE Plant Process & Troubleshooting Training Console</p>
          </div>
        </div>

        {/* Alarm Banner */}
        <div className="flex-1 max-w-2xl">
          {alarms.length === 0 ? (
            <div className="bg-emerald-950/60 border border-emerald-700/50 rounded-lg px-4 py-2 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>SYSTEM NORMAL — Tất cả thông số cụm 800 trong giới hạn an toàn</span>
            </div>
          ) : (
            <div className="bg-red-950/90 border border-red-500 rounded-lg px-4 py-2 flex items-center justify-between gap-3 animate-pulse">
              <div className="flex items-center gap-2 text-red-200 text-sm font-semibold">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>[{alarms[0].level}] {alarms[0].msg}</span>
              </div>
              {alarms.length > 1 && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  +{alarms.length - 1} Alarms
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={resetAll}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm border border-slate-700 transition"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Normal
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-900/70 border-b border-slate-800 px-4 py-2 flex gap-1.5 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition ${
              activeTab === t.id
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
            }`}
          >
            {t.name}
          </button>
        ))}
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        {/* Left: Interactive P&ID Mimic Screen (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400">
              P&ID GRAPHIC DISPLAY // {TABS.find((t) => t.id === activeTab)?.name}
            </span>
            <span className="text-xs text-slate-400">
              Click vào Bơm, Van điều khiển hoặc Bộ lọc trên sơ đồ để thao tác
            </span>
          </div>

          {/* Dynamic P&ID Canvas */}
          <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-4 min-h-[430px] flex items-center justify-center">
            {activeTab === 'caustic' && (
              <svg viewBox="0 0 760 380" className="w-full h-full">
                {/* DMW Line */}
                <line x1="60" y1="60" x2="490" y2="60" stroke="#06b6d4" strokeWidth="4" className={sim.fv804.mv > 0 ? 'pipe-flow' : 'pipe-stopped'} />
                <line x1="490" y1="60" x2="490" y2="110" stroke="#06b6d4" strokeWidth="4" className={sim.fv804.mv > 0 ? 'pipe-flow' : 'pipe-stopped'} />
                <text x="65" y="48" fill="#22d3ee" fontSize="12" fontWeight="bold">DMW SUPPLY</text>

                {/* FV-804 Valve */}
                <g onClick={() => setSelectedControl({ type: 'valve', key: 'fv804', label: 'FV-804 (DMW Dilution Valve)' })} className="cursor-pointer">
                  <rect x="330" y="25" width="70" height="70" fill="transparent" />
                  <polygon points="345,50 365,60 345,70" fill={sim.fv804.mv > 0 ? '#22c55e' : '#ef4444'} />
                  <polygon points="385,50 365,60 385,70" fill={sim.fv804.mv > 0 ? '#22c55e' : '#ef4444'} />
                  <circle cx="365" cy="40" r="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                  <text x="335" y="22" fill="#f8fafc" fontSize="11" fontWeight="bold">FV-804 ({sim.fv804.mv.toFixed(0)}%)</text>
                </g>

                {/* Static Mixer MX-8001 */}
                <rect x="440" y="110" width="100" height="22" fill="#f59e0b" stroke="#fbbf24" rx="3" />
                <text x="452" y="125" fill="#0f172a" fontSize="11" fontWeight="bold">MX-8001</text>

                {/* Line to TK-801 */}
                <polyline points="440,121 340,121 340,165" fill="none" stroke="#9333ea" strokeWidth="4" className={(sim.fv804.mv > 0 || sim.p803) ? 'pipe-flow' : 'pipe-stopped'} />

                {/* TK-801 Tank */}
                <rect x="280" y="165" width="120" height="150" rx="10" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                <rect
                  x="282"
                  y={313 - (sim.li801 / 100) * 146}
                  width="116"
                  height={(sim.li801 / 100) * 146}
                  fill={sim.li801 >= 82.4 ? '#ef4444' : '#9333ea'}
                  opacity="0.75"
                />
                <text x="305" y="155" fill="#f8fafc" fontSize="12" fontWeight="bold">TK-801 (25% NaOH)</text>
                <text x="302" y="245" fill="#ffffff" fontSize="13" fontWeight="bold">LI-801: {sim.li801.toFixed(1)}%</text>

                {/* Discharge to P-801A/B */}
                <polyline points="280,295 190,295 190,230 90,230" fill="none" stroke="#9333ea" strokeWidth="4" className={(sim.p801a || sim.p801b) ? 'pipe-flow' : 'pipe-stopped'} />
                <text x="50" y="215" fill="#c084fc" fontSize="11" fontWeight="bold">To D-753 & M-721</text>
                <text x="50" y="250" fill="#e2e8f0" fontSize="11">FI-703: {sim.fi703} kg/h</text>

                {/* P-801A Pump */}
                <g onClick={() => setSim(s => ({ ...s, p801a: !s.p801a }))} className="cursor-pointer">
                  <circle cx="190" cy="295" r="18" fill={sim.p801a ? '#22c55e' : '#ef4444'} stroke="#fff" strokeWidth="2" />
                  <text x="165" y="330" fill="#f8fafc" fontSize="11" fontWeight="bold">P-801A ({sim.p801a ? 'RUN' : 'STOP'})</text>
                </g>

                {/* Mixing Loop P-803 */}
                <polyline points="400,295 620,295 620,121 540,121" fill="none" stroke="#9333ea" strokeWidth="4" className={sim.p803 ? 'pipe-flow' : 'pipe-stopped'} />
                <g onClick={() => setSim(s => ({ ...s, p803: !s.p803 }))} className="cursor-pointer">
                  <circle cx="620" cy="295" r="18" fill={sim.p803 ? '#22c55e' : '#ef4444'} stroke="#fff" strokeWidth="2" />
                  <text x="590" y="330" fill="#f8fafc" fontSize="11" fontWeight="bold">P-803 ({sim.p803 ? 'RUN' : 'STOP'})</text>
                </g>
              </svg>
            )}

            {activeTab === 'sealoil' && (
              <svg viewBox="0 0 760 380" className="w-full h-full">
                {/* D-811 Drum */}
                <rect x="120" y="90" width="100" height="180" rx="20" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                <rect x="122" y="160" width="96" height="108" rx="12" fill="#2563eb" opacity="0.7" />
                <text x="135" y="80" fill="#f8fafc" fontSize="12" fontWeight="bold">D-811 Drum</text>
                <text x="132" y="135" fill="#93c5fd" fontSize="11">PI-811: {sim.pi811.toFixed(1)} k</text>
                <text x="132" y="215" fill="#fff" fontSize="11">LI-811: {sim.li811.toFixed(0)}%</text>

                {/* Pump Line */}
                <polyline points="220,250 340,250 340,180 430,180" fill="none" stroke="#2563eb" strokeWidth="4" className={(sim.p811a || sim.p811b) ? 'pipe-flow' : 'pipe-stopped'} />
                <g onClick={() => setSim(s => ({ ...s, p811a: !s.p811a }))} className="cursor-pointer">
                  <circle cx="280" cy="250" r="18" fill={sim.p811a ? '#22c55e' : '#ef4444'} stroke="#fff" strokeWidth="2" />
                  <text x="255" y="285" fill="#fff" fontSize="11" fontWeight="bold">P-811A</text>
                </g>
                <text x="315" y="165" fill="#93c5fd" fontSize="11" fontWeight="bold">PI-812: {sim.pi812.toFixed(1)} kg/cm2g</text>

                {/* Cooler E-811 */}
                <circle cx="410" cy="180" r="20" fill="#0f172a" stroke="#38bdf8" strokeWidth="3" />
                <text x="392" y="215" fill="#38bdf8" fontSize="11" fontWeight="bold">E-811</text>

                {/* Dual Filters STR-811A/B */}
                <g onClick={() => setSim(s => ({ ...s, filter811: s.filter811 === 'A' ? 'B' : 'A' }))} className="cursor-pointer">
                  <rect x="490" y="120" width="70" height="45" fill={sim.filter811 === 'A' ? (sim.filter811AClogged ? '#ef4444' : '#22c55e') : '#334155'} rx="4" />
                  <text x="497" y="147" fill="#fff" fontSize="11" fontWeight="bold">STR-811A</text>

                  <rect x="490" y="195" width="70" height="45" fill={sim.filter811 === 'B' ? '#22c55e' : '#334155'} rx="4" />
                  <text x="497" y="222" fill="#fff" fontSize="11" fontWeight="bold">STR-811B</text>
                  <text x="475" y="260" fill="#fbbf24" fontSize="10">(Click để chuyển lọc A/B)</text>
                </g>

                {/* Header Out */}
                <line x1="560" y1="180" x2="710" y2="180" stroke="#2563eb" strokeWidth="4" className={(sim.p811a || sim.p811b) ? 'pipe-flow' : 'pipe-stopped'} />
                <text x="580" y="165" fill={sim.pzi813 <= 11 ? '#ef4444' : '#4ade80'} fontSize="12" fontWeight="bold">
                  PZI-813: {sim.pzi813.toFixed(1)} kg/cm2g
                </text>
                <text x="615" y="200" fill="#93c5fd" fontSize="11" fontWeight="bold">To SOS Header</text>
              </svg>
            )}

            {activeTab === 'reactivation' && (
              <svg viewBox="0 0 760 380" className="w-full h-full">
                {/* C-801 Blower */}
                <polyline points="120,250 120,120 350,120" fill="none" stroke="#3b82f6" strokeWidth="4" className={sim.c801 ? 'pipe-flow' : 'pipe-stopped'} />
                <g onClick={() => setSim(s => ({ ...s, c801: !s.c801 }))} className="cursor-pointer">
                  <circle cx="120" cy="250" r="22" fill={sim.c801 ? '#22c55e' : '#ef4444'} stroke="#fff" strokeWidth="2" />
                  <text x="90" y="290" fill="#fff" fontSize="11" fontWeight="bold">C-801 Blower</text>
                </g>
                <text x="135" y="105" fill="#93c5fd" fontSize="11" fontWeight="bold">PZI-815: {sim.pzi815.toFixed(2)} kg/cm2g</text>

                {/* E-801 Heater */}
                <circle cx="380" cy="120" r="24" fill="#1e293b" stroke="#ef4444" strokeWidth="3" />
                <text x="362" y="158" fill="#f87171" fontSize="11" fontWeight="bold">E-801</text>

                {/* TV-801 Steam Valve */}
                <g onClick={() => setSelectedControl({ type: 'valve', key: 'tv801', label: 'TV-801 (HS Steam to E-801)' })} className="cursor-pointer">
                  <line x1="380" y1="40" x2="380" y2="96" stroke="#ef4444" strokeWidth="3" />
                  <circle cx="380" cy="65" r="12" fill="#ef4444" />
                  <text x="400" y="68" fill="#fca5a5" fontSize="11" fontWeight="bold">TV-801 ({sim.tv801.mv.toFixed(0)}%)</text>
                </g>

                {/* Outlet to Dryers */}
                <line x1="404" y1="120" x2="670" y2="120" stroke="#ef4444" strokeWidth="4" className={sim.c801 ? 'pipe-flow' : 'pipe-stopped'} />
                <text x="460" y="105" fill={sim.tic801 >= 250 ? '#ef4444' : '#fbbf24'} fontSize="12" fontWeight="bold">
                  TIC-801: {sim.tic801.toFixed(1)} °C
                </text>
                <rect x="610" y="95" width="120" height="50" fill="#1e293b" stroke="#64748b" rx="6" />
                <text x="622" y="124" fill="#fff" fontSize="11" fontWeight="bold">D-703 / D-235</text>

                {/* D-802 Mist Separator */}
                <rect x="230" y="190" width="90" height="130" rx="18" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
                <text x="248" y="245" fill="#fff" fontSize="12" fontWeight="bold">D-802</text>
                <text x="242" y="265" fill="#93c5fd" fontSize="10">PIC-801: {sim.pic801}k</text>
                <polyline points="610,255 320,255" fill="none" stroke="#3b82f6" strokeWidth="4" className={sim.c801 ? 'pipe-flow' : 'pipe-stopped'} />
                <polyline points="230,255 142,255" fill="none" stroke="#3b82f6" strokeWidth="4" className={sim.c801 ? 'pipe-flow' : 'pipe-stopped'} />
              </svg>
            )}

            {activeTab !== 'caustic' && activeTab !== 'sealoil' && activeTab !== 'reactivation' && (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeTab === 'brine' && (
                  <>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                      <h3 className="font-bold text-blue-400 mb-3">Brine Circulation Pumps (P-821A/B)</h3>
                      <div className="flex gap-3 mb-4">
                        <button onClick={() => setSim(s => ({ ...s, p821a: !s.p821a }))} className={`px-4 py-2 rounded font-bold text-xs ${sim.p821a ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          P-821A: {sim.p821a ? 'RUNNING' : 'STOPPED'}
                        </button>
                        <button onClick={() => setSim(s => ({ ...s, p821b: !s.p821b }))} className={`px-4 py-2 rounded font-bold text-xs ${sim.p821b ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          P-821B: {sim.p821b ? 'RUNNING' : 'STOPPED'}
                        </button>
                      </div>
                      <p className="text-sm">Header Pressure (PI-821): <span className="font-mono font-bold text-cyan-400">{sim.pi821.toFixed(2)} kg/cm2g</span></p>
                      <p className="text-sm">Brine Flow (FI-823): <span className="font-mono font-bold text-cyan-400">{sim.fi823.toFixed(1)} t/h</span></p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                      <h3 className="font-bold text-blue-400 mb-3">Refrigerator Package (PK-821 / C-821)</h3>
                      <button onClick={() => setSim(s => ({ ...s, c821: !s.c821 }))} className={`px-4 py-2 rounded font-bold text-xs mb-4 ${sim.c821 ? 'bg-emerald-600' : 'bg-red-600'}`}>
                        Compressor C-821: {sim.c821 ? 'RUNNING' : 'STOPPED'}
                      </button>
                      <p className="text-sm">Supply Brine Temp (TI-821): <span className="font-mono font-bold text-cyan-400">{sim.ti821.toFixed(1)} °C</span> (Normal: -10°C)</p>
                    </div>
                  </>
                )}

                {activeTab === 'water_n2' && (
                  <>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                      <h3 className="font-bold text-cyan-400 mb-2">Water Headers (Package G)</h3>
                      <p className="text-sm">Treated Water (TW - PI-833): <span className="font-mono font-bold">{sim.pi833.toFixed(1)} kg/cm2g</span> (226-323 t/h)</p>
                      <p className="text-sm">Potable Water (PTW - PI-832): <span className="font-mono font-bold">{sim.pi832.toFixed(1)} kg/cm2g</span> (Safety Showers)</p>
                      <p className="text-sm">Demin Water (DMW - PI-837): <span className="font-mono font-bold">{sim.pi837.toFixed(1)} kg/cm2g</span> (15-22.5 t/h)</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                      <h3 className="font-bold text-blue-400 mb-2">Nitrogen Headers (Package G CTU)</h3>
                      <p className="text-sm">MN1 High Press (PI-861): <span className="font-mono font-bold">{sim.pi861.toFixed(1)} kg/cm2g</span> (To D-811)</p>
                      <p className="text-sm">MN2 Med Press (PI-863): <span className="font-mono font-bold">{sim.pi863.toFixed(1)} kg/cm2g</span> (PSV 12k)</p>
                      <p className="text-sm">LN Low Press (PI-865): <span className="font-mono font-bold">{sim.pi865.toFixed(1)} kg/cm2g</span> (PSV 3.5k)</p>
                    </div>
                  </>
                )}

                {activeTab === 'steam' && (
                  <>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                      <h3 className="font-bold text-red-400 mb-2">Desuperheated Steam Headers</h3>
                      <p className="text-sm">HS Header (TI-862): <span className={`font-mono font-bold ${sim.ti862 >= 264 ? 'text-red-400' : 'text-emerald-400'}`}>{sim.ti862.toFixed(1)} °C</span> (Normal: 254°C)</p>
                      <p className="text-sm">MS Header (TI-863): <span className={`font-mono font-bold ${sim.ti863 >= 222 ? 'text-red-400' : 'text-emerald-400'}`}>{sim.ti863.toFixed(1)} °C</span> (Normal: 212°C)</p>
                      <p className="text-sm">LS Header (TI-864): <span className={`font-mono font-bold ${sim.ti864 >= 169 ? 'text-red-400' : 'text-emerald-400'}`}>{sim.ti864.toFixed(1)} °C</span> (Normal: 159°C)</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                      <h3 className="font-bold text-amber-400 mb-3">Desuperheater Pumps (P-853A/B)</h3>
                      <div className="flex gap-3 mb-3">
                        <button onClick={() => setSim(s => ({ ...s, p853a: !s.p853a }))} className={`px-3 py-2 rounded font-bold text-xs ${sim.p853a ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          P-853A: {sim.p853a ? 'RUN' : 'STOP'}
                        </button>
                        <button onClick={() => setSim(s => ({ ...s, p853b: !s.p853b }))} className={`px-3 py-2 rounded font-bold text-xs ${sim.p853b ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          P-853B: {sim.p853b ? 'RUN' : 'STOP'}
                        </button>
                      </div>
                      <p className="text-sm">Header Pressure (PIC-856): <span className="font-mono font-bold text-amber-400">{sim.pic856.toFixed(1)} kg/cm2g</span></p>
                    </div>
                  </>
                )}

                {activeTab === 'air' && (
                  <>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-2">
                      <h3 className="font-bold text-emerald-400 mb-2">Plant Air (PA - Drum D-872)</h3>
                      <p className="text-sm">Supply from PP Plant: <span className="font-mono font-bold">9.0 kg/cm2g</span></p>
                      <p className="text-sm">User Header Pressure: <span className="font-mono font-bold">{sim.paPress.toFixed(1)} kg/cm2g</span> (PSV: 10 kg/cm2g)</p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                      <h3 className="font-bold text-amber-400">Instrument Air (IA - Drum D-871)</h3>
                      <p className="text-sm">Main Header (PZI-873): <span className={`font-mono font-bold ${sim.pzi873 <= 5.0 ? 'text-red-400' : 'text-emerald-400'}`}>{sim.pzi873.toFixed(2)} kg/cm2g</span></p>
                      <button
                        onClick={() => setSim(s => ({ ...s, iaSupplyLoss: !s.iaSupplyLoss }))}
                        className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-xs font-bold"
                      >
                        {sim.iaSupplyLoss ? 'Khôi phục nguồn cấp IA từ Package C' : 'Mô phỏng mất nguồn cấp IA'}
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'flare' && (
                  <>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                      <h3 className="font-bold text-orange-400">Flare Gas Compressors (C-881A/B)</h3>
                      <div className="flex gap-3">
                        <button onClick={() => setSim(s => ({ ...s, c881a: !s.c881a }))} className={`px-3 py-2 rounded font-bold text-xs ${sim.c881a ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          C-881A: {sim.c881a ? 'RUN' : 'STOP'}
                        </button>
                        <button onClick={() => setSim(s => ({ ...s, c881b: !s.c881b }))} className={`px-3 py-2 rounded font-bold text-xs ${sim.c881b ? 'bg-emerald-600' : 'bg-red-600'}`}>
                          C-881B: {sim.c881b ? 'RUN' : 'STOP'}
                        </button>
                      </div>
                      <p className="text-sm">Suction Drum D-882 (PIC-881): <span className="font-mono font-bold">{sim.pic881} mmAq</span></p>
                    </div>
                    <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 space-y-3">
                      <h3 className="font-bold text-orange-400">Flare KO Drum D-881 & Pump P-881</h3>
                      <p className="text-sm">D-881 Level (LZI-881): <span className={`font-mono font-bold ${sim.lzi881 >= 73.3 ? 'text-red-400' : 'text-emerald-400'}`}>{sim.lzi881.toFixed(1)}%</span> (Alarm H: 73.3%)</p>
                      <button onClick={() => setSim(s => ({ ...s, p881: !s.p881 }))} className={`px-4 py-2 rounded font-bold text-xs ${sim.p881 ? 'bg-emerald-600' : 'bg-red-600'}`}>
                        Condensate Pump P-881: {sim.p881 ? 'RUNNING -> D-701' : 'STOPPED'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* DCS Valve Faceplate Modal */}
          {selectedControl && (
            <div className="mt-3 bg-slate-800 border border-blue-500/50 rounded-lg p-3 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm font-bold text-white">{selectedControl.label}</p>
                  <p className="text-xs text-slate-400">
                    Mode: <span className="text-amber-400 font-bold">{sim[selectedControl.key].mode}</span> | Output MV: <span className="text-emerald-400 font-bold">{sim[selectedControl.key].mv.toFixed(0)}%</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() =>
                    setSim((s) => ({
                      ...s,
                      [selectedControl.key]: {
                        ...s[selectedControl.key],
                        mode: s[selectedControl.key].mode === 'AUTO' ? 'MAN' : 'AUTO',
                        stuck: false
                      }
                    }))
                  }
                  className="bg-amber-600 hover:bg-amber-500 px-3 py-1 rounded text-xs font-bold"
                >
                  Switch AUTO / MAN
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sim[selectedControl.key].mv}
                  onChange={(e) =>
                    setSim((s) => ({
                      ...s,
                      [selectedControl.key]: {
                        ...s[selectedControl.key],
                        mode: 'MAN',
                        stuck: false,
                        mv: Number(e.target.value)
                      }
                    }))
                  }
                  className="w-32 accent-blue-500"
                />
                <button onClick={() => setSelectedControl(null)} className="text-xs text-slate-400 hover:text-white">
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Fault Injection & SOP Troubleshooting Panel (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-white">
              Kịch bản sự cố & Hướng dẫn SOP
            </h2>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => injectScenario(sc)}
                className={`w-full text-left p-2.5 rounded-lg border text-xs transition ${
                  activeScenario?.id === sc.id
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold mb-1">{sc.title}</div>
                <div className="text-slate-400 line-clamp-2">{sc.desc}</div>
              </button>
            ))}
          </div>

          {/* SOP Corrective Action Checklist */}
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase mb-2">
              <Wrench className="w-4 h-4" />
              <span>Quy trình xử lý chuẩn (HD-W-8000-00-001)</span>
            </div>
            {activeScenario ? (
              <div className="space-y-2 text-xs">
                <p className="text-amber-300 font-semibold">{activeScenario.desc}</p>
                <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                  {activeScenario.sop.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Chọn một kịch bản sự cố ở trên để tiêm lỗi vào hệ thống và thực hành thao tác khắc phục.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
