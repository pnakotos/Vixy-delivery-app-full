import React, { useState } from 'react';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  DollarSign, 
  Receipt, 
  PackageCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Edit3,
  Calendar,
  Filter,
  Search,
  Power
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Comercio, CategoriaPrincipalComercio } from '../../types/delivery';

const CATEGORIAS_FILTRO: { id: string; label: string; icon: string }[] = [
  { id: 'todos', label: 'Todos los Comercios', icon: '🏪' },
  { id: 'hogar', label: 'Hogar', icon: '🏠' },
  { id: 'ferreteria', label: 'Ferretería', icon: '🔧' },
  { id: 'restaurantes', label: 'Restaurantes', icon: '🍽️' },
  { id: 'comida_rapida', label: 'Comida Rápida', icon: '⚡' },
  { id: 'supermercados', label: 'Supermercados', icon: '🛒' }
];

export const StoresManager: React.FC = () => {
  const { stores, store, switchStore, updateStoreSchedule, toggleStoreActive, tasaBcv, orders } = useDelivery();

  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStore, setEditingStore] = useState<Comercio | null>(null);

  // Edit schedule form state
  const [editHoraApertura, setEditHoraApertura] = useState('08:00');
  const [editHoraCierre, setEditHoraCierre] = useState('22:00');
  const [editDias, setEditDias] = useState<string[]>([]);
  const [editActivo, setEditActivo] = useState(true);

  const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  const openScheduleModal = (comercio: Comercio) => {
    setEditingStore(comercio);
    setEditHoraApertura(comercio.horaApertura || '08:00');
    setEditHoraCierre(comercio.horaCierre || '22:00');
    setEditDias(comercio.diasOperacion || DIAS_SEMANA);
    setEditActivo(comercio.activo ?? true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;

    updateStoreSchedule(editingStore.id, {
      horaApertura: editHoraApertura,
      horaCierre: editHoraCierre,
      diasOperacion: editDias,
      horarios: `${editHoraApertura} - ${editHoraCierre}`,
      activo: editActivo,
      abierto: editActivo
    });

    setEditingStore(null);
  };

  const toggleDia = (dia: string) => {
    setEditDias(prev => 
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const filteredStores = stores.filter(s => {
    const matchesCat = selectedCategory === 'todos' || s.categoriaPrincipal === selectedCategory;
    const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.rif.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeStoresCount = stores.filter(s => s.activo !== false).length;
  const inactiveStoresCount = stores.filter(s => s.activo === false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Control de Disponibilidad y Horarios Vixy
            </span>
            <span className="text-xs text-neutral-400 font-mono">Tabla: comercios</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1 flex items-center gap-2">
            <Store className="w-5 h-5 text-purple-600" />
            Directorio de Comercios y Horarios de Atención
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Administración centralizada de aliados comerciales. Actualiza horarios de apertura/cierre y activa/desactiva comercios para evitar compras sin servicio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{activeStoresCount} Activos</span>
          </div>
          <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-neutral-400" />
            <span>{inactiveStoresCount} Inactivos</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {CATEGORIAS_FILTRO.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 border ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                  : 'bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, RIF o rubro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs text-neutral-900 dark:text-white outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Stores List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStores.map((item) => {
          const storeOrders = orders.filter(o => o.comercio.id === item.id);
          const totalFacturadoUsd = storeOrders.reduce((sum, o) => sum + o.montoSubtotalUsd, 0);
          const isCurrentlyActive = item.activo !== false;

          return (
            <div 
              key={item.id}
              className={`bg-white dark:bg-neutral-850 rounded-2xl border transition shadow-xs p-5 space-y-4 ${
                isCurrentlyActive 
                  ? 'border-neutral-200 dark:border-neutral-800' 
                  : 'border-neutral-300 dark:border-neutral-800/60 opacity-85 bg-neutral-50/50 dark:bg-neutral-900/50'
              }`}
            >
              {/* Header Store */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={item.logoUrl}
                    alt={item.nombre}
                    className="w-12 h-12 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                        {item.nombre}
                      </h3>
                      {isCurrentlyActive ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                          Inactivo / Cerrado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {item.categoria} • RIF: {item.rif}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        {item.calificacion}
                      </span>
                      <span>•</span>
                      <span>{item.productos.length} artículos en menú</span>
                    </div>
                  </div>
                </div>

                {/* Direct Active Toggle */}
                <button
                  type="button"
                  onClick={() => toggleStoreActive(item.id)}
                  title={isCurrentlyActive ? 'Desactivar comercio' : 'Activar comercio'}
                  className={`p-2 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-bold ${
                    isCurrentlyActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Schedule and Working Hours Box */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    Horario de Atención Oficial
                  </span>
                  <button
                    type="button"
                    onClick={() => openScheduleModal(item)}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400 flex items-center gap-1 cursor-pointer transition hover:underline"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Modificar Horario</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Apertura / Cierre:</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 font-mono">
                      {item.horaApertura || '08:00'} - {item.horaCierre || '22:00'}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Días de Servicio:</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate block">
                      {item.diasOperacion && item.diasOperacion.length === 7 
                        ? 'Todos los días' 
                        : (item.diasOperacion?.join(', ') || 'Lunes a Domingo')}
                    </span>
                  </div>
                </div>

                {/* Status Notice */}
                {!isCurrentlyActive && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-1.5 rounded-lg">
                    ⚠️ <strong>Comercio pausado:</strong> Los clientes en Vixy Pedidos verán este comercio inactivo y no podrán agregar productos al carrito.
                  </p>
                )}
              </div>

              {/* Financial Stats & Location */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[9px] text-neutral-400 uppercase font-bold block">Ventas</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ${totalFacturadoUsd.toFixed(2)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[9px] text-neutral-400 uppercase font-bold block">En Bolívares</span>
                  <span className="font-bold text-neutral-700 dark:text-neutral-300 font-mono">
                    Bs. {(totalFacturadoUsd * tasaBcv).toFixed(0)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800">
                  <span className="text-[9px] text-neutral-400 uppercase font-bold block">Tiempo Envío</span>
                  <span className="font-bold text-neutral-700 dark:text-neutral-300">
                    {item.tiempoEstimadoMin}-{item.tiempoEstimadoMax}m
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Schedule & Active Status Modal */}
      {editingStore && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-700 max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Horarios y Estatus de Atención
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {editingStore.nombre} ({editingStore.categoria})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingStore(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4 text-xs">
              {/* Active Toggle in Form */}
              <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900 dark:text-white block">
                    Disponibilidad del Comercio
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Si está inactivo, el cliente no puede realizar pedidos.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditActivo(!editActivo)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    editActivo
                      ? 'bg-emerald-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{editActivo ? 'Activo' : 'Inactivo'}</span>
                </button>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Hora Apertura</label>
                  <input
                    type="time"
                    required
                    value={editHoraApertura}
                    onChange={(e) => setEditHoraApertura(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-neutral-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-neutral-500">Hora Cierre</label>
                  <input
                    type="time"
                    required
                    value={editHoraCierre}
                    onChange={(e) => setEditHoraCierre(e.target.value)}
                    className="w-full p-2.5 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-700 font-mono font-bold text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Operating Days */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-neutral-500">Días de Operación Semanal</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {DIAS_SEMANA.map(dia => {
                    const isSelected = editDias.includes(dia);
                    return (
                      <button
                        type="button"
                        key={dia}
                        onClick={() => toggleDia(dia)}
                        className={`p-2 rounded-xl text-left font-bold transition cursor-pointer flex items-center justify-between border ${
                          isSelected
                            ? 'bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400'
                            : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                        }`}
                      >
                        <span>{dia}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="w-1/2 py-2.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 text-neutral-700 dark:text-neutral-300 font-bold rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition cursor-pointer shadow-md"
                >
                  Guardar Cambios (MySQL)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
