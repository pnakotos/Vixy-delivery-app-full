import React, { useState } from 'react';
import { 
  MapPin, 
  Flame, 
  Store, 
  Bike, 
  Compass, 
  Navigation, 
  Layers, 
  Eye, 
  EyeOff, 
  Clock, 
  TrendingUp, 
  ShoppingBag, 
  Sparkles,
  Info,
  Maximize2,
  Radio,
  Gauge
} from 'lucide-react';
import { COMERCIOS_ACTIVOS_CARACAS, ZONAS_CALOR_CARACAS } from '../../data/initialData';
import { useDelivery } from '../../context/DeliveryContext';

interface DeliveryRadarMapProps {
  onSelectComercio?: (comercioId: string) => void;
  driverLocation?: { lat: number; lng: number; nombre: string };
  compact?: boolean;
}

export const DeliveryRadarMap: React.FC<DeliveryRadarMapProps> = ({ 
  onSelectComercio, 
  driverLocation = { lat: 10.4930, lng: -66.8520, nombre: 'Chacao Centro (Av. Francisco de Miranda)' },
  compact = false 
}) => {
  const { realGpsActive, realGpsCoords, realGpsError, driver } = useDelivery();
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [selectedComercio, setSelectedComercio] = useState<typeof COMERCIOS_ACTIVOS_CARACAS[0] | null>(null);
  const [selectedZona, setSelectedZona] = useState<typeof ZONAS_CALOR_CARACAS[0] | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('todas');

  // Coordenadas efectivas: prioridad al sensor GPS del dispositivo
  const effectiveLat = realGpsCoords ? realGpsCoords.lat : (driver?.lat || driverLocation.lat);
  const effectiveLng = realGpsCoords ? realGpsCoords.lng : (driver?.lng || driverLocation.lng);

  // SVG coordinate transformation for Caracas valley
  // Bounds roughly: Lat 10.47 to 10.51, Lng -66.89 to -66.83
  const mapWidth = 800;
  const mapHeight = 500;

  const minLat = 10.475;
  const maxLat = 10.510;
  const minLng = -66.885;
  const maxLng = -66.835;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * mapWidth;
    // Invert Y because latitude goes up north, SVG goes down
    const y = ((maxLat - lat) / (maxLat - minLat)) * mapHeight;
    return { x: Math.max(40, Math.min(mapWidth - 40, x)), y: Math.max(40, Math.min(mapHeight - 40, y)) };
  };

  const driverPos = projectCoords(effectiveLat, effectiveLng);

  const filteredComercios = COMERCIOS_ACTIVOS_CARACAS.filter(c => {
    if (filterCategory === 'todas') return true;
    if (filterCategory === 'restaurantes') return c.categoria.toLowerCase().includes('hamburguesa') || c.categoria.toLowerCase().includes('pizza') || c.categoria.toLowerCase().includes('sushi');
    if (filterCategory === 'farmacia') return c.categoria.toLowerCase().includes('salud') || c.categoria.toLowerCase().includes('farmacia');
    return true;
  });

  return (
    <div className={`relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col ${compact ? 'h-[360px]' : 'h-[520px]'}`}>
      {/* Top Map Toolbar */}
      <div className="p-3 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-10 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-xs">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>Radar Caracas & Mapa de Calor</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold flex items-center gap-1 ${
                realGpsActive 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400'
              }`}>
                {realGpsActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                {realGpsActive ? 'GPS EN VIVO' : 'EN VIVO'}
              </span>
            </h4>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
              <span>{realGpsActive ? `GPS Satelital: ${effectiveLat.toFixed(4)}°, ${effectiveLng.toFixed(4)}°` : 'Valle de Caracas • Chacao • Baruta • Sucre'}</span>
              {realGpsCoords && (
                <span className="text-emerald-400 font-bold">
                  • ±{realGpsCoords.accuracy}m • {realGpsCoords.speed} km/h
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Heatmap Toggle & Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
              showHeatmap
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Activar o desactivar mapa de calor de compras"
          >
            <Flame className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mapa de Calor</span>
            <span className="text-[10px] uppercase font-mono font-black">
              {showHeatmap ? 'ON' : 'OFF'}
            </span>
          </button>

          {!compact && (
            <div className="hidden md:flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-[10px]">
              <button
                onClick={() => setFilterCategory('todas')}
                className={`px-2 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                  filterCategory === 'todas' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({COMERCIOS_ACTIVOS_CARACAS.length})
              </button>
              <button
                onClick={() => setFilterCategory('restaurantes')}
                className={`px-2 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                  filterCategory === 'restaurantes' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Comida
              </button>
              <button
                onClick={() => setFilterCategory('farmacia')}
                className={`px-2 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                  filterCategory === 'farmacia' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Farmacias
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SVG Canvas Map Stage */}
      <div className="relative flex-1 bg-[#0b1120] overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Heatmap Radial Gradients */}
            <radialGradient id="heat-ultra" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#eab308" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heat-high" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.65" />
              <stop offset="45%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="75%" stopColor="#22c55e" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heat-medium" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eab308" stopOpacity="0.50" />
              <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.20" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>

            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.6" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

          {/* El Ávila Mountain Backdrop (North) */}
          <path
            d="M 0,0 L 800,0 L 800,90 Q 650,55 520,75 Q 380,45 220,80 Q 100,60 0,95 Z"
            fill="#0f172a"
            opacity="0.9"
          />
          <text x="400" y="35" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="800" letterSpacing="6">
            PARQUE NACIONAL WARAIRAREPANO (EL ÁVILA)
          </text>

          {/* Caracas Main Thoroughfares / Highways */}
          {/* Autopista Gran Cacique Guaicaipuro (Francisco Fajardo) */}
          <path
            d="M 10,340 Q 220,310 420,300 T 790,290"
            fill="none"
            stroke="#1e3a8a"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.4"
          />
          <text x="750" y="280" fill="#475569" fontSize="9" fontWeight="bold" textAnchor="end" letterSpacing="1">
            AUTOPISTA FRANCISCO FAJARDO
          </text>

          {/* Av. Francisco de Miranda */}
          <path
            d="M 20,220 Q 250,210 460,200 T 780,185"
            fill="none"
            stroke="#334155"
            strokeWidth="3.5"
            strokeDasharray="6,4"
            opacity="0.7"
          />
          <text x="35" y="210" fill="#64748b" fontSize="8" fontWeight="bold">
            AV. FRANCISCO DE MIRANDA
          </text>

          {/* Av. Río de Janeiro (Las Mercedes) */}
          <path
            d="M 50,380 Q 250,365 520,355 T 780,340"
            fill="none"
            stroke="#1e293b"
            strokeWidth="2.5"
            opacity="0.6"
          />
          <text x="120" y="395" fill="#475569" fontSize="8" fontWeight="bold">
            AV. RÍO DE JANEIRO (LAS MERCEDES)
          </text>

          {/* HEATMAP LAYER: Zones with highest purchase activity */}
          {showHeatmap && (
            <g className="transition-opacity duration-500">
              {ZONAS_CALOR_CARACAS.map(zona => {
                const pos = projectCoords(zona.lat, zona.lng);
                const radius = zona.nivelDemanda === 'muy_alta' ? 95 : zona.nivelDemanda === 'alta' ? 80 : 65;
                const gradId = zona.nivelDemanda === 'muy_alta' ? 'heat-ultra' : zona.nivelDemanda === 'alta' ? 'heat-high' : 'heat-medium';

                return (
                  <g 
                    key={zona.id} 
                    className="cursor-pointer group"
                    onClick={() => {
                      setSelectedZona(zona);
                      setSelectedComercio(null);
                    }}
                  >
                    {/* Animated Pulsing Halo */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={`url(#${gradId})`}
                      className="animate-pulse"
                      style={{ animationDuration: zona.nivelDemanda === 'muy_alta' ? '2s' : '3.5s' }}
                    />

                    {/* Outer border ring */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius * 0.7}
                      fill="none"
                      stroke={zona.nivelDemanda === 'muy_alta' ? '#ef4444' : '#f59e0b'}
                      strokeWidth="1"
                      strokeDasharray="4,4"
                      opacity="0.4"
                    />

                    {/* Heat Zone Center Label */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="4"
                      fill={zona.nivelDemanda === 'muy_alta' ? '#ef4444' : '#f59e0b'}
                    />

                    <text
                      x={pos.x}
                      y={pos.y - 12}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      className="drop-shadow-md"
                    >
                      🔥 {zona.pedidosPorHora} ped/h
                    </text>

                    <text
                      x={pos.x}
                      y={pos.y + 18}
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="8"
                      fontWeight="600"
                      className="drop-shadow-md"
                    >
                      {zona.nombreZona.split('&')[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ACTIVE MERCHANTS LAYER (Pins) */}
          <g>
            {filteredComercios.map(com => {
              const pos = projectCoords(com.lat, com.lng);
              const isSelected = selectedComercio?.id === com.id;

              return (
                <g
                  key={com.id}
                  className="cursor-pointer transition transform hover:scale-110"
                  onClick={() => {
                    setSelectedComercio(com);
                    setSelectedZona(null);
                    if (onSelectComercio) onSelectComercio(com.id);
                  }}
                >
                  {/* Pin Drop Shadow */}
                  <ellipse cx={pos.x} cy={pos.y + 10} rx="7" ry="3" fill="#000000" opacity="0.5" />

                  {/* Marker Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "14" : "11"}
                    fill={com.abierto ? "#f97316" : "#475569"}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    className="drop-shadow-lg"
                  />

                  {/* Inner Store Icon representation */}
                  <text
                    x={pos.x}
                    y={pos.y + 3.5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    🏪
                  </text>

                  {/* Store Name Badge */}
                  <rect
                    x={pos.x - (com.nombre.length * 2.6)}
                    y={pos.y - 20}
                    width={com.nombre.length * 5.2}
                    height="12"
                    rx="3"
                    fill="#0f172a"
                    stroke={isSelected ? "#f97316" : "#334155"}
                    strokeWidth="0.8"
                    opacity="0.92"
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 11}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="7.5"
                    fontWeight="700"
                  >
                    {com.nombre}
                  </text>

                  {/* Orders in queue pill */}
                  {com.pedidosEnCola > 0 && (
                    <circle
                      cx={pos.x + 9}
                      cy={pos.y - 9}
                      r="5.5"
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                  )}
                  {com.pedidosEnCola > 0 && (
                    <text
                      x={pos.x + 9}
                      y={pos.y - 6.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="6.5"
                      fontWeight="bold"
                    >
                      {com.pedidosEnCola}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* DRIVER LIVE POSITION (Motorized Courier) */}
          <g>
            {/* Pulsing Radar Ring */}
            <circle
              cx={driverPos.x}
              cy={driverPos.y}
              r="22"
              fill="#10b981"
              fillOpacity="0.25"
              className="animate-ping"
              style={{ animationDuration: '2.5s' }}
            />
            <circle
              cx={driverPos.x}
              cy={driverPos.y}
              r="13"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
              className="drop-shadow-lg"
            />
            <text
              x={driverPos.x}
              y={driverPos.y + 3.5}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="8"
              fontWeight="bold"
            >
              🏍️
            </text>

            <rect
              x={driverPos.x - 48}
              y={driverPos.y + 16}
              width="96"
              height="15"
              rx="4"
              fill="#064e3b"
              stroke="#10b981"
              strokeWidth="1"
            />
            <text
              x={driverPos.x}
              y={driverPos.y + 27}
              textAnchor="middle"
              fill="#a7f3d0"
              fontSize="7.5"
              fontWeight="bold"
            >
              {realGpsActive ? `GPS REAL (${realGpsCoords?.speed || 0} km/h)` : 'Tu Ubicación'}
            </text>
          </g>
        </svg>

        {/* Floating Legend / Quick Stats Pill */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800 text-[10px] text-slate-300 space-y-1 z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Comercio Activo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Motorizado
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Zona Caliente
            </span>
          </div>
        </div>

        {/* Selected Merchant Details Flyout */}
        {selectedComercio && (
          <div className="absolute top-3 right-3 max-w-xs w-64 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-orange-500/50 shadow-2xl z-20 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <span className="text-[9px] uppercase font-bold text-orange-400 block">Comercio Activo</span>
                <h5 className="font-bold text-white text-xs truncate">{selectedComercio.nombre}</h5>
              </div>
              <button
                onClick={() => setSelectedComercio(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ×
              </button>
            </div>

            <p className="text-[11px] text-slate-300">{selectedComercio.direccion}</p>

            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
              <div className="p-2 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block font-medium">Despacho Promedio</span>
                <span className="font-mono font-bold text-emerald-400">⏱️ {selectedComercio.tiempoPromedioDespachoMin} min</span>
              </div>
              <div className="p-2 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 block font-medium">Pedidos en Cola</span>
                <span className="font-mono font-bold text-amber-400">📦 {selectedComercio.pedidosEnCola} órdenes</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Zona: <strong>{selectedComercio.zona}</strong></span>
              <span className="text-emerald-400 font-bold">● Local Abierto</span>
            </div>
          </div>
        )}

        {/* Selected Heat Zone Details Flyout */}
        {selectedZona && (
          <div className="absolute top-3 right-3 max-w-xs w-64 bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl border border-red-500/50 shadow-2xl z-20 text-xs space-y-2 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-red-500 animate-bounce" />
                <div>
                  <span className="text-[9px] uppercase font-bold text-red-400 block">Zona de Alta Demanda</span>
                  <h5 className="font-bold text-white text-xs">{selectedZona.nombreZona}</h5>
                </div>
              </div>
              <button
                onClick={() => setSelectedZona(null)}
                className="text-slate-400 hover:text-white font-bold text-sm"
              >
                ×
              </button>
            </div>

            <div className="p-2 bg-red-950/40 border border-red-900/50 rounded-xl space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300">Actividad de Compras:</span>
                <span className="font-mono font-black text-red-400">{selectedZona.pedidosPorHora} pedidos / hora</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Ticket Promedio:</span>
                <span className="font-mono font-bold text-emerald-400">${selectedZona.ticketPromedioUsd.toFixed(2)} USD</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Concentra <strong>{selectedZona.comerciosActivos} comercios activos</strong> de alta demanda. Los repartidores en este perímetro tienen 3x mayor probabilidad de recibir viajes inmediatos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
