import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Product, BidFormValues } from "../types";
import { CurrencyFormatter } from "./Formatters";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  Gavel,
  AlertCircle,
  CheckCircle,
  Heart,
  ArrowRight,
  Clock,
  Users,
  Timer,
} from "lucide-react";
import { auctionService } from "../services/auctionService";

interface ProductPageProps {
  product: Product;
  onBack: () => void;
}

const BigCountdown: React.FC<{ endTime: number }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endTime - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (timeLeft <= 0) {
    return (
      <div className="text-center p-4 bg-red-50 text-red-600 rounded-xl font-bold">
        Enchère terminée
      </div>
    );
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const TimeBlock = ({ val, label }: { val: number; label: string }) => (
    <div className="flex flex-col items-center bg-gray-900 text-white rounded-lg p-2 min-w-[60px]">
      <span className="text-2xl font-mono font-bold">{val}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center gap-2" dir="ltr">
      <TimeBlock val={days} label="jours" />
      <span className="text-2xl font-bold text-gray-300">:</span>
      <TimeBlock val={hours} label="heures" />
      <span className="text-2xl font-bold text-gray-300">:</span>
      <TimeBlock val={minutes} label="min" />
      <span className="text-2xl font-bold text-gray-300">:</span>
      <TimeBlock val={seconds} label="sec" />
    </div>
  );
};

export const ProductPage: React.FC<ProductPageProps> = ({
  product: initialProduct,
  onBack,
}) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(initialProduct);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Form State - amount can be '' or 0 so user can clear and type freely
  const [formData, setFormData] = useState<BidFormValues>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    amount: initialProduct.currentPrice + 1000,
    isAnonymous: false,
  });

  const lastProductIdRef = useRef(initialProduct.id);

  useEffect(() => {
    setProduct(initialProduct);
    // Only set default amount when switching to a different product (not when user cleared the field)
    if (lastProductIdRef.current !== initialProduct.id) {
      lastProductIdRef.current = initialProduct.id;
      setFormData((prev) => ({
        ...prev,
        amount: initialProduct.currentPrice + 1000,
      }));
    }
  }, [initialProduct]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePrevImage();
    }

    setTouchStart(0);
    setTouchEnd(0);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-royal-purple transition-colors mb-6 font-bold"
      >
        <ArrowRight size={20} />
        Retour aux enchères
      </button>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Right Column: Images & Description & Contributors */}
        <div className="w-full lg:w-7/12 space-y-8">
          {/* Images */}
          <div>
            <div
              className="relative aspect-[4/3] bg-gray-100 rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-4 group touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={product.images[currentImageIndex]}
                alt={product.title}
                className="w-full h-full object-cover select-none"
              />

              {product.images.length > 1 && (
                <>
                  {/* Navigation arrows - hidden on mobile, shown on hover on desktop */}
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white text-gray-800 opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white text-gray-800 opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Dots navigation */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {product.images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`transition-all rounded-full ${
                          idx === currentImageIndex
                            ? "w-8 h-2 bg-white"
                            : "w-2 h-2 bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`Voir image ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Détails de l'article
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
              {product.description}
            </p>
          </div>

          {/* Contributors List */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="text-royal-purple" />
              Liste des enchères ({product.bids.length})
            </h3>

            {product.bids.length > 0 ? (
              <div className="space-y-4">
                {product.bids.map((bid, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0
                            ? "bg-gold-500 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {index === 0 ? <Gavel size={20} /> : <User size={20} />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 flex items-center gap-2">
                          {bid.isAnonymous ? "Anonyme" : bid.bidderName}
                          {index === 0 && (
                            <span className="bg-gold-400/20 text-gold-600 text-[10px] px-2 py-0.5 rounded-full">
                              Plus haute
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <CurrencyFormatter
                      value={bid.amount}
                      className="text-lg font-bold text-gray-700"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Gavel size={32} className="mx-auto mb-2 opacity-50" />
                <p>Soyez le premier à enchérir</p>
              </div>
            )}
          </div>
        </div>

        {/* Left Column: Info & Action */}
        <div className="w-full lg:w-5/12 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-lg sticky top-24">
            <div className="mb-6">
              <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
                {product.title}
              </h1>
            </div>

            {/* Countdown Box */}
            <div className="bg-gray-800 rounded-2xl p-5 mb-8 text-center shadow-lg">
              <div className="flex items-center justify-center gap-2 text-gold-400 mb-3 text-sm font-bold uppercase tracking-wider">
                <Timer size={16} />
                Fin dans
              </div>
              <BigCountdown endTime={product.endTime} />
            </div>

            <div className="space-y-4 mb-8 pb-8 border-b border-gray-100">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                <span className="text-gray-500 text-sm font-medium">
                  Prix de départ
                </span>
                <CurrencyFormatter
                  value={product.startingPrice}
                  isStrikethrough={true}
                  className="text-gray-400 text-lg"
                />
              </div>

              <div className="flex justify-between items-center bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <span className="text-gray-700 font-bold">Prix actuel</span>
                <CurrencyFormatter
                  value={product.currentPrice}
                  className="text-3xl text-royal-purple"
                />
              </div>
            </div>

            {/* Bid Form */}
            {success ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-in fade-in zoom-in">
                <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-green-800 font-bold text-xl mb-3">
                  Merci beaucoup!
                </h4>
                <p className="text-green-700 mb-2 text-base leading-relaxed">
                  Votre enchère a été enregistrée avec succès. Si vous remportez l'enchère, nous vous contacterons après la fin de celle-ci.
                </p>
                <p className="text-green-600 mb-6 text-sm">
                  Merci encore pour votre participation!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => navigate("/")}
                    className="text-white bg-royal-purple hover:bg-royal-blue px-6 py-3 rounded-xl font-bold shadow-md transition-colors"
                  >
                    Retour à l'accueil
                  </button>
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-royal-purple bg-white hover:bg-gray-50 border-2 border-royal-purple px-6 py-3 rounded-xl font-bold transition-colors"
                  >
                    Nouvelle enchère
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <span className="w-2 h-6 bg-royal-purple rounded-full"></span>
                  Placer une enchère
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      minLength={2}
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-all outline-none bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-600">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      minLength={2}
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-all outline-none bg-gray-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-all outline-none font-mono bg-gray-50 focus:bg-white"
                    dir="ltr"
                    placeholder="0550 00 00 00"
                    title="Le numéro doit commencer par 0 et contenir 10 chiffres"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-600">
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
                      className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-royal-purple focus:border-royal-purple transition-all outline-none font-bold text-xl text-royal-purple"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-sans text-sm font-normal">
                      €
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum : <CurrencyFormatter value={product.currentPrice + 1} />
                  </p>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        formData.isAnonymous
                          ? "bg-royal-purple text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {formData.isAnonymous ? (
                        <Shield size={20} />
                      ) : (
                        <User size={20} />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800 block">
                        Anonyme
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
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm font-medium">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-royal-purple to-royal-blue hover:from-royal-blue hover:to-royal-purple text-white py-4 rounded-xl font-bold text-xl shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-[0.98]"
                >
                  {isSubmitting ? "En cours..." : "Confirmer l'enchère"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
