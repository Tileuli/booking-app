/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { api } from "../lib/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

export default function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password strength validation
  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Слабый", "Средний", "Хороший", "Отличный"];
  const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.warning("Заполните все поля");
      return;
    }
    if (password.length < 6) {
      toast.warning("Пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      setIsLoading(true);
      const r = await api.post("/api/auth/register", { name, email, password });
      localStorage.setItem("token", r.data.token);
      toast.success("Регистрация прошла успешно");
      nav("/");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Ошибка регистрации");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl shadow-blue-500/25 mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 bg-clip-text text-transparent mb-2">
            Создать аккаунт
          </h1>
          <p className="text-slate-600">Присоединяйтесь к нашей платформе бронирования</p>
        </div>

        {/* Register Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/60 shadow-xl shadow-slate-900/5 p-8">
          <form onSubmit={submit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Полное имя</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none
                    transition-all duration-200 placeholder-slate-400"
                  placeholder="Введите ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span>Email адрес</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none
                    transition-all duration-200 placeholder-slate-400"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 flex items-center space-x-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Пароль</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pr-12 bg-white border-2 border-slate-200 rounded-xl 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none
                    transition-all duration-200 placeholder-slate-400"
                  placeholder="Создайте надежный пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Надежность пароля</span>
                    <span className={`font-semibold ${passwordStrength >= 3 ? 'text-blue-600' : passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {strengthLabels[passwordStrength - 1] || "Очень слабый"}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded-full transition-colors duration-200
                          ${passwordStrength >= level 
                            ? strengthColors[passwordStrength - 1] || "bg-gray-200"
                            : "bg-gray-200"
                          }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !name || !email || !password || password.length < 6}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl
                hover:from-blue-700 hover:to-blue-800 
                focus:ring-4 focus:ring-blue-500/25 focus:outline-none
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                transform hover:-translate-y-0.5 active:translate-y-0 disabled:hover:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Создание аккаунта...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Создать аккаунт</span>
                </span>
              )}
            </button>
          </form>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              Создавая аккаунт, вы соглашаетесь с нашими{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">Условиями использования</a>
              {" "}и{" "}
              <a href="#" className="text-blue-600 hover:underline font-medium">Политикой конфиденциальности</a>
            </p>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-slate-500 font-medium">или</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center space-y-3">
              <p className="text-slate-600 text-sm">Уже есть аккаунт?</p>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-white/60 
                  hover:bg-white hover:border-slate-300 text-slate-700 font-medium rounded-xl text-sm
                  transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Войти в аккаунт</span>
              </Link>
            </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5">
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs text-slate-600">Защищенная регистрация с шифрованием данных</span>
          </div>
        </div>
      </div>
    </div>
  );
}