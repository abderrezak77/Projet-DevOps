import React from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
          <Search size={64} className="text-gray-400" />
        </div>
        <h1 className="text-6xl font-black text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          Page introuvable
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-royal-purple to-royal-blue hover:from-royal-blue hover:to-royal-purple text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
};

