import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  ClipboardCheck, 
  Leaf, 
  MessageSquare, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  Settings,
  Menu,
  X,
  ChevronRight,
  Droplets,
  Zap,
  Trash2,
  FileText,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getSafetyAdvice } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type View = 'dashboard' | 'incidents' | 'checklists' | 'environmental' | 'ai' | 'reports';

interface Incident {
  id: number;
  title: string;
  description: string;
  type: 'safety' | 'environmental';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  reporter: string;
  status: 'open' | 'in-progress' | 'closed';
  created_at: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

interface Checklist {
  id: number;
  title: string;
  category: string;
  items: ChecklistItem[];
  status: string;
  created_at: string;
}

// --- Components ---

const Card = ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)} {...props}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, trend, color }: { title: string; value: string | number; icon: any; trend?: string; color: string }) => (
  <Card className="p-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold mt-2 text-slate-900">{value}</h3>
        {trend && (
          <p className={cn("text-xs font-medium mt-2", trend.startsWith('+') ? "text-emerald-600" : "text-rose-600")}>
            {trend} <span className="text-slate-400 font-normal">vs mês anterior</span>
          </p>
        )}
      </div>
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </Card>
);

// --- Main App ---

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isReportingModalOpen, setIsReportingModalOpen] = useState(false);

  useEffect(() => {
    fetchIncidents();
    fetchChecklists();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      const data = await res.json();
      setIncidents(data);
    } catch (e) { console.error(e); }
  };

  const fetchChecklists = async () => {
    try {
      const res = await fetch('/api/checklists');
      const data = await res.json();
      setChecklists(data);
    } catch (e) { console.error(e); }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidentes & Riscos', icon: ShieldAlert },
    { id: 'checklists', label: 'Checklists & Inspeções', icon: ClipboardCheck },
    { id: 'environmental', label: 'Meio Ambiente', icon: Leaf },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'ai', label: 'Assistente IA', icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-slate-900 text-white flex flex-col relative z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight"
            >
              EcoSafe
            </motion.span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                activeView === item.id 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeView === item.id ? "text-white" : "group-hover:text-white")} />
              {isSidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-white transition-colors">
            <Settings className="w-5 h-5" />
            {isSidebarOpen && <span className="font-medium">Configurações</span>}
          </button>
        </div>

        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-4 top-20 bg-white text-slate-900 border border-slate-200 rounded-full p-1 shadow-md hover:bg-slate-50 transition-colors"
        >
          <ChevronRight className={cn("w-4 h-4 transition-transform", isSidebarOpen && "rotate-180")} />
        </button>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-bottom border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-800">
            {navItems.find(i => i.id === activeView)?.label}
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm w-64 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setIsReportingModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Novo Registro
            </button>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src="https://picsum.photos/seed/user/40/40" alt="User" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && <DashboardView incidents={incidents} />}
            {activeView === 'incidents' && <IncidentsView incidents={incidents} />}
            {activeView === 'checklists' && <ChecklistsView checklists={checklists} />}
            {activeView === 'environmental' && <EnvironmentalView />}
            {activeView === 'ai' && <AIView incidents={incidents} />}
          </AnimatePresence>
        </div>
      </main>

      {/* Reporting Modal */}
      {isReportingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold">Novo Registro de HST / Ambiental</h3>
              <button onClick={() => setIsReportingModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              // Handle submission logic
              setIsReportingModalOpen(false);
            }}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Título do Evento</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Vazamento de óleo" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Tipo</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>Segurança do Trabalho</option>
                    <option>Meio Ambiente</option>
                    <option>Saúde Ocupacional</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Descrição Detalhada</label>
                <textarea rows={4} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Descreva o que aconteceu..."></textarea>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Gravidade</label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option>Baixa</option>
                    <option>Média</option>
                    <option>Alta</option>
                    <option>Crítica</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Localização</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Setor A" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Data/Hora</label>
                  <input type="datetime-local" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsReportingModalOpen(false)} className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all">Salvar Registro</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// --- View Components ---

