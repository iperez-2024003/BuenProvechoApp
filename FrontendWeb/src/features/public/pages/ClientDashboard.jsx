import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BadgeDollarSign,
  ChefHat,
  MapPin,
  PartyPopper,
  Sparkles,
  Star,
  Trophy,
  Utensils,
  LayoutGrid,
} from 'lucide-react';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import LogoLoop from '../../../shared/components/ui/LogoLoop';
import ScrollStack, { ScrollStackItem } from '../../../shared/components/ui/ScrollStack';
import LogoBuenProvecho from '../../../assets/img/LogoBuenProvecho.png';

const navItems = [
  { label: 'Explora', link: '#featured', ariaLabel: 'Ir a sedes destacadas' },
  { label: 'Promos', link: '#promotions', ariaLabel: 'Ir a promociones activas' },
  { label: 'Cuenta', link: '#vip', ariaLabel: 'Ir a puntos VIP' },
  { label: 'Historial', link: '/dashboard/history', ariaLabel: 'Abrir historial' },
];

const fadeUpSection = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};

const staggerList = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { restaurants, getRestaurants, loading } = useRestaurantStore();
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('Todos');

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  useEffect(() => {
    const uniqueCats = [...new Set(restaurants.map((restaurant) => restaurant.category))].filter(Boolean);
    setCategories(uniqueCats);
  }, [restaurants]);

  const filteredRestaurants = activeTab === 'Todos'
    ? restaurants
    : restaurants.filter((restaurant) => restaurant.category === activeTab);

  const featuredRestaurants = restaurants.slice(0, 8);
  const firstFeaturedMenuPath = featuredRestaurants[0]?.id ? `/menu/${featuredRestaurants[0].id}` : '/dashboard';
  const featuredRestaurant = filteredRestaurants[0] || restaurants[0];

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0f?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1466978913421-bac2e5e75149?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502301103665-0b95cc738daf?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80'
];

  const loopItems = featuredRestaurants.length > 0
    ? featuredRestaurants.map((restaurant, index) => ({
        id: restaurant.id,
        name: restaurant.name,
        category: restaurant.category || 'Experiencia Gourmet',
        image: restaurant.cover_image_url || restaurant.logo_url || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
      }))
    : [
        { id: 'demo-1', name: 'BuenProvecho Club', category: 'Experiencias', image: FALLBACK_IMAGES[0] },
        { id: 'demo-2', name: 'Promos VIP', category: 'Ofertas', image: FALLBACK_IMAGES[1] },
        { id: 'demo-3', name: 'Mesa Premium', category: 'Reservas', image: FALLBACK_IMAGES[2] },
      ];

  const quickActions = [
    { eyebrow: 'Explora', action: 'Ver menú', icon: Utensils, onClick: () => navigate(firstFeaturedMenuPath) },
    { eyebrow: 'Eventos', action: 'Ver ofertas', icon: PartyPopper, onClick: () => navigate('/dashboard/events?type=promotion') },
    { eyebrow: 'Beneficios', action: 'Mi historial', icon: BadgeDollarSign, onClick: () => navigate('/dashboard/history') },
  ];

  return (
    <div className="relative min-h-screen bg-[#fffaf3] text-[#1c1712] font-outfit">
      {/* ── BACKGROUND ACCENTS ── */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(185,140,82,0.1),transparent_50%)]" />
      <div className="absolute inset-x-0 top-0 h-[420px] border-b-2 border-[#1c1712] opacity-5 pointer-events-none" />


      <div className="relative z-10 pt-16 md:pt-24 lg:pt-32 pb-16 md:pb-20 px-4 md:px-6 lg:px-0">
        <main className="flex min-w-0 flex-col gap-6 md:gap-10 max-w-7xl mx-auto">
        <motion.section
          variants={fadeUpSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-[1.4fr_0.9fr]"
        >
          <div className="relative overflow-hidden rounded-xl border-2 border-[#1c1712] bg-white p-6 md:p-8 lg:p-12 shadow-[8px_8px_0px_#1c1712]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#b98c52]/10 rounded-bl-full -z-0" />
            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="max-w-3xl">
                <div className="mb-6 inline-flex items-center rounded border-2 border-[#1c1712] bg-[#fffaf3] px-4 py-3 shadow-[4px_4px_0px_#1c1712]">
                  <img
                    src={LogoBuenProvecho}
                    alt="Buen Provecho"
                    className="block h-16 md:h-24 lg:h-28 w-auto object-contain"
                    draggable={false}
                  />
                </div>
                <p className="mb-3 text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-[#b98c52]">Dashboard Premium</p>
                <h1 className="mb-5 text-4xl md:text-5xl lg:text-7xl font-black leading-[0.9] tracking-tighter text-[#1c1712] uppercase" style={{ textShadow: '3px 3px 0px rgba(185,140,82,0.2)' }}>
                  Tu pase <span className="text-[#b98c52]">VIP</span> al sabor
                </h1>
                <p className="max-w-2xl text-[10px] md:text-[12px] font-bold uppercase leading-relaxed tracking-wider text-zinc-600">
                  Gestiona tus puntos, explora las mejores sedes y reserva con un solo toque. Diseño neobrutalista para experiencias de alto nivel.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(firstFeaturedMenuPath)}
                    className="inline-flex items-center justify-center gap-2 rounded border-2 border-[#1c1712] bg-[#1c1712] px-6 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#fffaf3] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#b98c52] active:translate-y-1 active:shadow-none"
                  >
                    Ir al menú
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/events?type=promotion')}
                    className="inline-flex items-center justify-center gap-2 rounded border-2 border-[#1c1712] bg-[#fffaf3] px-6 py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-[#1c1712] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1c1712] active:translate-y-1 active:shadow-none"
                  >
                    Ver promos
                    <Sparkles className="h-4 w-4" />
                  </button>
                </div>
              </div>


              <div className="grid grid-cols-1 gap-6">
                <div className="group relative rounded-none border-4 border-[#1c1712] bg-[#fffaf3] p-8 text-[#1c1712] shadow-[8px_8px_0px_#b98c52] transition-all hover:-translate-y-1">
                  <div className="absolute top-4 right-4 opacity-10">
                    <Trophy className="h-16 w-16 text-[#1c1712]" />
                  </div>
                  <p className="mb-4 text-[11px] font-black uppercase tracking-[0.4em] text-[#b98c52]">Nivel Comensal</p>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[#1c1712]">
                      {user?.points > 1000 ? 'Platino' : user?.points > 500 ? 'Oro' : 'Miembro Gourmet'}
                    </h2>
                    <div className="mt-4 flex items-center gap-4">
                      <p className="text-6xl font-black leading-none text-[#1c1712]">{user?.points || 0}</p>
                      <span className="text-[10px] font-black uppercase text-[#fffaf3] tracking-widest bg-[#1c1712] px-3 py-1.5 rounded-none border-2 border-[#1c1712] shadow-[2px_2px_0px_#b98c52]">Puntos</span>
                    </div>
                  </div>
                  <div className="mt-8 h-3 w-full overflow-hidden rounded-none border-2 border-[#1c1712] bg-[#1c1712]/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((user?.points || 0) / 15, 100)}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-[#b98c52]" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border-2 border-[#1c1712] bg-[#fffaf3] p-5 shadow-[4px_4px_0px_#1c1712] flex flex-col justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">Sedes</p>
                    <p className="mt-2 text-4xl font-black text-[#1c1712]">{restaurants.length}</p>
                  </div>
                  <div className="rounded-lg border-2 border-[#1c1712] bg-[#fffaf3] p-5 shadow-[4px_4px_0px_#1c1712] flex flex-col justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">Tipos</p>
                    <p className="mt-2 text-4xl font-black text-[#1c1712]">{categories.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            variants={fadeUpSection}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            className="rounded-xl border-2 border-[#1c1712] bg-[#fffaf3] p-6 shadow-[6px_6px_0px_#1c1712]"
          >
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#b98c52]">Navegación Veloz</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1c1712] uppercase">Atajos Premium</h2>
            </div>

            <motion.div variants={staggerList} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="space-y-4">
              {quickActions.map((card) => {
                const Icon = card.icon;

                return (
                  <motion.button
                    key={card.action}
                    variants={staggerItem}
                    type="button"
                    onClick={card.onClick}
                    className="group w-full rounded border-2 border-[#1c1712] bg-white p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1c1712] active:translate-y-1 active:shadow-none"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">{card.eyebrow}</p>
                        <h3 className="mt-2 text-lg font-black uppercase tracking-tight text-[#1c1712]">{card.action}</h3>
                      </div>
                      <Icon className="h-5 w-5 text-[#1c1712] transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </motion.div>
        </motion.section>


        <motion.section
          id="featured"
          variants={fadeUpSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="rounded-xl border-2 border-[#1c1712] bg-[#fffaf3] overflow-hidden shadow-[8px_8px_0px_#1c1712]"
        >
          <div className="flex items-center justify-between gap-4 border-b-2 border-[#1c1712] px-6 pb-6 pt-8 md:px-10">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#b98c52]">Sedes Destacadas</p>
              <h2 className="text-3xl font-black tracking-tighter text-[#1c1712] uppercase">Selección de hoy</h2>
            </div>
            <div className="hidden items-center gap-2 rounded border-2 border-[#1c1712] bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-[#1c1712] shadow-[3px_3px_0px_#1c1712] md:flex">
              <Sparkles className="h-4 w-4 text-[#b98c52]" />
              Premium
            </div>
          </div>

          <div className="px-4 py-8 md:px-6">
            <LogoLoop
              logos={loopItems}
              speed={70}
              direction="left"
              logoHeight={100}
              gap={24}
              hoverSpeed={0}
              fadeOut
              fadeOutColor="#fffaf3"
              scaleOnHover
              ariaLabel="Restaurantes destacados"
              renderItem={(item) => (
                <button
                  type="button"
                  onClick={() => navigate(`/menu/${item.id}`)}
                  className="group flex items-center gap-4 rounded border-2 border-[#1c1712] bg-white px-6 py-4 text-left shadow-[4px_4px_0px_#1c1712] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#b98c52]"
                >
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded border-2 border-[#1c1712] object-cover" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">{item.category}</p>
                    <p className="text-sm font-black uppercase tracking-tight text-[#1c1712]">{item.name}</p>
                  </div>
                  <ArrowRight className="ml-2 h-4 w-4 text-[#1c1712] transition-transform group-hover:translate-x-1" />
                </button>
              )}
            />
          </div>
        </motion.section>

        <motion.section
          id="promotions"
          variants={fadeUpSection}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="relative overflow-hidden rounded-xl border-2 border-[#1c1712] bg-white shadow-[8px_8px_0px_#1c1712]">
            <div className="relative z-10 flex flex-col justify-between gap-8 p-8 md:p-12">
              <div>
                <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#b98c52] bg-[#fffaf3] w-fit px-3 py-1 border-2 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]">Sede Recomendada</p>
                <h3 className="text-4xl font-black uppercase leading-[1] tracking-tighter text-[#1c1712] md:text-6xl">
                  {featuredRestaurant?.name || 'Restaurante destacado'}
                </h3>
                <p className="mt-6 max-w-xl font-bold leading-relaxed text-zinc-600 uppercase text-[10px] tracking-widest">
                  {featuredRestaurant?.address || 'Ubicación premium para una experiencia culinaria inigualable.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-2 rounded border-2 border-[#1c1712] bg-[#fffaf3] px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#1c1712] shadow-[3px_3px_0px_#1c1712]">
                  <MapPin className="h-4 w-4 text-[#b98c52]" />
                  {featuredRestaurant?.category || 'Casual'}
                </span>
                <span className="inline-flex items-center gap-2 rounded border-2 border-[#1c1712] bg-white px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#1c1712] shadow-[3px_3px_0px_#1c1712]">
                  <Star className="h-4 w-4 text-[#b98c52]" />
                  {featuredRestaurant?.rating || '4.5'} Valoración
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(firstFeaturedMenuPath)}
                className="inline-flex w-fit items-center gap-3 rounded border-2 border-[#1c1712] bg-[#1c1712] px-8 py-4 text-[11px] font-black uppercase tracking-[0.2em] text-[#fffaf3] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#b98c52] active:translate-y-1 active:shadow-none"
              >
                Abrir Menú
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>


          <div id="vip" className="relative overflow-hidden rounded-xl border-2 border-[#1c1712] bg-[#fffaf3] p-6 shadow-[8px_8px_0px_#1c1712] md:p-10">
            <div className="relative z-10 flex h-full flex-col gap-8">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#b98c52]">Club VIP BuenProvecho</p>
                <h3 className="text-3xl font-black tracking-tighter text-[#1c1712] uppercase leading-none">Mi Estatus</h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-none border-4 border-[#1c1712] bg-[#fffaf3] p-6 shadow-[8px_8px_0px_#b98c52] text-[#1c1712]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#b98c52]">Beneficio VIP</p>
                      <h4 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#1c1712]">Puntos Reales</h4>
                    </div>
                    <div className="w-12 h-12 bg-[#1c1712] rounded-none border-2 border-[#1c1712] flex items-center justify-center shadow-[2px_2px_0px_#b98c52]">
                      <Trophy className="h-6 w-6 text-[#fffaf3]" />
                    </div>
                  </div>
                  <div className="mt-8 flex items-end justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <p className="text-6xl font-black leading-none tracking-tighter text-[#1c1712]">{user?.points || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b98c52]">Balance</p>
                      <p className="text-2xl font-black text-[#1c1712] leading-none mt-1">Q{(user?.points || 0) * 0.5}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/dashboard/history')}
                  className="group rounded-none border-4 border-[#1c1712] bg-white p-5 text-left transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1c1712] active:translate-y-1 active:shadow-none"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#b98c52]">Historial</p>
                      <p className="text-lg font-black tracking-tight text-[#1c1712] uppercase">Mis Compras</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[#1c1712] transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        <ScrollStack useWindowScroll={true} itemStackDistance={30} baseScale={1} rotationAmount={0} blurAmount={0} stackPosition="0">

          <ScrollStackItem itemClassName="bg-transparent shadow-none my-0 p-0 h-auto z-50">
            <motion.div
              variants={fadeUpSection}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="sticky top-0 z-50 flex items-center gap-4 overflow-x-auto px-4 py-6 scroll-mt-28 scrollbar-hide md:px-0 bg-[#fffaf3] border-b-2 border-[#1c1712] shadow-[0_8px_0px_#1c1712]"

              id="restaurants"
            >
              {['Todos', ...categories].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveTab(category)}
                className={`rounded border-2 border-[#1c1712] px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all duration-300 transform active:translate-y-1 ${
                  activeTab === category
                    ? 'bg-[#1c1712] text-[#fffaf3] shadow-[4px_4px_0px_#b98c52]'
                    : 'bg-white text-[#1c1712] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1c1712] active:shadow-none'
                }`}
              >
                {category === 'Todos' ? (
                  <span className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4" /> Todos
                  </span>
                ) : category}
              </button>
            ))}
            </motion.div>
          </ScrollStackItem>


          <div className="min-h-[300px] md:min-h-[400px]">
            {loading ? (
              <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 md:gap-10">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-64 animate-pulse rounded-[3rem] border border-[#dcc7a5] bg-white/70 md:h-96" />
                ))}
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <div className="rounded-[3rem] border border-dashed border-[#dcc7a5] bg-white/70 py-24 text-center">
                <ChefHat className="mx-auto mb-6 h-16 w-16 text-[#d7b77f]" />
                <h3 className="text-xl font-black uppercase text-zinc-900">No hay opciones en esta categoría</h3>
                <p className="mt-2 text-xs font-medium text-zinc-500">Explora otras delicias o vuelve más tarde.</p>
              </div>
            ) : (
              <motion.div variants={staggerList} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }} className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 md:gap-12">
                <AnimatePresence mode="popLayout">
                  {filteredRestaurants.map((restaurant, index) => (
                    <motion.button
                      key={restaurant.id}
                      type="button"
                      variants={staggerItem}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/menu/${restaurant.id}`)}
                      className="group relative w-full overflow-hidden rounded-xl border-2 border-[#1c1712] bg-white text-left shadow-[8px_8px_0px_#1c1712] transition-all hover:-translate-y-1 hover:shadow-[12px_12px_0px_#b98c52]"
                    >
                      <div className="relative h-56 overflow-hidden md:h-64 border-b-2 border-[#1c1712]">
                        <img
                          src={restaurant.cover_image_url || restaurant.logo_url || restaurant.logoUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]}
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
                          }}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          alt={restaurant.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1712]/40 to-transparent" />
                        <div className="absolute left-4 top-4 rounded border-2 border-[#1c1712] bg-[#fffaf3] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#1c1712] shadow-[3px_3px_0px_#1c1712]">
                          {restaurant.category || 'Casual'}
                        </div>
                      </div>

                      <div className="p-6 md:p-8">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.4em] text-[#b98c52]">Sede Premium</p>
                            <h3 className="text-2xl font-black uppercase leading-[1] tracking-tighter md:text-3xl text-[#1c1712]">{restaurant.name}</h3>
                          </div>
                        </div>
                        
                        <div className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                          <MapPin className="h-4 w-4 text-[#b98c52]" />
                          <span className="truncate">{restaurant.address || 'Ubicación Exclusiva'}</span>
                        </div>

                        <div className="flex items-center justify-between gap-4 pt-6 border-t-2 border-[#1c1712]/10">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-[#b98c52] fill-[#b98c52]" />
                            <span className="text-lg font-black text-[#1c1712]">{restaurant.rating || '4.5'}</span>
                          </div>
                          <span className="inline-flex items-center justify-center gap-2 rounded border-2 border-[#1c1712] bg-[#1c1712] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-[#fffaf3] transition-all group-hover:bg-[#b98c52] group-hover:border-[#b98c52]">
                            Ver Menú <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </ScrollStack>
      </main>

      </div>
    </div>
  );
};
