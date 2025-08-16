/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Calendar, MapPin, User, Clock, CheckCircle, Building2, Users, ArrowRight } from "lucide-react";

type Organization = { id: number; name: string; category: string; address: string; };
type Specialist   = { id: number; name: string; specialization: string; organizationId: number; };
type SlotsResponse = { slots: number[] };

function minutesToHHMM(m: number) {
  const h = Math.floor(m / 60).toString().padStart(2, "0");
  const min = (m % 60).toString().padStart(2, "0");
  return `${h}:${min}`;
}
function isPastSlot(dateStr: string, m: number) {
  const d = new Date(dateStr + "T00:00:00");
  d.setMinutes(d.getMinutes() + m);
  return d < new Date();
}

export default function Home() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [specs, setSpecs] = useState<Specialist[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<Specialist | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slotsDate, setSlotsDate] = useState<string>(""); // Track the date for which slots were loaded
  const [slots, setSlots] = useState<number[]>([]);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get<Organization[]>("/api/organizations")
      .then(r => setOrgs(r.data))
      .catch(() => toast.error("Не удалось загрузить организации"));
  }, []);

  const loadSpecs = async (org: Organization) => {
    try {
      setIsLoadingSpecs(true);
      setSelectedOrg(org); setSpecs([]); setSelectedSpec(null); setSlots([]); setSlotsDate("");
      const r = await api.get<Specialist[]>(`/api/organizations/${org.id}/specialists`);
      setSpecs(r.data);
    } catch {
      toast.error("Не удалось загрузить специалистов");
    } finally {
      setIsLoadingSpecs(false);
    }
  };

  const loadSlots = async (spec: Specialist) => {
    try {
      setIsLoadingSlots(true);
      setSelectedSpec(spec);
      setSlotsDate(date); // Store the date for which we're loading slots
      const r = await api.get<SlotsResponse>(`/api/specialists/${spec.id}/slots`, { params: { date } });
      setSlots(r.data?.slots ?? []);
      if ((r.data?.slots ?? []).length === 0) toast.info("На выбранную дату слотов нет");
    } catch {
      toast.error("Не удалось загрузить слоты");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const book = async (minutesFromMidnight: number) => {
    if (!token) { toast.warning("Войдите, чтобы бронировать"); return; }
    if (!selectedSpec) return;
    try {
      setIsBooking(minutesFromMidnight);
      // Use slotsDate instead of current date for booking
      await api.post("/api/appointments", { specialistId: selectedSpec.id, date: slotsDate, minutesFromMidnight });
      toast.success("Запись успешно создана");
      loadSlots(selectedSpec);
    } catch (e: any) {
      const s = e?.response?.status;
      if (s === 409) toast.error("Этот слот уже занят");
      else if (s === 401) toast.warning("Сессия истекла — войдите снова");
      else toast.error(e?.response?.data?.error || "Ошибка бронирования");
    } finally {
      setIsBooking(null);
    }
  };

  const dateLabel = useMemo(() => {
    if (!slotsDate) return "";
    try { return new Date(slotsDate + "T00:00:00").toLocaleDateString(); }
    catch { return slotsDate; }
  }, [slotsDate]);

  return (
    <div className="min-h-screen relative">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 space-y-20">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl shadow-2xl shadow-blue-500/30 mb-8 pulse-glow">
            <Calendar className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-black text-gradient leading-loose pb-4">
              Booking Platform
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Найдите и запишитесь к нужному специалисту в удобное время
            </p>
          </div>
          
          {/* Enhanced Progress Steps */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
            <div className="flex items-center space-x-4 glass-card px-8 py-4 rounded-2xl hover-lift">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg transition-all duration-300 ${
                selectedOrg ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
              }`}>
                1
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-800">Организация</div>
                <div className="text-sm text-slate-500">Выберите место</div>
              </div>
              {selectedOrg && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            
            <ArrowRight className="w-6 h-6 text-slate-400 rotate-90 md:rotate-0" />
            
            <div className="flex items-center space-x-4 glass-card px-8 py-4 rounded-2xl hover-lift">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg transition-all duration-300 ${
                selectedSpec ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 
                selectedOrg ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 
                'bg-slate-300 text-slate-500'
              }`}>
                2
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-800">Специалист</div>
                <div className="text-sm text-slate-500">Выберите врача</div>
              </div>
              {selectedSpec && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
            
            <ArrowRight className="w-6 h-6 text-slate-400 rotate-90 md:rotate-0" />
            
            <div className="flex items-center space-x-4 glass-card px-8 py-4 rounded-2xl hover-lift">
              <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg transition-all duration-300 ${
                slots.length > 0 ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 
                selectedSpec ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 
                'bg-slate-300 text-slate-500'
              }`}>
                3
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-800">Время</div>
                <div className="text-sm text-slate-500">Выберите слот</div>
              </div>
              {slots.length > 0 && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
          </div>
        </div>

        {/* Organizations Section */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Выберите организацию
            </h2>
            <p className="text-xl text-slate-600">
              Найдите медицинское учреждение в вашем городе
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {orgs.map(o => (
              <button
                key={o.id}
                onClick={() => loadSpecs(o)}
                className={`group relative text-left p-8 rounded-3xl transition-all duration-500 hover-lift ${
                  selectedOrg?.id === o.id
                    ? "glass-card ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20 scale-105"
                    : "glass-card hover:shadow-2xl hover:shadow-slate-900/10"
                }`}
              >
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Content */}
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <Building2 className="w-7 h-7 text-white" />
                      </div>
                      {selectedOrg?.id === o.id && (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {o.name}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-gradient">{o.category}</span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{o.address}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Доступны специалисты</span>
                    </div>
                    <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${
                      selectedOrg?.id === o.id ? 'text-blue-600 rotate-45' : 'text-slate-400 group-hover:translate-x-1'
                    }`} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Specialists Section */}
        {selectedOrg && (
          <section className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-slate-900">Специалисты</h2>
                <p className="text-xl text-slate-600">
                  <span className="text-gradient font-bold">{selectedOrg.name}</span> • Выберите специалиста
                </p>
              </div>
              
              {/* Date Picker */}
              <div className="glass-card rounded-2xl p-6 space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-700">Дата записи</span>
                </div>
                <input
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all duration-200 font-semibold"
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>

            {isLoadingSpecs ? (
              <div className="glass-card rounded-3xl p-16">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-lg font-medium text-slate-600">Загружаем специалистов...</span>
                </div>
              </div>
            ) : specs.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {specs.map(s => (
                  <div
                    key={s.id}
                    className={`group p-8 rounded-3xl transition-all duration-500 ${
                      selectedSpec?.id === s.id
                        ? "glass-card ring-2 ring-green-500 shadow-2xl shadow-green-500/20 scale-105"
                        : "glass-card hover:shadow-2xl hover:-translate-y-2"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">
                            {s.name}
                          </h3>
                          <p className="text-green-600 font-semibold">{s.specialization}</p>
                        </div>
                      </div>
                      
                      <button
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-500/30 font-semibold hover-lift"
                        onClick={() => loadSlots(s)}
                        disabled={isLoadingSlots && selectedSpec?.id === s.id}
                      >
                        {isLoadingSlots && selectedSpec?.id === s.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Загрузка...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>Показать время</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card rounded-3xl p-16">
                <div className="text-center space-y-8">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center">
                      <User className="w-16 h-16 text-slate-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 font-bold text-xl">!</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-slate-700">
                      В данной организации нет доступных специалистов
                    </h3>
                    <p className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
                      Попробуйте выбрать другую организацию или обратитесь позже
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                      onClick={() => {setSelectedOrg(null); setSpecs([]); setSelectedSpec(null); setSlots([]); setSlotsDate("");}}
                      className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-1 font-semibold"
                    >
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        <span>Выбрать другую организацию</span>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => loadSpecs(selectedOrg!)}
                      className="group px-6 py-4 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 rounded-2xl transition-all duration-300 font-semibold"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Обновить</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Time Slots Section */}
        {selectedSpec && slotsDate && (
          <section className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-slate-900">Доступное время</h2>
              <p className="text-xl text-slate-600">
                <span className="text-gradient font-bold">{selectedSpec.name}</span> • {dateLabel}
              </p>
            </div>

            <div className="glass-card rounded-3xl p-8 lg:p-12">
              {isLoadingSlots ? (
                <div className="flex flex-col items-center space-y-6 py-16">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="text-xl font-medium text-slate-600">Загружаем доступное время...</span>
                </div>
              ) : slots.length ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-3 bg-green-50 px-6 py-3 rounded-2xl">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-green-700 font-bold text-lg">
                        Найдено {slots.length} свободных слотов
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {slots.map(m => {
                      const disabled = isPastSlot(slotsDate, m); // Use slotsDate instead of date
                      const isCurrentlyBooking = isBooking === m;
                      
                      return (
                        <button
                          key={m}
                          onClick={() => !disabled && !isCurrentlyBooking && book(m)}
                          disabled={disabled || isCurrentlyBooking}
                          className={`relative px-4 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                            disabled
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : isCurrentlyBooking
                              ? "bg-blue-100 text-blue-600 cursor-wait animate-pulse"
                              : "bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 hover:shadow-xl hover:-translate-y-2 hover:scale-110 active:scale-95"
                          }`}
                        >
                          {isCurrentlyBooking ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              <span>...</span>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="text-xl">{minutesToHHMM(m)}</div>
                              {!disabled && (
                                <div className="text-xs text-slate-500">Доступно</div>
                              )}
                            </div>
                          )}
                          
                          {!disabled && !isCurrentlyBooking && (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Clock className="w-12 h-12 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-600 mb-4">Нет доступных слотов</h3>
                  <p className="text-lg text-slate-500">Попробуйте выбрать другую дату или специалиста</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}