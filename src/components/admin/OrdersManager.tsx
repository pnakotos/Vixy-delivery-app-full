import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Bike, 
  Receipt, 
  User, 
  Store,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const OrdersManager: React.FC = () => {
  const { orders, tasaBcv, openChat, openCall } = useDelivery();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.codigoSeguimiento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.comercio.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todos' || order.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-5">
      {/* Header with Search and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-amber-500" />
            Centro de Gestión de Pedidos & Solicitudes
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Monitoreo en tiempo real de pagos directos, preparación y despacho motorizado
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por código, cliente o local..."
              className="pl-8 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl w-60 outline-hidden focus:ring-1 focus:ring-amber-500 text-neutral-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl px-3 py-1.5 text-neutral-900 dark:text-white outline-hidden"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente_pago">Pendiente Pago</option>
            <option value="pago_verificado">Pago Verificado</option>
            <option value="en_preparacion">En Preparación</option>
            <option value="en_camino_al_cliente">En Camino al Cliente</option>
            <option value="entregado">Entregado</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => {
          const isExpanded = expandedOrderId === order.id;

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs transition"
            >
              {/* Main row */}
              <div
                onClick={() => toggleExpand(order.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                    order.estado === 'entregado'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {order.codigoSeguimiento.slice(-4)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        #{order.codigoSeguimiento}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 capitalize font-medium">
                        {order.estado.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      {order.comercio.nombre} → {order.cliente.nombre} {order.cliente.apellido}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-extrabold text-neutral-900 dark:text-white font-mono block">
                      ${order.montoTotalUsd.toFixed(2)} USD
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Bs. {order.montoTotalBs.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right hidden md:block">
                    <span className="text-[10px] text-neutral-400 block uppercase font-bold">Pago Directo</span>
                    <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                      {order.metodoPagoSeleccionado === 'pago_movil' ? 'Pago Móvil BDV' : order.metodoPagoSeleccionado.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.conductor && (
                      <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                        <Bike className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                          {order.conductor.nombre} ({order.conductor.moto.placa})
                        </span>
                      </div>
                    )}

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Detail Panel */}
              {isExpanded && (
                <div className="p-4 bg-neutral-50/50 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800 space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Customer info */}
                    <div className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">Datos del Cliente</span>
                      <p className="font-bold text-neutral-900 dark:text-white">{order.cliente.nombre} {order.cliente.apellido}</p>
                      <p className="text-neutral-500 font-mono">C.I: {order.cliente.cedula}</p>
                      <p className="text-neutral-500">Tel: {order.cliente.telefono}</p>
                      <p className="text-neutral-600 dark:text-neutral-400 text-[11px] mt-1">{order.cliente.direccion}</p>
                    </div>

                    {/* Merchant info */}
                    <div className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">Comercio Emisor</span>
                      <p className="font-bold text-neutral-900 dark:text-white">{order.comercio.nombre}</p>
                      <p className="text-neutral-500 font-mono">RIF: {order.comercio.rif}</p>
                      <p className="text-neutral-500">Tel: {order.comercio.telefono}</p>
                      <p className="text-neutral-600 dark:text-neutral-400 text-[11px] mt-1">{order.comercio.direccion}</p>
                    </div>

                    {/* Driver & Moto info */}
                    <div className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">Motorizado Asignado</span>
                      {order.conductor ? (
                        <>
                          <p className="font-bold text-neutral-900 dark:text-white">
                            {order.conductor.nombre} {order.conductor.apellido}
                          </p>
                          <p className="text-neutral-500 font-mono">C.I: {order.conductor.legal.cedula}</p>
                          <p className="text-amber-500 font-mono font-bold">
                            Moto: {order.conductor.moto.marca} {order.conductor.moto.modelo} ({order.conductor.moto.placa})
                          </p>
                          <p className="text-emerald-500 text-[10px]">Licencia Grado 2da & CMV Vigentes</p>
                        </>
                      ) : (
                        <p className="text-neutral-400 italic">Esperando asignación automática...</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Breakdown & Items */}
                  <div className="p-3 bg-white dark:bg-neutral-850 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">Productos Solicitados</span>
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-neutral-600 dark:text-neutral-400 text-xs">
                          <span>{it.cantidad}x {it.nombre}</span>
                          <span className="font-mono">${(it.subtotalUsd ?? (it.precioUnitarioUsd * it.cantidad) ?? 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-full sm:w-64 border-t sm:border-t-0 sm:border-l border-neutral-200 dark:border-neutral-800 pt-2 sm:pt-0 sm:pl-4 space-y-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase block">Detalle Financiero</span>
                      <div className="flex justify-between text-neutral-500">
                        <span>Subtotal Comida:</span>
                        <span>${(order.montoSubtotalUsd ?? 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500">
                        <span>Tarifa Delivery Moto:</span>
                        <span>${(order.costoEnvioUsd ?? 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-neutral-900 dark:text-white pt-1 border-t border-neutral-100 dark:border-neutral-800">
                        <span>Total:</span>
                        <span className="text-amber-500 font-mono">${(order.montoTotalUsd ?? 0).toFixed(2)} USD (Bs. {(order.montoTotalBs ?? ((order.montoTotalUsd ?? 0) * (order.tasaBcvBs || 45.5)) ?? 0).toFixed(2)})</span>
                      </div>
                      {order.referenciaPago && (
                        <p className="text-[10px] text-neutral-400 mt-1 font-mono">
                          Referencia directa: {order.referenciaPago}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Verification image proof if delivered */}
                  {order.fotoVerificacion && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={order.fotoVerificacion.url}
                          alt="Comprobante"
                          className="w-16 h-12 rounded-lg object-cover border border-emerald-500"
                        />
                        <div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs block">
                            Comprobante Fotográfico de Entrega Registrado
                          </span>
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                            {order.fotoVerificacion.comentario}
                          </p>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {order.fotoVerificacion.coordenadas} • {order.fotoVerificacion.fecha}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step-by-Step Operations Log for this order */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase block">
                      Trazabilidad Operativa Paso a Paso (Auditoría Vixy)
                    </span>
                    <div className="space-y-1">
                      {order.historialOperaciones.map((step, sIdx) => (
                        <div
                          key={sIdx}
                          className="flex items-start gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-850 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800"
                        >
                          <span className="font-mono text-[10px] text-amber-500 font-bold shrink-0">{step.timestamp}</span>
                          <span className="capitalize font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">[{step.actor}]:</span>
                          <span className="flex-1">{step.descripcion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
