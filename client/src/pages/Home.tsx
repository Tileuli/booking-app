/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Calendar, User, Clock, CheckCircle, Building2, ArrowRight, Search } from "lucide-react";

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
  const [slotsDate, setSlotsDate] = useState<string>("");
  const [slots, setSlots] = useState<number[]>([]);
  const [isLoadingSpecs, setIsLoadingSpecs] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    api.get<Organization[]>("/api/organizations")
      .then(r => setOrgs(r.data))
      .catch(() => toast.error("Не удалось загрузить организации"));
  }, []);

  const filteredOrgs = useMemo(() => {
    if (!searchTerm) return orgs;
    return orgs.filter(org => 
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orgs, searchTerm]);

  const loadSpecs = async (org: Organization) => {
    try {
      setIsLoadingSpecs(true);
      setSelectedOrg(org); 
      setSpecs([]); 
      setSelectedSpec(null); 
      setSlots([]); 
      setSlotsDate("");
      setSearchTerm("");
      
      const r = await api.get<Specialist[]>(`/api/organizations/${org.id}/specialists`);
      setSpecs(r.data);
    } catch {
      toast.error("Не удалось загрузить специалистов");
    } finally {
      setIsLoadingSpecs(false);
    }
  };

  const loadSlots = async (spec: Specialist, selectedDate?: string) => {
    const dateToUse = selectedDate || date;
    try {
      setIsLoadingSlots(true);
      setSelectedSpec(spec);
      setSlotsDate(dateToUse);
      const r = await api.get<SlotsResponse>(`/api/specialists/${spec.id}/slots`, { params: { date: dateToUse } });
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
    try { 
      const options: Intl.DateTimeFormatOptions = { 
        day: 'numeric', 
        month: 'long',
        weekday: 'short'
      };
      return new Date(slotsDate + "T00:00:00").toLocaleDateString('ru-RU', options);
    }
    catch { return slotsDate; }
  }, [slotsDate]);

  const resetBooking = () => {
    setSelectedOrg(null);
    setSelectedSpec(null);
    setSpecs([]);
    setSlots([]);
    setSlotsDate("");
    setSearchTerm("");
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (selectedSpec) {
      loadSlots(selectedSpec, newDate);
    }
  };

  const currentStep = selectedOrg ? (selectedSpec ? 3 : 2) : 1;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Compact Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-6 px-6 py-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <div>
              <span className="font-bold text-5xl text-blue-600">JAZYL</span>
              <p className="text-md text-gray-600">Онлайн запись</p>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Запишитесь в пару кликов
          </h2>
          <p className="text-gray-600 text-sm mb-8 max-w-sm mx-auto">
            Выберите услугу, мастера и удобное время
          </p>
          
          {/* Compact Progress Steps */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center p-3">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 ${
                    currentStep > step 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md scale-105' 
                      : currentStep === step
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-105'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 mx-3 rounded-full transition-all duration-300 ${
                      currentStep > step ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-400'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Organization Selection */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-gray-900">1. Организация</span>
              </div>
            </div>

            <div className="p-4">
              {selectedOrg ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedOrg.name}</div>
                      <div className="text-sm text-blue-600">{selectedOrg.category}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{selectedOrg.address}</div>
                    </div>
                  </div>
                  <button 
                    onClick={resetBooking}
                    className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-100 transition-all duration-200 text-sm"
                  >
                    Изменить
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Найти организацию..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                    />
                  </div>
                  
                  {filteredOrgs.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredOrgs.map(org => (
                        <button
                          key={org.id}
                          onClick={() => loadSpecs(org)}
                          className="w-full text-left p-3 hover:bg-blue-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-blue-200 hover:shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-200">
                                <Building2 className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors duration-200">{org.name}</div>
                                <div className="text-sm text-gray-500">{org.category}</div>
                                <div className="text-xs text-gray-400 mt-0.5">{org.address}</div>
                              </div>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200">
                              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors duration-200" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Specialist Selection */}
          {selectedOrg && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">2. Специалист</span>
                </div>
              </div>

              <div className="p-4">
                {isLoadingSpecs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600 text-sm">Загрузка специалистов...</span>
                  </div>
                ) : selectedSpec ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{selectedSpec.name}</div>
                        <div className="text-sm text-blue-600">{selectedSpec.specialization}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {setSelectedSpec(null); setSlots([]); setSlotsDate("");}}
                      className="text-blue-600 hover:text-blue-800 font-medium px-3 py-1.5 rounded-md hover:bg-blue-100 transition-all duration-200 text-sm"
                    >
                      Изменить
                    </button>
                  </div>
                ) : specs.length > 0 ? (
                  <div className="space-y-2">
                    {specs.map(spec => (
                      <button
                        key={spec.id}
                        onClick={() => loadSlots(spec)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group border border-transparent hover:border-gray-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{spec.name}</div>
                            <div className="text-sm text-gray-500">{spec.specialization}</div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Нет доступных специалистов</p>
                    <p className="text-sm text-gray-400 mt-1">Выберите другую организацию</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Time Slots */}
          {selectedSpec && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-gray-900">3. Выберите время</span>
                  {dateLabel && <span className="text-gray-500 text-sm">• {dateLabel}</span>}
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={e => handleDateChange(e.target.value)}
                  className="px-2.5 py-1.5 border border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none text-sm"
                />
              </div>

              <div className="p-4">
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600 text-sm">Загрузка времени...</span>
                  </div>
                ) : slots.length > 0 ? (
                  <div>
                    <div className="mb-4 text-center">
                      <span className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium text-sm">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {slots.length} свободных слотов
                      </span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {slots.map(m => {
                        const disabled = isPastSlot(slotsDate, m);
                        const isCurrentlyBooking = isBooking === m;
                        
                        return (
                          <button
                            key={m}
                            onClick={() => !disabled && !isCurrentlyBooking && book(m)}
                            disabled={disabled || isCurrentlyBooking}
                            className={`px-2 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                              disabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : isCurrentlyBooking
                                ? "bg-blue-100 text-blue-600 animate-pulse"
                                : "bg-gray-50 text-gray-700 hover:bg-blue-600 hover:text-white hover:scale-105 active:scale-95 border border-gray-200 hover:border-blue-600"
                            }`}
                          >
                            {isCurrentlyBooking ? (
                              <div className="flex items-center justify-center">
                                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            ) : (
                              minutesToHHMM(m)
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : slotsDate ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium">Нет свободных слотов</p>
                    <p className="text-sm text-gray-400 mt-1">Попробуйте выбрать другую дату</p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}