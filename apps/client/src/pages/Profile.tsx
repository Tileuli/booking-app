/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import { toast } from "sonner";

type Appointment = {
  id: number;
  startAt: string;
  durationMin: number;
  specialist: {
    id: number;
    name: string;
    specialization: string;
    organization: {
      id: number;
      name: string;
      address: string;
      timeZone: string;
    };
  };
};

function formatDT(iso: string, tz: string) {
  return DateTime.fromISO(iso, { zone: "utc" })
    .setZone(tz)
    .toFormat("dd.MM.yyyy, HH:mm");
}

export default function Profile() {
  const nav = useNavigate();
  const [items, setItems] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      toast.warning("Войдите в аккаунт, чтобы просмотреть записи");
      nav("/login");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function load() {
    try {
      setIsLoading(true);
      const r = await api.get<Appointment[]>("/api/my-appointments");
      setItems(r.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Не удалось загрузить ваши записи");
    } finally {
      setIsLoading(false);
    }
  }

  async function cancel(id: number) {
    if (!confirm("Отменить запись?")) return;
    try {
      setCancellingId(id);
      await api.delete(`/api/appointments/${id}`);
      toast.success("Запись отменена");
      await load();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Не удалось отменить запись");
    } finally {
      setCancellingId(null);
    }
  }

  const upcoming = useMemo(
    () => items.filter((i) => new Date(i.startAt) >= new Date()),
    [items]
  );
  const past = useMemo(
    () => items.filter((i) => new Date(i.startAt) < new Date()),
    [items]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-6xl mx-auto p-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-slate-600 font-medium">Загружаем ваши записи...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-8 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-500/25 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent">
            Мои записи
          </h1>
          <p className="text-slate-600 text-lg">Управляйте своими визитами к специалистам</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-900/5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{upcoming.length}</p>
                <p className="text-slate-600 text-sm">Предстоящие</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-900/5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{past.length}</p>
                <p className="text-slate-600 text-sm">Завершенные</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-lg shadow-slate-900/5">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{items.length}</p>
                <p className="text-slate-600 text-sm">Всего записей</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span>Предстоящие визиты</span>
            </h2>
            {upcoming.length > 0 && (
              <Link
                to="/"
                className="group inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transform"
              >
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-semibold">Записаться еще</span>
              </Link>
            )}
          </div>

          {upcoming.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center shadow-lg shadow-slate-900/5">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-3">Нет предстоящих записей</h3>
              <p className="text-slate-500 mb-6">Самое время записаться к специалисту</p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg shadow-blue-500/25"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Записаться</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcoming.map((a) => (
                <div
                  key={a.id}
                  className="group glass-card rounded-2xl p-6 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-800 mb-1">{a.specialist.name}</h3>
                      <p className="text-blue-600 font-semibold text-sm mb-2">{a.specialist.specialization}</p>
                      <div className="space-y-1">
                        <p className="text-slate-600 text-sm flex items-center">
                          <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0V9a2 2 0 012-2h4a2 2 0 012 2v12M7 3v18M21 21v-8a2 2 0 00-2-2h-4" />
                          </svg>
                          {a.specialist.organization.name}
                        </p>
                        <p className="text-slate-500 text-sm flex items-center">
                          <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {a.specialist.organization.address}
                        </p>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold text-blue-800">
                          {formatDT(a.startAt, a.specialist.organization.timeZone)}
                        </p>
                        <p className="text-blue-600 text-sm">Продолжительность: {a.durationMin} мин</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => cancel(a.id)}
                      disabled={cancellingId === a.id}
                      className="flex-1 group relative overflow-hidden px-4 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 hover:border-slate-400 text-slate-700 hover:text-slate-800 rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5 transform"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-200/50 to-slate-300/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      {cancellingId === a.id ? (
                        <div className="relative flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin"></div>
                          <span>Отменяем...</span>
                        </div>
                      ) : (
                        <div className="relative flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span>Отменить</span>
                        </div>
                      )}
                    </button>
                    
                    <Link
                      to="/"
                      className="flex-1 group relative overflow-hidden px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white rounded-xl transition-all duration-300 font-semibold text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transform"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Новая запись</span>
                      </div>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Past Appointments */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span>История визитов</span>
          </h2>

          {past.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-500 text-lg">История визитов пуста</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {past.map((a) => (
                <div
                  key={a.id}
                  className="glass rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-700 mb-1">{a.specialist.name}</h3>
                      <p className="text-slate-500 text-sm font-medium mb-2">{a.specialist.specialization}</p>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600 mb-4">
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0V9a2 2 0 012-2h4a2 2 0 012 2v12M7 3v18M21 21v-8a2 2 0 00-2-2h-4" />
                      </svg>
                      {a.specialist.organization.name}
                    </p>
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {a.specialist.organization.address}
                    </p>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-slate-600 font-medium text-sm">
                      {formatDT(a.startAt, a.specialist.organization.timeZone)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}