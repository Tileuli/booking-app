import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Header() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const token = localStorage.getItem("token");

  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }

  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
          ${active
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/20"
            : "text-slate-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm"}`
        }
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-3 group"
        >
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0V9a2 2 0 012-2h4a2 2 0 012 2v12M7 3v18M21 21v-8a2 2 0 00-2-2h-4"/>
            </svg>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            Jazyl.kz
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/">Главная</NavLink>
          {!token && <NavLink to="/login">Вход</NavLink>}
          {!token && <NavLink to="/register">Регистрация</NavLink>}
          {token && <NavLink to="/profile">Профиль</NavLink>}
          {token && (
            <button
              onClick={logout}
              className="ml-2 px-4 py-2.5 rounded-xl text-sm font-semibold 
                bg-white border border-slate-200 text-slate-700 
                hover:bg-slate-100 hover:border-slate-300 hover:shadow-lg
                transition-all duration-200"
            >
              Выйти
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}