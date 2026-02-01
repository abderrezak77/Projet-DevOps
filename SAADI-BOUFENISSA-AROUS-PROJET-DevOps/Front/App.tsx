import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { AdminPage } from "./pages/AdminPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { Gavel } from "lucide-react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 pb-20">
      {/* Navbar - Always visible */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-royal-purple to-royal-blue text-white p-2.5 rounded-xl shadow-lg">
                <Gavel size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                  Enchères <span className="text-royal-purple">Royale</span>
                </h1>
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  Enchères de prestige
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <Link 
                to="/admin" 
                className="px-4 py-2 bg-royal-purple text-white rounded-lg hover:bg-royal-blue transition-colors font-medium text-sm"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4 text-gray-600">
            <Gavel size={20} className="text-royal-purple" />
            <span className="font-bold text-xl">Enchères Royale</span>
          </div>
          <p className="text-gray-500 text-sm">
            Tous droits réservés &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
