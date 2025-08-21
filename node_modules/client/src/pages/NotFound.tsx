import { Home, ArrowLeft, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated 404 Number */}
        <div className="relative mb-8">
          <div className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 text-8xl md:text-9xl font-black text-slate-300 -z-10 transform translate-x-1 translate-y-1">
            404
          </div>
        </div>

        {/* Main Content */}
        <div className="mb-8 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-700">
            Страница не найдена
          </h1>
          <p className="text-md text-slate-600 max-w-md mx-auto">
            Упс! Похоже, что страница, которую вы ищете, решила отправиться в отпуск.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-48 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            {/* Floating elements */}
            <div className="absolute top-2 right-4 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-4 left-6 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute top-6 left-8 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={handleGoHome}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <Home className="w-4 h-4" />
            На главную
          </button>
          
          <button 
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-lg font-medium transition-all duration-200 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Назад
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6">
          <h3 className="font-semibold text-slate-700 mb-2">Что делать дальше?</h3>
          <div className="text-xs text-slate-600 space-y-1">
            <p>• Проверьте правильность введённого адреса</p>
            <p>• Вернитесь на главную страницу</p>
            <p>• Воспользуйтесь поиском по сайту</p>
          </div>
        </div>

        {/* Error Code */}
        <div className="mt-8 text-xs text-slate-400 font-mono">
          ERROR_CODE: PAGE_NOT_FOUND_404
        </div>
      </div>
    </div>
  );
}