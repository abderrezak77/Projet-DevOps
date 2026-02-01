import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { CurrencyFormatter } from './Formatters';
import { Clock, TrendingUp, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const CountdownTimer: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endTime - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft <= 0) {
    return <span className="text-red-400 font-bold">Terminée</span>;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <span className="text-white font-mono font-bold text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
      {days}j {hours}h {minutes}m {seconds}s
    </span>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link 
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden cursor-pointer transform hover:-translate-y-1 block"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={product.images[0]} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
           <div className="text-white text-xs flex items-center gap-2 flex-wrap">
             <Clock size={14} className="text-gold-400 shrink-0" />
             <span className="font-bold">Temps restant:</span>
             <CountdownTimer endTime={product.endTime} />
           </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-royal-purple transition-colors">
              {product.title}
            </h3>
        </div>
        
        <div className="space-y-2">
          {/* Prices Section */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Tag size={16} className="text-gray-400" />
                    <span className="text-gray-400 font-bold text-sm">Prix de départ:</span>
                </div>
                <CurrencyFormatter value={product.startingPrice} isStrikethrough={true} className="text-gray-400" />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-royal-purple" />
                    <span className="text-gray-700 font-bold text-sm">Prix actuel:</span>
                </div>
                <CurrencyFormatter value={product.currentPrice} className="text-base font-bold text-royal-purple" />
            </div>
          </div>
          
          <div className="pt-3 mt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
            <span>{(product.bidsCount ?? product.bids.length) || 0} enchère(s)</span>
            <span className="text-primary-600 font-bold group-hover:underline">Enchérir</span>
          </div>
        </div>
      </div>
    </Link>
  );
};