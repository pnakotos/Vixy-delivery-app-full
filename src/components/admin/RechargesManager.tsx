import React, { useState } from 'react';
import { 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  DollarSign, 
  User, 
  Bike, 
  Building, 
  ShieldCheck, 
  FileText, 
  ArrowUpRight,
  Filter,
  Check,
  X,
  FolderTree
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const RechargesManager: React.FC = () => {
  const { 
    rechargeRequests, 
    aprobarRecarga, 
    rechazarRecarga, 
    tasaBcv 
  } = useDelivery();

  const [filterRole, setFilterRole] = useState<'all' | 'cliente' | 'conductor'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pendiente' | 'aprobada' | 'rechazada'>('pendiente');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);

  const filteredRequests = rechargeRequests.filter(req => {
    if (filterRole !== 'all' && req.usuarioTipo !== filterRole) return false;
    if (filterStatus !== 'all' && req.estado !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = req.usuarioNombre.toLowerCase().includes(q);
      const matchRef = req.referencia.toLowerCase().includes(q);
      const matchId = req.id.toLowerCase().includes(q);
      if (!matchName && !matchRef && !matchId) return false;
    }
    return true;
  });

  const countPending = rechargeRequests.filter(r => r.estado === 'pendiente').length;
  const countApproved = rechargeRequests.filter(r => r.estado === 'aprobada').length;
  const countRejected = rechargeRequests.filter(r => r.estado === 'rechazada').length;
  const totalApprovedUsd = rechargeRequests
    .filter(r => r.estado === 'aprobada')
    .reduce((sum, r) => sum + r.montoUsd, 0);

  const handleApprove = (id: string) => {
    aprobarRecarga(id, 'Comprobante verificado con conciliación bancaria exitosa.');
  };

  const handleRejectConfirm = () => {
    if (showRejectModal) {
      rechazarRecarga(showRejectModal, rejectNote.trim() || 'Comprobante no coincide con extracto bancario.');
      setShowRejectModal(null);
      setRejectNote('');
    }
  };

  return (
    <div className="space-y-4 text-neutral-900 dark:text-neutral-100">
      {/* Header Banner */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 border border-purple-600/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Autorización de Recargas de Cartera (Backend Central)
              </h2>
              <p className="text-xs text-neutral-500">
                Verificación y aprobación requerida para saldos en Vixy Pedidos y Vixy Delivery
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats in Purple & Dark style */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-right">
            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium block">Pendientes</span>
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300 font-mono">{countPending}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-right">
            <span className="text-[10px] text-neutral-500 block">Aprobadas</span>
            <span className="text-sm font-bold text-neutral-900 dark:text-white font-mono">{countApproved}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-right">
            <span className="text-[10px] text-neutral-500 block">Total Acreditado</span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-400 font-mono">${totalApprovedUsd.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterStatus('pendiente')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                filterStatus === 'pendiente'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pendientes ({countPending})</span>
            </button>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Todas ({rechargeRequests.length})
            </button>
            <button
              onClick={() => setFilterStatus('aprobada')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                filterStatus === 'aprobada'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Aprobadas ({countApproved})
            </button>
            <button
              onClick={() => setFilterStatus('rechazada')}
              className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
                filterStatus === 'rechazada'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Rechazadas ({countRejected})
            </button>
          </div>

          {/* Role selector */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filterRole === 'all' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterRole('cliente')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterRole === 'cliente' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <User className="w-3 h-3" />
              <span>Clientes</span>
            </button>
            <button
              onClick={() => setFilterRole('conductor')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1 ${
                filterRole === 'conductor' ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs' : 'text-neutral-500'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>Motorizados</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, referencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 focus:outline-hidden focus:border-purple-500"
          />
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-neutral-400 space-y-2">
            <ShieldCheck className="w-10 h-10 mx-auto text-neutral-300 dark:text-neutral-700" />
            <p className="text-sm font-medium">No hay solicitudes de recarga que coincidan con el filtro.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {filteredRequests.map(req => {
              const isClient = req.usuarioTipo === 'cliente';
              return (
                <div 
                  key={req.id}
                  className="p-4 hover:bg-neutral-50/60 dark:hover:bg-neutral-850/60 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isClient 
                        ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20' 
                        : 'bg-neutral-800 text-purple-300 border border-neutral-700'
                    }`}>
                      {isClient ? <User className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white">
                          {req.usuarioNombre}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-mono font-medium">
                          {isClient ? 'Cliente Vixy Pedidos' : 'Motorizado Vixy Delivery'}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono">
                          ID: {req.usuarioId}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-400 flex-wrap">
                        <span>Método: <strong className="text-neutral-900 dark:text-neutral-200 uppercase font-mono">{req.metodoPago}</strong></span>
                        <span>Ref: <strong className="text-neutral-900 dark:text-neutral-200 font-mono">{req.referencia}</strong></span>
                        <span className="text-[11px] text-neutral-400 font-mono">{req.fecha}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-purple-600 dark:text-purple-400 font-mono">
                        <FolderTree className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-md">{req.carpetaAlmacenamiento}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amounts & Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-base font-black text-neutral-900 dark:text-white font-mono block">
                        +${req.montoUsd.toFixed(2)} USD
                      </span>
                      <span className="text-xs text-neutral-500 font-mono block">
                        Bs. {req.montoBs.toFixed(2)}
                      </span>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 ${
                        req.estado === 'pendiente'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                          : req.estado === 'aprobada'
                          ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 border border-red-500/20'
                      }`}>
                        {req.estado === 'pendiente' ? '⏳ Pendiente Backend' : req.estado === 'aprobada' ? '✅ Aprobada' : '❌ Rechazada'}
                      </span>
                    </div>

                    {/* Receipt inspection button */}
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
                      title="Inspeccionar Comprobante"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Action buttons if pending */}
                    {req.estado === 'pendiente' && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Aprobar</span>
                        </button>
                        <button
                          onClick={() => setShowRejectModal(req.id)}
                          className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-red-500/10 text-neutral-500 hover:text-red-500 rounded-xl transition cursor-pointer border border-neutral-200 dark:border-neutral-700"
                          title="Rechazar solicitud"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: View Receipt & Details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                  Auditoría de Comprobante de Recarga
                </h3>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-neutral-400 hover:text-neutral-600 text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 p-2 text-center">
                <img 
                  src={selectedRequest.comprobanteUrl} 
                  alt="Comprobante Bancario" 
                  className="max-h-64 mx-auto rounded-xl object-contain shadow-xs"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block font-mono">
                  {selectedRequest.carpetaAlmacenamiento}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-neutral-50 dark:bg-neutral-850 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Usuario</span>
                  <span className="font-bold text-neutral-900 dark:text-white">{selectedRequest.usuarioNombre}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Monto Total</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                    ${selectedRequest.montoUsd.toFixed(2)} USD ({selectedRequest.montoBs.toFixed(2)} Bs)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Método</span>
                  <span className="font-mono text-neutral-800 dark:text-neutral-200 uppercase">{selectedRequest.metodoPago}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase block">Referencia Bancaria</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">{selectedRequest.referencia}</span>
                </div>
              </div>
            </div>

            {selectedRequest.estado === 'pendiente' && (
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => {
                    handleApprove(selectedRequest.id);
                    setSelectedRequest(null);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprobar y Acreditar Saldo Ahora</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Reject Note */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-500">
              <XCircle className="w-5 h-5" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">Rechazar Solicitud de Recarga</h3>
            </div>
            <p className="text-xs text-neutral-500">
              Indica la razón del rechazo para que el usuario sea notificado en su aplicación:
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Ej: Referencia no encontrada en extracto bancario o monto incorrecto..."
              className="w-full text-xs p-2.5 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 outline-hidden"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectNote('');
                }}
                className="px-3 py-1.5 text-xs text-neutral-500 hover:text-neutral-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
