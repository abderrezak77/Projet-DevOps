import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product } from "../types";
import { ProductPage } from "../components/ProductPage";
import { auctionService } from "../services/auctionService";

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      try {
        const productData = await auctionService.fetchProductWithBids(Number(id));
        setProduct(productData);
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();

    // Subscribe to updates
    const handleUpdate = () => {
      loadProduct();
    };

    auctionService.addEventListener("update", handleUpdate);
    return () => {
      auctionService.removeEventListener("update", handleUpdate);
    };
  }, [id]);

  const handleBack = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-royal-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Article introuvable
          </h2>
          <p className="text-gray-600 mb-6">L'article demandé n'existe pas</p>
          <button
            onClick={handleBack}
            className="bg-royal-purple text-white px-6 py-3 rounded-xl font-bold hover:bg-royal-blue transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return <ProductPage product={product} onBack={handleBack} />;
};

