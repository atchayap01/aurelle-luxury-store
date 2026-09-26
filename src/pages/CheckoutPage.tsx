import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ShieldCheck, Truck, CreditCard, Banknote, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface CheckoutPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOrderCompleted: (order: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  onNavigate,
  onOrderCompleted,
}) => {
  const { cart, subtotal, shippingFee, total, clearCart } = useCart();
  const { user } = useAuth();
  const { error, success } = useToast();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.addresses?.[0]?.address || '',
    city: user?.addresses?.[0]?.city || '',
    state: user?.addresses?.[0]?.state || 'Maharashtra',
    postalCode: user?.addresses?.[0]?.postalCode || '',
    country: 'India',
    paymentMethod: 'Cash on Delivery' as 'Cash on Delivery' | 'Card',
  });

  useEffect(() => {
    if (user) {
      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        ...(defaultAddr && {
          address: defaultAddr.address,
          city: defaultAddr.city,
          state: defaultAddr.state,
          postalCode: defaultAddr.postalCode,
          country: defaultAddr.country,
        }),
      }));
    }
  }, [user]);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-2xl text-[#2C2520] mb-3">Your Bag is Empty</h2>
        <p className="text-xs text-[#A99B8C] mb-6">
          Add items to your shopping bag before proceeding to checkout.
        </p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-3 bg-[#2C2520] text-[#F8F5EF] text-xs uppercase tracking-widest"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      error('Required Information', 'Please complete your full name, email, and contact number.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      error('Invalid Email', 'Please provide a valid email for order notifications.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.address.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
      error('Shipping Information', 'Please provide your complete street address, city, and postal code.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setCheckoutError(null);
    setIsSubmitting(true);

    try {
      const itemsPayload = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const res = await ordersAPI.createOrder({
        items: itemsPayload,
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
      });

      clearCart();
      success('Order Placed Successfully', `Your order ${res.order.orderNumber} is confirmed.`);
      onOrderCompleted(res.order);
      onNavigate('order-success', { orderId: res.order.orderNumber || res.order.id });
    } catch (err: any) {
      console.error('Checkout error:', err);
      const msg = err.response?.data?.error || 'Failed to place order. Please review your details.';
      setCheckoutError(msg);
      error('Order Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('cart')}
        className="text-xs uppercase tracking-widest text-[#A99B8C] hover:text-[#2C2520] mb-8 inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Shopping Bag</span>
      </button>

      {/* Progress Steps Header */}
      <div className="mb-12 border-b border-[#E8DED0] pb-6">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2520] font-normal mb-6">
          Atelier Checkout
        </h1>

        <div className="flex items-center justify-between max-w-lg">
          {/* Step 1 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                step >= 1 ? 'bg-[#2C2520] text-white font-medium' : 'bg-[#E8DED0] text-[#A99B8C]'
              }`}
            >
              {step > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <span
              className={`text-xs uppercase tracking-wider ${
                step === 1 ? 'font-semibold text-[#2C2520]' : 'text-[#A99B8C]'
              }`}
            >
              Contact
            </span>
          </div>

          <div className="flex-1 h-[1px] bg-[#E8DED0] mx-4" />

          {/* Step 2 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                step >= 2 ? 'bg-[#2C2520] text-white font-medium' : 'bg-[#E8DED0] text-[#A99B8C]'
              }`}
            >
              {step > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <span
              className={`text-xs uppercase tracking-wider ${
                step === 2 ? 'font-semibold text-[#2C2520]' : 'text-[#A99B8C]'
              }`}
            >
              Delivery
            </span>
          </div>

          <div className="flex-1 h-[1px] bg-[#E8DED0] mx-4" />

          {/* Step 3 */}
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono transition-colors ${
                step === 3 ? 'bg-[#2C2520] text-white font-medium' : 'bg-[#E8DED0] text-[#A99B8C]'
              }`}
            >
              3
            </div>
            <span
              className={`text-xs uppercase tracking-wider ${
                step === 3 ? 'font-semibold text-[#2C2520]' : 'text-[#A99B8C]'
              }`}
            >
              Payment
            </span>
          </div>
        </div>
      </div>

      {checkoutError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{checkoutError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-7 bg-[#F8F5EF] border border-[#E8DED0] p-6 sm:p-8 rounded-xs space-y-8">
          
          {/* STEP 1: Contact Information */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="font-serif text-2xl text-[#2C2520]">Customer Information</h2>
                <p className="text-xs text-[#A99B8C] mt-1">
                  We will dispatch tracking notifications and your digital authentication certificate to this address.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="e.g. Eleanor Vance"
                    required
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-3 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="eleanor@example.com"
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-3 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-3 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-[#2C2520] text-[#F8F5EF] hover:bg-[#3D342E] text-xs uppercase tracking-[0.18em] font-semibold transition-colors"
                >
                  Continue to Delivery Address
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Shipping Address */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl text-[#2C2520]">Shipping Destination</h2>
                  <p className="text-xs text-[#A99B8C] mt-1">
                    Delivered via white-glove climate-controlled courier service.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs uppercase tracking-wider text-[#A99B8C] hover:text-[#2C2520]"
                >
                  Edit Contact
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                    Street Address & Apartment / Suite *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Penthouse 4, Ashoka Greens, Indiranagar"
                    required
                    className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-3 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Bengaluru"
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-3 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Karnataka"
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-3 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                      Postal Code / PIN *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="560038"
                      required
                      className="w-full bg-[#F8F5EF] border border-[#E8DED0] px-4 py-3 text-sm text-[#2C2520] focus:outline-none focus:border-[#2C2520]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-wider text-[#2C2520] font-medium block mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      disabled
                      className="w-full bg-[#E8DED0]/40 border border-[#E8DED0] px-4 py-3 text-sm text-[#2C2520] opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border border-[#E8DED0] text-[#2C2520] text-xs uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-[#2C2520] text-[#F8F5EF] hover:bg-[#3D342E] text-xs uppercase tracking-[0.18em] font-semibold transition-colors"
                >
                  Review Order & Payment
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment & Confirmation */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-serif text-2xl text-[#2C2520]">Payment Method</h2>
                  <p className="text-xs text-[#A99B8C] mt-1">
                    Select your preferred settlement method.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs uppercase tracking-wider text-[#A99B8C] hover:text-[#2C2520]"
                >
                  Edit Address
                </button>
              </div>

              <div className="space-y-3">
                {/* Cash on Delivery Option */}
                <label
                  className={`flex items-start gap-3.5 p-4 border rounded-xs cursor-pointer transition-all ${
                    formData.paymentMethod === 'Cash on Delivery'
                      ? 'border-[#2C2520] bg-[#E8DED0]/30 shadow-xs'
                      : 'border-[#E8DED0] bg-[#F8F5EF]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Cash on Delivery"
                    checked={formData.paymentMethod === 'Cash on Delivery'}
                    onChange={() =>
                      setFormData((p) => ({ ...p, paymentMethod: 'Cash on Delivery' }))
                    }
                    className="mt-0.5 accent-[#2C2520]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#2C2520]" />
                      <span className="text-sm font-medium text-[#2C2520]">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[10px] bg-[#D6C2A5]/60 text-[#2C2520] px-2 py-0.5 uppercase tracking-wider font-semibold">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-[#A99B8C] mt-1 leading-relaxed">
                      Settle your balance upon receipt following white-glove doorstep inspection. Verified domestic couriers only.
                    </p>
                  </div>
                </label>

                {/* Online Card Option */}
                <label
                  className={`flex items-start gap-3.5 p-4 border rounded-xs cursor-pointer transition-all ${
                    formData.paymentMethod === 'Card'
                      ? 'border-[#2C2520] bg-[#E8DED0]/30 shadow-xs'
                      : 'border-[#E8DED0] bg-[#F8F5EF]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Card"
                    checked={formData.paymentMethod === 'Card'}
                    onChange={() => setFormData((p) => ({ ...p, paymentMethod: 'Card' }))}
                    className="mt-0.5 accent-[#2C2520]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#2C2520]" />
                      <span className="text-sm font-medium text-[#2C2520]">
                        Credit / Debit Card (Online Sandbox)
                      </span>
                    </div>
                    <p className="text-xs text-[#A99B8C] mt-1 leading-relaxed">
                      Pre-authorized sandbox card simulation (Visa, Mastercard, Amex). Instant payment status.
                    </p>
                  </div>
                </label>
              </div>

              {/* Delivery Destination recap */}
              <div className="p-4 bg-[#E8DED0]/20 border border-[#E8DED0] text-xs text-[#2C2520] space-y-1">
                <p className="font-semibold uppercase tracking-wider text-[11px] text-[#A99B8C]">
                  Consignment Recipient:
                </p>
                <p className="font-medium">{formData.fullName} ({formData.phone})</p>
                <p>{formData.address}, {formData.city}, {formData.state} - {formData.postalCode}</p>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border border-[#E8DED0] text-[#2C2520] text-xs uppercase tracking-wider"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="px-8 py-4 bg-[#2C2520] hover:bg-[#3D342E] text-[#F8F5EF] text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <span>{isSubmitting ? 'Confirming Order...' : 'Confirm & Place Order'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 bg-[#E8DED0]/30 p-6 sm:p-8 border border-[#E8DED0] rounded-xs space-y-6 sticky top-28">
          <h3 className="font-serif text-xl text-[#2C2520]">Order Summary</h3>

          {/* Mini items list */}
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 items-center">
                <div className="w-12 h-14 bg-[#E8DED0] overflow-hidden shrink-0 border border-[#E8DED0]">
                  <ImageWithFallback
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-serif font-medium text-[#2C2520] line-clamp-1">{item.product.name}</p>
                  <p className="text-[#A99B8C] font-mono">Qty: {item.quantity}</p>
                </div>
                <div className="font-mono text-xs font-semibold text-[#2C2520]">
                  {formatCurrency(item.product.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#E8DED0] space-y-2.5 text-xs text-[#2C2520]">
            <div className="flex justify-between">
              <span className="text-[#A99B8C] uppercase tracking-wider">Subtotal</span>
              <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A99B8C] uppercase tracking-wider">Shipping</span>
              <span className="font-mono font-medium">
                {shippingFee === 0 ? 'Complimentary' : formatCurrency(shippingFee)}
              </span>
            </div>
            <div className="pt-3 border-t border-[#E8DED0] flex justify-between text-base font-semibold">
              <span className="uppercase tracking-wider">Final Total</span>
              <span className="font-mono text-lg text-[#2C2520]">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8DED0] space-y-2 text-[11px] text-[#A99B8C]">
            <div className="flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-[#2C2520] shrink-0" />
              <span>Complimentary insured transit</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2C2520] shrink-0" />
              <span>100% Genuine Atelier Craftsmanship</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
