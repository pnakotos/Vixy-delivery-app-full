import React from 'react';
import { 
  ShoppingBag, 
  Bike, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  DollarSign, 
  Compass, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Store,
  Terminal,
  FileCode,
  Image as ImageIcon
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

interface AdminDashboardProps {
  onNavigateTab: (tabId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { orders, driver, store, client, incidents, tasaBcv } = useDelivery();

  const totalPedidos = orders.length;
  const pedidosActivos = orders.filter(o => o.estado !== 'entregado' && o.estado !== 'cancelado').length;
  const pedidosEntregados = orders.filter(o => o.estado === 'entregado').length;
  const totalFacturadoUsd = orders.reduce((sum, o) => sum + o.montoTotalUsd, 0);
  const totalFacturadoBs = totalFacturadoUsd * tasaBcv;

  const activeOrder = orders.find(o => o.estado === 'en_camino_al_cliente') || orders[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-auto">
      {/* 1. OPERATIONAL OVERVIEW BENTO TILE (Span 3) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between shadow-xs gap-4">
        <div>
          <h2 className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
            Operational Overview
          </h2>
          <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            {totalPedidos}{' '}
            <span className="text-lg font-medium text-slate-400 tracking-normal">
              Total Orders Today
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Volumen: ${totalFacturadoUsd.toFixed(2)} USD • Bs. {totalFacturadoBs.toFixed(2)} (BCV: {tasaBcv.toFixed(2)})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 sm:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-800">
          <div className="text-left md:text-center">
            <p className="text-xs font-bold text-green-600 uppercase mb-1 tracking-wider">
              API Status
            </p>
            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
              200 OK
            </p>
          </div>
          <div className="text-left md:text-center">
            <p className="text-xs font-bold text-blue-600 uppercase mb-1 tracking-wider">
              MySQL Latency
            </p>
            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
              12ms
            </p>
          </div>
          <div className="text-left md:text-center">
            <p className="text-xs font-bold text-orange-600 uppercase mb-1 tracking-wider">
              Active Deliveries
            </p>
            <p className="text-lg font-mono font-bold text-slate-800 dark:text-white">
              {pedidosActivos > 0 ? pedidosActivos : 1}
            </p>
          </div>
        </div>
      </div>

      {/* 2. VERIFICATION VAULT BENTO TILE (Span 1, Row-span 2, Electric Orange) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-2 bg-orange-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
        {/* Soft decorative visual circle */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full pointer-events-none" />

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-90">
              Verification Vault
            </h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">
              Photos
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-white/20 rounded-xl flex items-center justify-between border border-white/20 backdrop-blur-xs">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium truncate">Delivery_ID_882.jpg</span>
              </div>
              <span className="text-[10px] bg-green-400 text-black px-2 py-0.5 rounded uppercase font-bold">
                Saved
              </span>
            </div>

            <div className="p-3 bg-white/20 rounded-xl flex items-center justify-between border border-white/20 backdrop-blur-xs">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium truncate">Store_Pickup_21.jpg</span>
              </div>
              <span className="text-[10px] bg-green-400 text-black px-2 py-0.5 rounded uppercase font-bold">
                Saved
              </span>
            </div>

            <div className="p-3 bg-white/20 rounded-xl flex items-center justify-between border border-white/20 backdrop-blur-xs">
              <div className="flex items-center gap-2 truncate">
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-xs font-medium truncate">Receipt_IMG_04.jpg</span>
              </div>
              <span className="text-[10px] bg-green-400 text-black px-2 py-0.5 rounded uppercase font-bold">
                Saved
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/20 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider opacity-80 font-mono">
            /uploads/verificaciones/
          </span>
          <button
            onClick={() => onNavigateTab('verificaciones')}
            className="text-[11px] font-bold underline hover:text-orange-100 cursor-pointer flex items-center gap-1"
          >
            Ver Galería
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 3. REAL-TIME ORDER FLOW & RADAR BENTO TILE (Span 3, Dark Slate) */}
      <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-[#0F172A] rounded-2xl p-0 overflow-hidden relative border border-slate-800 shadow-md">
        {/* Dotted Radial Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} 
        />

        <div className="relative p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              Real-Time Order Flow & Radar Satelital
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-slate-400 border border-slate-700 px-2.5 py-1 rounded font-mono">
                CARACAS - DTTO CAPITAL (VE)
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded font-mono font-bold">
                GPS LIVE
              </span>
            </div>
          </div>

          {/* Cards & Radar Preview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Order Card 1 (Active Delivery) */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 font-mono">
                  Order #{activeOrder?.codigoSeguimiento || 'VXY-901'}
                </p>
                <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-bold uppercase">
                  {activeOrder?.estado === 'en_camino_al_cliente' ? 'EN RUTA' : 'ACTIVO'}
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <img
                  src={driver.fotoUrl}
                  alt={driver.nombre}
                  className="w-10 h-10 rounded-full border-2 border-orange-500 object-cover"
                />
                <div>
                  <p className="text-xs text-white font-bold italic">
                    {driver.nombre} {driver.apellido}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {driver.moto.marca} {driver.moto.modelo} - [{driver.moto.placa}]
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Destino: {activeOrder?.direccionEntrega?.sector || 'Chacao'}</span>
                  <span className="text-orange-400 font-bold">Est. Delivery: 4m 12s</span>
                </div>
              </div>
            </div>

            {/* Live Order Card 2 (Completed or Kitchen) */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 font-mono">
                  Order #VXY-899
                </p>
                <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded font-bold uppercase">
                  COMPLETADO
                </span>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-700 rounded-full border-2 border-slate-600 flex items-center justify-center font-bold text-xs text-slate-300">
                  MG
                </div>
                <div>
                  <p className="text-xs text-white font-bold italic">
                    María G. López
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Empire Keeway Horse - [AH-1122]
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full w-full rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Entregado: Los Palos Grandes</span>
                  <span className="text-green-400 font-bold">Time: 22m 10s (Total)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Coordinates Bar */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Comercio: {store.nombre} (10.4910° N, 66.8520° W)
              </span>
              <span className="hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Motorizado: {driver.nombre} en tránsito
              </span>
            </div>

            <button
              onClick={() => onNavigateTab('pedidos')}
              className="text-orange-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Ver Todos los Pedidos
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. LIVE SUPPORT CHAT BENTO TILE (Span 1) */}
      <div className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-xs">
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
          Live Support Chat
        </h3>

        <div className="flex-1 space-y-3 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-orange-600 dark:text-orange-400">
              [Store] {store.nombre}
            </p>
            El pedido #{activeOrder?.codigoSeguimiento || 'VXY-901'} fue empacado y sellado.
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-blue-600 dark:text-blue-400">
              [Driver] {driver.nombre} Ramírez
            </p>
            Llegando al punto de entrega, cliente notificado por push.
          </div>

          {incidents.length > 0 && (
            <div className="bg-amber-500/10 p-2.5 rounded-lg text-[11px] text-amber-700 dark:text-amber-300 border border-amber-500/20">
              <p className="font-bold text-amber-600">
                [Alerta Ruta] {incidents[0].tipo}
              </p>
              {incidents[0].descripcion}
            </div>
          )}
        </div>

        <button
          onClick={() => onNavigateTab('soporte')}
          className="mt-4 w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-lg transition cursor-pointer"
        >
          Reply to Tickets ({incidents.filter(i => i.estado !== 'resuelta').length} Activos)
        </button>
      </div>

      {/* 5. TOP STORE BENTO TILE (Span 1) */}
      <div className="col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
            Top Store
          </h3>

          <div className="flex items-center space-x-3 mb-3">
            <img
              src={store.logoUrl}
              alt={store.nombre}
              className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 object-cover"
            />
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {store.nombre}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                4.9 Rating • RIF: {store.rif}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">
            Revenue Today
          </p>
          <p className="text-xl font-black text-slate-800 dark:text-white font-mono">
            ${(totalFacturadoUsd * 0.85).toFixed(2)}{' '}
            <span className="text-xs font-normal text-slate-400">USD</span>
          </p>
          <button
            onClick={() => onNavigateTab('comercios')}
            className="mt-2 text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Gestionar Menú & Comercios
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 6. REGISTERED VIXY DRIVERS (FLEET MANAGEMENT) BENTO TILE (Span 2) */}
      <div className="col-span-1 md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Registered Vixy Drivers (Fleet Management)
          </h3>
          <button
            onClick={() => onNavigateTab('conductores')}
            className="text-[10px] font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
          >
            Ver Todos →
          </button>
        </div>

        <table className="w-full text-left">
          <thead className="border-b border-slate-100 dark:border-slate-800">
            <tr className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              <th className="pb-2 font-bold">Name</th>
              <th className="pb-2 font-bold">Model & Placa</th>
              <th className="pb-2 text-right font-bold">Verified Docs (VE)</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            <tr className="border-b border-slate-50 dark:border-slate-800/60">
              <td className="py-2.5 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {driver.nombre} {driver.apellido}
              </td>
              <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono">
                {driver.moto.marca} ({driver.moto.anio}) • [{driver.moto.placa}]
              </td>
              <td className="py-2.5 text-right text-green-600 dark:text-green-400 font-bold font-mono text-[11px]">
                CERT-MED ✓
              </td>
            </tr>

            <tr className="border-b border-slate-50 dark:border-slate-800/60">
              <td className="py-2.5 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Luis García
              </td>
              <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono">
                Yamaha DT (2021) • [AG-5511]
              </td>
              <td className="py-2.5 text-right text-green-600 dark:text-green-400 font-bold font-mono text-[11px]">
                CERT-MED ✓
              </td>
            </tr>

            <tr className="border-b border-slate-50 dark:border-slate-800/60">
              <td className="py-2.5 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Pedro Ruiz
              </td>
              <td className="py-2.5 text-slate-600 dark:text-slate-400 font-mono">
                Haojin Águila (2023) • [AJ-9920]
              </td>
              <td className="py-2.5 text-right text-orange-600 dark:text-orange-400 font-bold font-mono text-[11px]">
                EXPIRING ⚠️
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 7. API CONFIG BENTO TILE (Span 1, Deep Slate-800) */}
      <div className="col-span-1 bg-[#1E293B] rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">
            API & Hosting Config
          </h3>
          <p className="text-sm font-mono text-orange-400 font-bold">
            AUTH_JWT_SECRET_V1
          </p>
        </div>

        <div className="mt-4 space-y-2 font-mono">
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">Docker Image</span>
            <span>vixy-gateway:latest</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">Subdomains</span>
            <span>pedidos.vixy.com</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">PHP Version</span>
            <span>8.2.1 FPM</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="opacity-50">MySQL DB</span>
            <span>cPanel Port 3306</span>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('backend')}
          className="mt-4 border border-white/20 text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg hover:bg-white/5 transition cursor-pointer"
        >
          Manage Containers & Code
        </button>
      </div>
    </div>
  );
};