function DashboardView({ incidents }: { incidents: Incident[] }) {
  const data = [
    { name: 'Jan', safety: 4, env: 2 },
    { name: 'Fev', safety: 3, env: 1 },
    { name: 'Mar', safety: 6, env: 4 },
    { name: 'Abr', safety: 2, env: 1 },
    { name: 'Mai', safety: 5, env: 3 },
    { name: 'Jun', safety: 3, env: 2 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Incidentes (Mês)" value={incidents.length} icon={AlertTriangle} trend="+12%" color="bg-rose-500" />
        <StatCard title="Inspeções Realizadas" value="42" icon={ClipboardCheck} trend="+5%" color="bg-emerald-500" />
        <StatCard title="Consumo Energia" value="1,240 kWh" icon={Zap} trend="-8%" color="bg-amber-500" />
        <StatCard title="Resíduos Gerados" value="450 kg" icon={Trash2} trend="-15%" color="bg-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg">Tendência de Ocorrências</h4>
            <div className="flex gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Segurança</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Ambiental</div>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSafety" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEnv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="safety" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSafety)" />
                <Area type="monotone" dataKey="env" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorEnv)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-bold text-lg mb-6">Status de Conformidade</h4>
          <div className="h-[250px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Conforme', value: 85 },
                    { name: 'Não Conforme', value: 15 },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">85%</span>
              <span className="text-xs text-slate-500 font-medium uppercase">Total</span>
            </div>
          </div>
          <div className="space-y-4 mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Treinamentos</span>
              <span className="font-bold text-emerald-600">92%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[92%]"></div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">EPIs em Dia</span>
              <span className="font-bold text-amber-600">78%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[78%]"></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg">Últimos Incidentes</h4>
            <button className="text-emerald-600 text-sm font-bold hover:underline">Ver todos</button>
          </div>
          <div className="space-y-4">
            {incidents.slice(0, 4).map((incident) => (
              <div key={incident.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  incident.severity === 'critical' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"
                )}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h5 className="font-bold text-sm">{incident.title}</h5>
                  <p className="text-xs text-slate-500">{incident.location} • {new Date(incident.created_at).toLocaleDateString()}</p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  incident.status === 'open' ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600"
                )}>
                  {incident.status}
                </div>
              </div>
            ))}
            {incidents.length === 0 && (
              <div className="text-center py-8 text-slate-400 italic">Nenhum incidente registrado recentemente.</div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg">Checklists Pendentes</h4>
            <button className="text-emerald-600 text-sm font-bold hover:underline">Ver todos</button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Inspeção Semanal de Extintores', category: 'Incêndio', progress: 45 },
              { title: 'Monitoramento de Efluentes', category: 'Ambiental', progress: 0 },
              { title: 'Checklist de Empilhadeira', category: 'Logística', progress: 100 },
            ].map((item, i) => (
              <div key={i} className="p-4 border border-slate-100 rounded-2xl hover:border-emerald-200 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{item.category}</span>
                    <h5 className="font-bold text-sm mt-1">{item.title}</h5>
                  </div>
                  {item.progress === 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <span className="text-xs font-bold text-slate-400">{item.progress}%</span>
                  )}
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-500", item.progress === 100 ? "bg-emerald-500" : "bg-slate-300")} style={{ width: `${item.progress}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function IncidentsView({ incidents }: { incidents: Incident[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['Todos', 'Segurança', 'Ambiental', 'Saúde'].map(f => (
            <button key={f} className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              f === 'Todos' ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}>{f}</button>
          ))}
        </div>
      </div>

      <Card>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Incidente</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gravidade</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Local</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="p-4 text-sm font-mono text-slate-400">#{incident.id.toString().padStart(4, '0')}</td>
                <td className="p-4">
                  <div className="font-bold text-sm">{incident.title}</div>
                  <div className="text-xs text-slate-500 truncate max-w-[200px]">{incident.description}</div>
                </td>
                <td className="p-4">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                    incident.type === 'safety' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  )}>
                    {incident.type === 'safety' ? 'Segurança' : 'Ambiental'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      incident.severity === 'critical' ? "bg-rose-500" : 
                      incident.severity === 'high' ? "bg-orange-500" : "bg-amber-500"
                    )}></div>
                    <span className="text-sm font-medium capitalize">{incident.severity}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600">{incident.location}</td>
                <td className="p-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    incident.status === 'open' ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {incident.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">{new Date(incident.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {incidents.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="text-slate-300 w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900">Nenhum incidente encontrado</h4>
            <p className="text-slate-500 text-sm mt-1">Tudo parece estar em ordem no momento.</p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function ChecklistsView({ checklists }: { checklists: Checklist[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* Mock Checklists for display if empty */}
      {[
        { title: 'Inspeção de EPIs', category: 'Segurança', items: 12, completed: 8 },
        { title: 'Verificação de Resíduos', category: 'Ambiental', items: 5, completed: 5 },
        { title: 'Saídas de Emergência', category: 'Incêndio', items: 10, completed: 2 },
        { title: 'Qualidade do Ar', category: 'Ambiental', items: 4, completed: 0 },
      ].map((c, i) => (
        <Card key={i} className="p-6 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <ClipboardCheck className="w-5 h-5 text-slate-600 group-hover:text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded uppercase text-slate-500">{c.category}</span>
          </div>
          <h4 className="font-bold text-lg mb-2">{c.title}</h4>
          <div className="flex justify-between items-center text-sm text-slate-500 mb-4">
            <span>Progresso</span>
            <span className="font-bold text-slate-900">{Math.round((c.completed / c.items) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
            <div 
              className="bg-emerald-500 h-full transition-all duration-700" 
              style={{ width: `${(c.completed / c.items) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400">{c.completed}/{c.items} itens concluídos</span>
            <button className="text-emerald-600 text-sm font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Continuar <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      ))}
    </motion.div>
  );
}

function EnvironmentalView() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Droplets className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold">Consumo de Água</h4>
              <p className="text-xs text-slate-500">Monitoramento em tempo real</p>
            </div>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { t: '08:00', v: 45 }, { t: '10:00', v: 52 }, { t: '12:00', v: 38 }, { t: '14:00', v: 65 }, { t: '16:00', v: 48 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="t" hide />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
            <span className="text-2xl font-bold">248 m³</span>
            <span className="text-xs font-bold text-emerald-600">-4.2%</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold">Energia Elétrica</h4>
              <p className="text-xs text-slate-500">Consumo por setor</p>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Produção', value: 65, color: 'bg-amber-500' },
              { label: 'Escritórios', value: 15, color: 'bg-slate-400' },
              { label: 'Logística', value: 20, color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs font-bold mb-1.5 uppercase tracking-wider">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className={cn("h-full", item.color)} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-100 rounded-2xl">
              <Trash2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold">Gestão de Resíduos</h4>
              <p className="text-xs text-slate-500">Reciclagem vs Rejeito</p>
            </div>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Reciclável', value: 75 },
                    { name: 'Orgânico', value: 15 },
                    { name: 'Perigoso', value: 10 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Reciclável
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> Orgânico
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
              <div className="w-2 h-2 rounded-full bg-rose-500"></div> Perigoso
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function AIView({ incidents }: { incidents: Incident[] }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou seu assistente de HST e Meio Ambiente. Como posso ajudar hoje? Posso analisar riscos, sugerir melhorias nos checklists ou tirar dúvidas sobre normas regulamentadoras (NRs).' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const advice = await getSafetyAdvice(input, { incidentsCount: incidents.length });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: advice || 'Não consegui gerar uma resposta no momento.'
      }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Ocorreu um erro ao consultar a IA.'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-[calc(100vh-180px)] flex flex-col"
    >
      <Card className="flex-1 flex flex-col p-0">
        <div className="p-4 border-b border-slate-100 bg-emerald-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <MessageSquare className="text-white w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">EcoSafe AI</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm",
                msg.role === 'user' 
                  ? "bg-emerald-500 text-white rounded-tr-none" 
                  : "bg-slate-100 text-slate-800 rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Pergunte sobre normas, riscos ou estatísticas..."
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button 
              onClick={handleSend}
              className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
