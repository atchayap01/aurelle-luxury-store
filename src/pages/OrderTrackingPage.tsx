import React, { useState, useEffect } from 'react';
import { Search, PackageCheck, AlertCircle, ArrowLeft, Truck, Clock, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';
import { ordersAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderId = '',
  onNavigate,
}) => {
  const [searchId, setSearchId] = useState(initialOrderId);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { success, error } = useToast();

  const loadOrder = async (id: string) => {
    if (!id.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await ordersAPI.getOrderById(id.trim());
      setOrder(data);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setErrorMsg(err.response?.data?.error || 'No consignment found with this order reference.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderId) {
      setSearchId(initialOrderId);
      loadOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrder(searchId);
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      const res = await ordersAPI.cancelOrder(order.id);
      setOrder(res.order);
      setShowCancelModal(false);
      success('Order Cancelled', 'Your order was cancelled and inventory restored.');
    } catch (err: any) {
      error('Cancellation Failed', err.response?.data?.error || 'Unable to cancel this order.');
    } finally {
      setIsCancelling(false);
    }
  };

  const statusTimeline = [
    { label: 'Order Placed', desc: 'Received & Authenticated' },
    { label: 'Processing', desc: 'Curator Packaging & White-Glove Prep' },
    { label: 'Shipped', desc: 'Dispatched with Climate Courier' },
    { label: 'Out for Delivery', desc: 'Arriving at Destination Today' },
    { label: 'Delivered', desc: 'Safely Received & Signed' },
  ];

  const getStatusIndex = (currentStatus: string): number => {
    switch (currentStatus) {
      case 'Order Placed':
        return 0;
      case 'Processing':
        return 1;
      case 'Shipped':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      case 'Cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIndex = order ? getStatusIndex(order.orderStatus) : -1;
  const isCancellable =
    order &&
    order.orderStatus !== 'Cancelled' &&
    (order.orderStatus === 'Order Placed' || order.orderStatus === 'Processing');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="text-xs uppercase tracking-widest text-[#A99B8C] hover:text-[#2C2520] inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Home</span>
      </button>

      {/* Header & Search Bar */}
      <div className="border-b border-[#E8DED0] pb-8">
        <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#A99B8C] block mb-2">
          Courier Tracking & Consignments
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#2C2520] font-normal mb-4">
          Order Tracking
        </h1>
        <p className="text-xs sm:text-sm text-[#A99B8C] max-w-xl mb-6">
          Track the journey of your handpicked pieces from our flagship ateliers to your door.
        </p>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A99B8C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="e.g. AUR-78201 or ord-..."
              className="w-full bg-[#F8F5EF] border border-[#E8DED0] pl-9 pr-3 py-3 text-xs font-mono text-[#2C2520] placeholder-[#A99B8C] focus:outline-none focus:border-[#2C2520]"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchId.trim()}
            className="px-6 py-3 bg-[#2C2520] text-[#F8F5EF] hover:bg-[#3D342E] text-xs uppercase tracking-wider font-semibold transition-colors disabled:opacity-40"
          >
            {isLoading ? 'Locating...' : 'Track'}
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Details View */}
      {order && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Header Summary Card */}
          <div className="bg-[#E8DED0]/30 border border-[#E8DED0] p-6 sm:p-8 rounded-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E8DED0] gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#A99B8C]">
                  Consignment Reference
                </span>
                <h2 className="font-mono text-2xl font-bold text-[#2C2520] mt-0.5">
                  {order.orderNumber}
                </h2>
                <p className="text-xs text-[#A99B8C] mt-1">
                  Placed on {formatDate(order.createdAt)} · Client: {order.userEmail}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 text-xs uppercase tracking-widest font-semibold ${
                    order.orderStatus === 'Cancelled'
                      ? 'bg-red-100 text-red-800'
                      : order.orderStatus === 'Delivered'
                      ? 'bg-[#2C2520] text-[#F8F5EF]'
                      : 'bg-[#D6C2A5]/70 text-[#2C2520]'
                  }`}
                >
                  {order.orderStatus}
                </span>

                {isCancellable && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs text-[#A99B8C] hover:text-red-700 underline uppercase tracking-wider transition-colors"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>

            {/* STATUS TIMELINE */}
            {order.orderStatus === 'Cancelled' ? (
              <div className="py-8 text-center text-xs text-red-800">
                <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-700" />
                <p className="font-semibold text-sm">This consignment was cancelled.</p>
                <p className="text-[#A99B8C] mt-1">Inventory has been returned to our master vault.</p>
              </div>
            ) : (
              <div className="py-8">
                <div className="relative">
                  {/* Timeline track */}
                  <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-[2px] bg-[#E8DED0] -translate-y-1/2 z-0" />
                  
                  {/* Nodes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                    {statusTimeline.map((stepItem, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div
                          key={stepItem.label}
                          className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-2 text-left sm:text-center"
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs transition-colors shrink-0 ${
                              isCompleted
                                ? 'bg-[#2C2520] text-[#F8F5EF]'
                                : 'bg-[#F8F5EF] border border-[#E8DED0] text-[#A99B8C]'
                            } ${isCurrent ? 'ring-4 ring-[#D6C2A5]/50' : ''}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <Clock className="w-3.5 h-3.5" />
                            )}
                          </div>

                          <div>
                            <p
                              className={`text-xs uppercase tracking-wider ${
                                isCurrent
                                  ? 'font-semibold text-[#2C2520]'
                                  : isCompleted
                                  ? 'font-medium text-[#2C2520]'
                                  : 'text-[#A99B8C]'
                              }`}
                            >
                              {stepItem.label}
                            </p>
                            <p className="text-[10px] text-[#A99B8C] hidden sm:block mt-0.5">
                              {stepItem.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Consignment Items Breakdown */}
          <div className="bg-[#F8F5EF] border border-[#E8DED0] p-6 sm:p-8 rounded-xs space-y-6">
            <h3 className="font-serif text-xl text-[#2C2520]">Acquired Pieces</h3>

            <div className="space-y-4 divide-y divide-[#E8DED0]">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 pt-4 first:pt-0 items-center">
                  <div className="w-16 h-20 bg-[#E8DED0] overflow-hidden shrink-0 border border-[#E8DED0]">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <h4 className="font-serif text-sm font-medium text-[#2C2520]">
                      {item.name}
                    </h4>
                    <p className="text-[#A99B8C] font-mono mt-1">
                      Qty: {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="font-mono text-sm font-semibold text-[#2C2520]">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Breakdown */}
            <div className="pt-6 border-t border-[#E8DED0] grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              <div>
                <span className="uppercase tracking-wider text-[#A99B8C] font-medium block mb-2">
                  Destination Address
                </span>
                <div className="text-[#2C2520] space-y-1">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p className="text-[#A99B8C] font-mono">{order.shippingAddress.phone}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DED0]/60">
                  <span className="uppercase tracking-wider text-[#A99B8C] font-medium block mb-1">
                    Payment Method
                  </span>
                  <p className="font-medium text-[#2C2520]">
                    {order.paymentMethod} ({order.paymentStatus})
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-[#E8DED0]/20 p-4 border border-[#E8DED0]">
                <div className="flex justify-between">
                  <span className="text-[#A99B8C] uppercase tracking-wider">Subtotal</span>
                  <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A99B8C] uppercase tracking-wider">Shipping</span>
                  <span className="font-mono">
                    {order.shippingFee === 0 ? 'Complimentary' : formatCurrency(order.shippingFee)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#E8DED0] flex justify-between text-sm font-semibold">
                  <span className="uppercase tracking-wider">Total</span>
                  <span className="font-mono text-base">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#2C2520]/60 backdrop-blur-xs"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="relative bg-[#F8F5EF] border border-[#E8DED0] p-6 max-w-md w-full shadow-2xl z-10 space-y-4">
            <h3 className="font-serif text-xl text-[#2C2520]">Cancel Consignment?</h3>
            <p className="text-xs text-[#A99B8C] leading-relaxed">
              Are you certain you wish to cancel order <span className="font-mono text-[#2C2520]">{order?.orderNumber}</span>? Reserved stock will be restored immediately.
            </p>
            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-[#E8DED0] text-xs uppercase tracking-wider"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                className="px-5 py-2 bg-red-800 text-white text-xs uppercase tracking-wider font-semibold hover:bg-red-900 transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
