import React, { useEffect, useState } from "react";
import { Product } from "../types";
import { ProductCard } from "../components/ProductCard";
import { auctionService } from "../services/auctionService";
import { Search, Heart } from "lucide-react";

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Load initial data and subscribe to updates
  useEffect(() => {
    const loadData = () => {
      setProducts(auctionService.getProducts());
    };

    loadData();

    const handleUpdate = () => {
      loadData();
    };

    auctionService.addEventListener("update", handleUpdate);
    return () => {
      auctionService.removeEventListener("update", handleUpdate);
    };
  }, []);

  // Derived state for filtering
  const filteredProducts = products.filter((product) => {
    return product.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <>
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-royal-purple via-royal-blue to-royal-purple text-white rounded-3xl p-8 mb-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-royal-gold opacity-10 blur-3xl"></div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Enchères Royale</h2>
            <p className="text-gray-100 max-w-2xl text-lg leading-relaxed">
              Découvrez des articles d'exception lors de nos enchères prestigieuses.
              Participez à des ventes aux enchères de qualité supérieure et trouvez des objets rares.
            </p>
          </div>

          <div className="absolute -bottom-10 -right-10 text-white/10 rotate-12">
            <Heart size={300} fill="currentColor" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Articles disponibles
            </h2>
          </div>
        </div>

        {/* Mobile Search (visible only on mobile) */}
        <div className="md:hidden mb-6 relative">
          <input
            type="text"
            placeholder="Rechercher des articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 shadow-sm"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
        </div>

        {/* Desktop Search */}
        <div className="hidden md:block mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Rechercher des articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border-none rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-royal-purple focus:bg-white transition-all text-sm"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">Aucun résultat</h3>
            <p className="text-gray-500">Essayez avec d'autres mots-clés</p>
          </div>
        )}
      </div>
    </>
  );
};
