import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CheckCircle, FileText, Info, MapPin, Truck, Package, UtensilsCrossed, X, ShoppingBag, Trash2, ChevronRight, MessageSquare, Sparkles, LayoutGrid } from 'lucide-react';
import { getInvoice } from '../../../shared/api/orders';
import { Input } from '../../../shared/components/ui/Input';

const ORDER_TYPE_OPTIONS = [
  { id: 'dine_in', label: 'Salón', icon: UtensilsCrossed },
  { id: 'takeout', label: 'Llevar', icon: Package },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

export const CartDrawer = ({ isOpen, onClose, restaurantId, tableNumber }) => {
  const { cart, removeFromCart, getCartTotal, clearCart, createOrder, loading } = useOrderStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState(tableNumber ? 'dine_in' : 'takeout');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const DELIVERY_FEE = 15.00;

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) return;

    try {
      const orderData = {
        restaurant_id: restaurantId,
        user_id: user.id,
        customer_name: user.name || user.username,
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? deliveryAddress : '',
        delivery_fee: orderType === 'delivery' ? DELIVERY_FEE : 0,
        notes: notes || (tableNumber ? `Mesa: ${tableNumber}` : ''),
        items: cart.map(item => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || ''
        }))
      };

      const result = await createOrder(orderData);
      setOrderSuccess(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadTicket = async (orderId) => {
    try {
      const response = await getInvoice(orderId);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      console.error('Error downloading ticket:', error);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Elegante */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2f2317]/60 backdrop-blur-sm z-[70]"
          />

          {/* Drawer Principal: Tema Neobrutalista */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#fffaf3] z-[70] flex flex-col font-outfit border-l-4 border-[#1c1712] shadow-[-10px_0_0px_rgba(28,23,18,0.05)]"
          >
            {/* Header Neobrutalista */}
            <div className="p-8 border-b-4 border-[#1c1712] flex justify-between items-center bg-white relative z-20 shadow-[0_4px_0px_#1c1712]">
              <div>
                <h2 className="text-3xl font-black text-[#1c1712] tracking-tighter uppercase leading-none">
                  {orderSuccess ? '¡Buen' : 'Tu'} <span className="text-[#b98c52]">{orderSuccess ? 'Provecho!' : 'Canasta'}</span>
                </h2>
                {tableNumber && !orderSuccess && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-[#fffaf3] border-2 border-[#1c1712] rounded shadow-[2px_2px_0px_#1c1712]">
                    <LayoutGrid className="w-3 h-3 text-[#1c1712]" />
                    <p className="text-[10px] font-black text-[#1c1712] uppercase tracking-widest">Mesa #{tableNumber}</p>
                  </div>
                )}
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  onClose();
                  setOrderSuccess(null);
                }} 
                className="w-12 h-12 bg-[#fffaf3] rounded border-2 border-[#1c1712] flex items-center justify-center text-[#1c1712] hover:bg-[#b98c52] shadow-[3px_3px_0px_#1c1712] transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-[#dcc7a5] scrollbar-track-transparent">
              {orderSuccess ? (
                // --- PANTALLA DE ÉXITO CREMA/ORO ---
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                    className="relative w-28 h-28 flex items-center justify-center"
                  >
                    <div className="absolute inset-0 rounded-full bg-[#fcf8f2] border-2 border-[#b98c52]/30 shadow-[0_0_40px_rgba(185,140,82,0.2)]" />
                    <CheckCircle className="w-12 h-12 text-[#b98c52]" />
                  </motion.div>

                  <div>
                    <h3 className="text-xl font-black text-[#1c1712] uppercase tracking-tight mb-1">Orden Confirmada</h3>
                    <p className="text-xs text-[#8b6435] font-medium tracking-wide">Tu pedido ya está en camino a la cocina.</p>
                  </div>
                  
                  <div className="w-full bg-white border-2 border-[#1c1712] p-8 shadow-[8px_8px_0px_#1c1712] space-y-4">
                    <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.2em] mb-4">Resumen de Orden</p>
                    
                    <div className="flex justify-between items-center pb-3 border-b-2 border-[#1c1712]/5">
                      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">No. Factura</span>
                      <span className="text-xs font-black text-[#1c1712]">#{orderSuccess.order_number?.split('-').pop()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Total Pagado</span>
                      <span className="text-2xl font-black text-[#b98c52]">Q{orderSuccess.total?.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="w-full space-y-4 pt-4">
                    <button 
                      onClick={() => handleDownloadTicket(orderSuccess.id)}
                      className="w-full py-5 bg-[#fffaf3] border-2 border-[#1c1712] text-[#1c1712] rounded font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_#1c1712] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1c1712]"
                    >
                      <FileText className="w-5 h-5" /> Descargar Ticket
                    </button>
                    
                    <button 
                      onClick={() => { onClose(); setOrderSuccess(null); }}
                      className="w-full py-5 bg-[#1c1712] text-[#fffaf3] border-2 border-[#1c1712] rounded font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_#b98c52] hover:-translate-y-1 hover:shadow-[6px_6px_0px_#b98c52] transition-all"
                    >
                      Seguir Explorando
                    </button>
                  </div>
                </div>
              ) : cart.length === 0 ? (
                // --- CANASTA VACÍA ---
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 border border-[#dcc7a5] shadow-sm"
                  >
                     <ShoppingBag className="w-8 h-8 text-[#b98c52]" />
                  </motion.div>
                  <p className="font-black text-[#1c1712] uppercase tracking-widest text-sm mb-1">Canasta Vacía</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Agrega deliciosos platillos.</p>
                </div>
              ) : (
                // --- ITEMS DEL CARRITO ---
                 cart.map((item, i) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={item.menuItemId} 
                    className="flex gap-5 p-5 bg-white border-2 border-[#1c1712] rounded-xl relative group transition-all shadow-[4px_4px_0px_#1c1712] hover:shadow-[6px_6px_0px_#b98c52]"
                  >
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="absolute -top-3 -right-3 w-8 h-8 bg-white text-[#1c1712] border-2 border-[#1c1712] rounded flex items-center justify-center opacity-100 shadow-[2px_2px_0px_#1c1712] hover:bg-red-500 hover:text-white transition-all z-10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-black text-[#1c1712] uppercase tracking-tight text-sm">{item.name}</h4>
                        <p className="font-black text-[#1c1712] text-sm bg-[#fffaf3] border-2 border-[#1c1712] px-3 py-1 shadow-[2px_2px_0px_#b98c52]">
                          Q{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <span className="px-3 py-1 bg-[#1c1712] text-[#fffaf3] text-[9px] font-black border-2 border-[#1c1712] uppercase tracking-widest shadow-[2px_2px_0px_#b98c52]">
                            CANT: {item.quantity}
                         </span>
                         <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Q{item.price} x ud</span>
                      </div>
                      
                      {item.notes && (
                         <div className="mt-4 flex items-start gap-2 bg-[#fffaf3] p-3 border-2 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]">
                            <Info className="w-3 h-3 text-[#b98c52] shrink-0 mt-0.5" />
                            <p className="text-[10px] text-[#1c1712] font-bold italic leading-relaxed">{item.notes}</p>
                         </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* --- ÁREA DE CHECKOUT --- */}
            {cart.length > 0 && !orderSuccess && (
              <div className="p-6 bg-white border-t border-[#dcc7a5]/30 shadow-[0_-10px_20px_rgba(185,140,82,0.05)] space-y-5">
                
                <div>
                  <label className="block text-[10px] font-black text-[#1c1712] uppercase tracking-[0.25em] mb-3">Modalidad de Orden</label>
                  <div className="grid grid-cols-3 gap-3">
                    {ORDER_TYPE_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setOrderType(opt.id)}
                        className={`py-4 px-1 rounded border-2 border-[#1c1712] text-[10px] font-black transition-all flex flex-col items-center gap-2 uppercase tracking-widest transform active:translate-y-1 ${
                          orderType === opt.id
                            ? 'bg-[#1c1712] text-[#fffaf3] shadow-[4px_4px_0px_#b98c52]'
                            : 'bg-white text-[#1c1712] hover:bg-[#fffaf3] hover:shadow-[3px_3px_0px_#1c1712] active:shadow-none'
                        }`}
                      >
                        <opt.icon className="w-5 h-5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {orderType === 'delivery' && (
                  <div className="mb-2">
                    <Input 
                      icon={MapPin}
                      placeholder="Dirección completa de destino..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Input 
                    icon={MessageSquare}
                    placeholder="Instrucciones para cocina (opcional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                
                <div className="space-y-3 pt-6 border-t-4 border-[#1c1712]">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Subtotal</span>
                    <span className="text-sm font-black text-[#1c1712]">Q{subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Costo de Envío</span>
                      <span className="text-sm font-black text-[#b98c52]">+ Q{DELIVERY_FEE.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t-2 border-[#1c1712]/5">
                    <span className="text-[12px] font-black text-[#1c1712] uppercase tracking-widest">Total a Pagar</span>
                    <span className="text-3xl font-black text-[#b98c52] tracking-tighter">Q{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearCart}
                    className="w-1/3 py-3.5 bg-[#fcf8f2] text-zinc-500 border border-[#dcc7a5] rounded-2xl font-black text-[9px] uppercase tracking-widest hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                  >
                    Vaciar
                  </motion.button>

                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: "#1c1712" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    disabled={loading || (orderType === 'delivery' && !deliveryAddress.trim())}
                    className="flex-1 py-3.5 bg-[#2b2015] text-white rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black shadow-lg shadow-[#2b2015]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {loading ? 'Procesando...' : 'Confirmar Orden'} <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
