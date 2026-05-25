import React, { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  AlertTriangle,
  Activity,
  Zap,
  Thermometer,
  Gauge,
  CheckCircle2,
  Factory,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

const equipmentList = [
  {
    id: "pump-a",
    name: "Cooling Pump A",
    type: "Pump",
    location: "Pickering Unit 1",
    owner: "Mechanical Ops",
    baseline: { temperature: 72, vibration: 4.2, output: 82, efficiency: 91 },
  },
  {
    id: "turbine-b",
    name: "Turbine B",
    type: "Turbine",
    location: "Darlington Unit 2",
    owner: "Generation Ops",
    baseline: { temperature: 79, vibration: 5.4, output: 91, efficiency: 87 },
  },
  {
    id: "generator-c",
    name: "Generator C",
    type: "Generator",
    location: "Oshawa Control Room",
    owner: "Electrical Ops",
    baseline: { temperature: 68, vibration: 3.7, output: 76, efficiency: 94 },
  },
  {
    id: "valve-d",
    name: "Feedwater Valve D",
    type: "Valve",
    location: "Courtice Aux System",
    owner: "Field Ops",
    baseline: { temperature: 64, vibration: 3.1, output: 69, efficiency: 96 },
  },
];

function generateReadings(equipmentId) {
  const selected = equipmentList.find((item) => item.id === equipmentId);
  const base = selected.baseline;

  return Array.from({ length: 18 }, (_, index) => {
    const stress = index > 11 && equipmentId === "turbine-b" ? (index - 10) * 1.05 : 0;
    const mildDrift = index > 13 && equipmentId === "pump-a" ? (index - 12) * 0.35 : 0;

    return {
      time: `${String(index + 6).padStart(2, "0")}:00`,
      temperature: Math.round(base.temperature + Math.sin(index / 2) * 4 + stress + mildDrift),
      vibration: Number((base.vibration + Math.cos(index / 3) * 0.7 + stress / 5 + mildDrift / 6).toFixed(1)),
      output: Math.round(base.output + Math.sin(index / 2.5) * 5 - stress / 4),
      efficiency: Math.round(base.efficiency + Math.cos(index / 4) * 2 - stress / 2),
    };
  });
}

function getStatus(latest) {
  if (latest.temperature >= 88 || latest.vibration >= 7.3 || latest.efficiency <= 82) return "Critical";
  if (latest.temperature >= 82 || latest.vibration >= 6.2 || latest.efficiency <= 88) return "Warning";
  return "Healthy";
}

function getRiskScore(latest) {
  const tempRisk = Math.max(0, (latest.temperature - 70) * 1.6);
  const vibrationRisk = Math.max(0, (latest.vibration - 4) * 9);
  const efficiencyRisk = Math.max(0, (92 - latest.efficiency) * 2.2);
  return Math.min(100, Math.round(tempRisk + vibrationRisk + efficiencyRisk));
}

function getRecommendation(status) {
  if (status === "Critical") {
    return "Schedule immediate inspection and reduce operating load if needed.";
  }

  if (status === "Warning") {
    return "Monitor next readings and prepare a preventive maintenance review.";
  }

  return "Continue normal operation.";
}

function getStatusStyles(status) {
  if (status === "Critical") return "bg-red-50 text-red-700 border-red-200";
  if (status === "Warning") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getStatusDot(status) {
  if (status === "Critical") return "bg-red-500";
  if (status === "Warning") return "bg-amber-500";
  return "bg-emerald-500";
}

function StatCard({ icon: Icon, label, value, helper, tone = "default" }) {
  const toneMap = {
    default: "bg-white",
    dark: "bg-slate-950 text-white border-slate-800",
  };

  return (
    <div className={`rounded-3xl border border-slate-200 p-5 shadow-sm ${toneMap[tone]}`}>
      <div className="mb-5 flex items-center justify-between">
        <p className={`text-sm ${tone === "dark" ? "text-slate-400" : "text-slate-500"}`}>{label}</p>
        <div className={`rounded-2xl p-2 ${tone === "dark" ? "bg-white/10" : "bg-slate-100"}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      <p className={`mt-2 text-sm ${tone === "dark" ? "text-slate-400" : "text-slate-500"}`}>{helper}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <p className="mb-2 text-sm font-medium text-slate-900">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-sm text-slate-600">
          {item.name || item.dataKey}: <span className="font-medium text-slate-900">{item.value}</span>
        </p>
      ))}
    </div>
  );
}

export default function App() {
  const [selectedId, setSelectedId] = useState("turbine-b");

  const selectedEquipment = equipmentList.find((item) => item.id === selectedId);
  const readings = useMemo(() => generateReadings(selectedId), [selectedId]);
  const latest = readings[readings.length - 1];
  const status = getStatus(latest);
  const riskScore = getRiskScore(latest);

  const fleet = equipmentList.map((equipment) => {
    const data = generateReadings(equipment.id);
    const recent = data[data.length - 1];
    const currentStatus = getStatus(recent);
    return {
      ...equipment,
      latest: recent,
      status: currentStatus,
      risk: getRiskScore(recent),
      recommendation: getRecommendation(currentStatus),
      message:
        currentStatus === "Critical"
          ? "Immediate review recommended due to elevated temperature, vibration, or declining efficiency."
          : currentStatus === "Warning"
          ? "Monitor closely. Readings are approaching operational limits."
          : "Operating within expected range.",
    };
  });

  const alertCount = fleet.filter((item) => item.status !== "Healthy").length;
  const avgEfficiency = Math.round(fleet.reduce((sum, item) => sum + item.latest.efficiency, 0) / fleet.length);
  const avgOutput = Math.round(fleet.reduce((sum, item) => sum + item.latest.output, 0) / fleet.length);

  const riskData = fleet.map((item) => ({ name: item.name.replace("Cooling ", ""), risk: item.risk }));

  return (
    <div className="min-h-screen bg-[#f6f7f9] p-4 text-slate-950 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-sm">
          <div className="grid gap-8 p-6 md:grid-cols-[1.4fr_0.8fr] md:p-8">
            <div>
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.25em] text-slate-300">
                  Energy Operations
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-slate-300">
                  Simulated live monitoring
                </span>
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                Equipment health and maintenance risk dashboard
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                A React based prototype that monitors simulated power generation assets, detects abnormal sensor patterns, and turns raw readings into operational alerts.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-300">Selected asset</p>
              <div className="mt-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">{selectedEquipment.name}</p>
                  <p className="mt-1 text-sm text-slate-400">{selectedEquipment.location}</p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs ${getStatusStyles(status)}`}>{status}</span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-slate-400">Owner</p>
                  <p className="mt-1 font-medium">{selectedEquipment.owner}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-slate-400">Risk Score</p>
                  <p className="mt-1 font-medium">{riskScore}/100</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard icon={Factory} label="Monitored Assets" value={equipmentList.length} helper="Across simulated stations" />
          <StatCard icon={AlertTriangle} label="Open Alerts" value={alertCount} helper="Warning or critical assets" />
          <StatCard icon={Zap} label="Fleet Output" value={`${avgOutput}%`} helper="Average operating load" />
          <StatCard icon={ShieldCheck} label="Efficiency" value={`${avgEfficiency}%`} helper="Average equipment efficiency" />
        </section>

        <main className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Live Sensor Feed</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedEquipment.name}</h2>
                <p className="mt-1 text-sm text-slate-500">Temperature, vibration, output, and efficiency across the operating day.</p>
              </div>
              <select
                value={selectedId}
                onChange={(event) => setSelectedId(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              >
                {equipmentList.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>
                    {equipment.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <StatCard icon={Thermometer} label="Temperature" value={`${latest.temperature}°C`} helper="Current reading" />
              <StatCard icon={Activity} label="Vibration" value={`${latest.vibration} mm/s`} helper="Mechanical stability" />
              <StatCard icon={Zap} label="Output" value={`${latest.output}%`} helper="Operating load" />
              <StatCard icon={TrendingUp} label="Efficiency" value={`${latest.efficiency}%`} helper="System performance" />
            </div>

            <div className="mt-6 h-[380px] rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={readings} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="temperature" name="Temperature" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="vibration" name="Vibration" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="output" name="Output" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="efficiency" name="Efficiency" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Alerts</p>
                  <h2 className="mt-2 text-2xl font-semibold">Operational Queue</h2>
                </div>
                <AlertTriangle className="h-6 w-6 text-slate-500" />
              </div>
              <div className="space-y-3">
                {fleet.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => setSelectedId(alert.id)}
                    className="w-full rounded-3xl border border-slate-200 p-4 text-left transition hover:bg-slate-50"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${getStatusDot(alert.status)}`} />
                        <p className="font-medium">{alert.name}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs ${getStatusStyles(alert.status)}`}>{alert.status}</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">{alert.message}</p>
                    <div className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-medium text-slate-900">Recommended action: </span>
                      {alert.recommendation}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{alert.location}</span>
                      <span>Risk {alert.risk}/100</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Fleet Risk</p>
              <h2 className="mt-2 text-2xl font-semibold">Risk by Asset</h2>
              <div className="mt-5 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="risk" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </aside>
        </main>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Asset Inventory</p>
            <h2 className="mt-2 text-2xl font-semibold">Equipment Summary</h2>
            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Asset</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fleet.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-medium">{item.name}</td>
                      <td className="px-4 py-4 text-slate-500">{item.type}</td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full border px-3 py-1 text-xs ${getStatusStyles(item.status)}`}>{item.status}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{item.owner}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-sm md:p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Project Narrative</p>
            <h2 className="mt-2 text-2xl font-semibold">Why this project matters</h2>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Power generation teams need quick visibility into asset health, especially when temperature, vibration, and efficiency drift from expected operating ranges. This prototype turns simulated sensor data into a clear monitoring interface with alerts, risk scoring, and fleet level summaries.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl bg-white/10 p-4">
                <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-300" />
                <p className="font-medium">Software</p>
                <p className="mt-1 text-sm text-slate-400">React components, state, charts, and reusable UI patterns.</p>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                <CheckCircle2 className="mb-3 h-5 w-5 text-emerald-300" />
                <p className="font-medium">Data</p>
                <p className="mt-1 text-sm text-slate-400">Generated sensor data, anomaly logic, risk scoring, and trend analysis.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
