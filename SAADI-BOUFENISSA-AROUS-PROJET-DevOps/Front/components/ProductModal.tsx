import React, { useState, useEffect, useRef } from "react";
import { Product, BidFormValues } from "../types";
import { CurrencyFormatter } from "./Formatters";
import {
  X,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Gavel,
  AlertCircle,
  CheckCircle,
  Heart,
} from "lucide-react";
import { auctionService } from "../services/auctionService";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product: initialProduct,
  onClose,
}) => {
  const [product, setProduct] = useState(initialProduct);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form State - amount can be '' or 0 so user can clear and type freely
  const [formData, setFormData] = useState<BidFormValues>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    amount: initialProduct.currentPrice + 1000,
    isAnonymous: false,
  });

  const lastProductIdRef = useRef(initialProduct.id);

  // Sync internal state if initial product updates
  useEffect(() => {
    setProduct(initialProduct);
    if (lastProductIdRef.current !== initialProduct.id) {
      lastProductIdRef.current = initialProduct.id;
      setFormData((prev) => ({
        ...prev,
        amount: initialProduct.currentPrice + 1000,
      }));
    }
  }, [initialProduct]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Basic Validation
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber) {
      setError("Veuillez remplir tous les champs requis");
      return;
    }

    // Validate phone number (must start with 0 and have exactly 10 digits)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError("Le numéro de téléphone doit commencer par 0 et contenir exactement 10 chiffres");
      return;
    }

    const minAmount = product.currentPrice + 1;
    const bidAmount = formData.amount === "" || formData.amount === null || formData.amount === undefined
      ? NaN
      : Number(formData.amount);
    if (isNaN(bidAmount) || bidAmount < minAmount) {
      setError(`Le montant doit être au minimum ${minAmount.toLocaleString("fr-FR")} € (supérieur au prix actuel)`);
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedProduct = await auctionService.placeBid(product.id, {
        bidderName: `${formData.firstName} ${formData.lastName}`,
        phoneNumber: formData.phoneNumber,
        amount: bidAmount,
        isAnonymous: formData.isAnonymous,
      });

      setProduct(updatedProduct);
      setSuccess(true);
      // Reset form amount for next bid
      setFormData((prev) => ({
        ...prev,
        amount: updatedProduct.currentPrice + 1000,
      }));
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de la soumission de l'offre");
    } finally {
      setIsSubmitting(false);
    }
  };

  const lastBid = product.bids.length > 0 ? product.bids[0] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close Button Mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 bg-black/20 text-white rounded-full hover:bg-black/40 md:hidden"
        >
          <X size={20} />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-gray-100 relative group min-h-[300px] md:min-h-full">
          <img
            src={product.images[currentImageIndex]}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          {/* Navigation Arrows */}
          {product.images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 p-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === currentImageIndex
                    ? "border-primary-500 scale-110 shadow-lg"
                    : "border-white/50 opacity-70"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              {/* Category removed */}
              <h2 className="text-3xl font-bold text-gray-900 mt-2 leading-tight">
                {product.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="hidden md:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6 border-b border-gray-100 pb-6">
            {product.description}
          </p>

          <div className="bg-royal-purple/5 border border-royal-purple/10 p-3 rounded-lg mb-6 flex items-start gap-3">
            <Heart
              className="text-royal-purple shrink-0 mt-1"
              size={18}
              fill="currentColor"
            />
            <p className="text-sm text-gray-700">
              <strong>Info:</strong> Participez à cette enchère de prestige et découvrez des articles exceptionnels.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-gray-500 text-sm block mb-1">
                Enchère actuelle
              </span>
              <CurrencyFormatter
                value={product.currentPrice}
                className="text-2xl text-royal-purple"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <span className="text-gray-500 text-sm block mb-1">
                Prix de départ
              </span>
              <CurrencyFormatter
                value={product.startingPrice}
                className="text-lg text-gray-700"
              />
            </div>
          </div>

          {/* Recent Bid Info */}
          {lastBid && (
            <div className="mb-6 flex items-center gap-3 bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-100 text-sm">
              <Gavel size={18} />
              <span>
                Dernière enchère par{" "}
                <strong>
                  {lastBid.isAnonymous ? "Anonyme" : lastBid.bidderName}
                </strong>{" "}
                de{" "}
                <CurrencyFormatter
                  value={lastBid.amount}
                  className="text-amber-900"
                />
              </span>
            </div>
          )}

          {/* Bidding Form */}
          <div className="mt-auto bg-white border-t border-gray-100 pt-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="bg-royal-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                !
              </span>
              Placer une enchère
            </h3>

            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center animate-in fade-in zoom-in">
                <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle size={28} />
                </div>
                <h4 className="text-green-800 font-bold text-lg mb-1">
                  Enchère reçue!
                </h4>
                <p className="text-green-600 text-sm mb-4">
                  Merci pour votre participation.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-royal-purple hover:underline font-semibold text-sm"
                >
                  Placer une autre enchère
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      minLength={2}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-all outline-none"
                      placeholder="Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      minLength={2}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-all outline-none"
                      placeholder="Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    required
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    pattern="0\d{9}"
                    maxLength={10}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-all outline-none font-mono"
                    dir="ltr"
                    placeholder="0550 00 00 00"
                    title="Le numéro doit commencer par 0 et contenir 10 chiffres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant de l'enchère (€)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="amount"
                      step="1"
                      min="0"
                      placeholder={`Min. ${(product.currentPrice + 1).toLocaleString("fr-FR")} €`}
                      value={formData.amount === "" ? "" : formData.amount}
                      onChange={handleInputChange}
                      onFocus={(e) => e.target.select()}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-all outline-none font-bold text-lg"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-sans text-sm font-normal">
                      €
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum : <CurrencyFormatter value={product.currentPrice + 1} />
                  </p>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        formData.isAnonymous
                          ? "bg-royal-purple text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {formData.isAnonymous ? (
                        <Shield size={16} />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800 block">
                        Anonyme
                      </span>
                      <span className="text-xs text-gray-500 block">
                        Votre nom ne sera pas affiché
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={handleInputChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-royal-purple"></div>
                  </label>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-royal-purple to-royal-blue hover:from-royal-blue hover:to-royal-purple text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      En cours...
                    </>
                  ) : (
                    <>Confirmer l'enchère</>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
