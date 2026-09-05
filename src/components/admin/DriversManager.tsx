import React, { useState } from 'react';
import { 
  Bike, 
  ShieldCheck, 
  Star, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  UserCheck, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Award
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const DriversManager: React.FC = () => {
  const { driver, openCall } = useDelivery();
  const [selectedDriver, setSelectedDriver] = useState<any>(driver);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-neutral-850 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Bike className="w-4 h-4 text-amber-500" />
            Padrón de Motorizados & Cumplimiento de Leyes Venezolanas
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Registro legal obligatorio según la Ley de Transporte Terrestre e INTT de la República Bolivariana de Venezuela
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            1 Conductor Habilitado
          </span>
        </div>
      </div>

      {/* Main Grid: Driver Card and Detailed Legal Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Driver Overview Card */}
        <div className="p-5 bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={selectedDriver.fotoUrl}
              alt={selectedDriver.nombre}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500"
            />
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                {selectedDriver.nombre} {selectedDriver.apellido}
              </h3>
              <p className="text-xs text-neutral-500 font-mono">C.I: {selectedDriver.legal.cedula}</p>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-500" />
                {selectedDriver.rating} ({selectedDriver.totalEntregas} viajes completados)
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs border-t border-b border-neutral-100 dark:border-neutral-800 py-3">
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Teléfono:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedDriver.telefono}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Correo:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedDriver.email}</span>
            </div>
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Ubicación:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{selectedDriver.ubicacionActual}</span>
            </div>
          </div>

          {/* Motorcycle Specifications */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
              Vehículo Asignado
            </span>
            <div className="space-y-1 text-neutral-700 dark:text-neutral-300">
              <p><strong>Marca:</strong> {selectedDriver.moto.marca}</p>
              <p><strong>Modelo:</strong> {selectedDriver.moto.modelo} ({selectedDriver.moto.ano})</p>
              <p><strong>Color:</strong> {selectedDriver.moto.color}</p>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                <strong>Placa INTT:</strong> {selectedDriver.moto.placa}
              </p>
              <p className="font-mono text-[11px] text-neutral-500">
                <strong>Serial Motor:</strong> {selectedDriver.moto.serialMotor}
              </p>
              <p className="font-mono text-[11px] text-neutral-500">
                <strong>Serial Chasis:</strong> {selectedDriver.moto.serialChasis}
              </p>
            </div>
          </div>

          <button
            onClick={() => openCall('Administrador Web Vixy', `${selectedDriver.nombre} ${selectedDriver.apellido} (Repartidor)`, selectedDriver.telefono, 'Motorizado')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
          >
            <Phone className="w-4 h-4" />
            Llamar al Conductor
          </button>
        </div>

        {/* Right Column: Complete Legal Compliance Records (Venezuelan Traffic Laws) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-white dark:bg-neutral-850 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Expediente de Documentación Legal (INTT / MPPS / RCV)
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Validación de recaudos exigidos para la prestación del servicio de reparto en dos ruedas
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Aprobado 100%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Licencia Grado 2da */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Licencia INTT</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-neutral-900 dark:text-white">Grado 2da (Motocicletas)</h4>
                <p className="text-neutral-500 font-mono text-[11px]">{selectedDriver.legal.licenciaNumero}</p>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Vigente hasta: {selectedDriver.legal.licenciaVencimiento}
                </div>
              </div>

              {/* Certificado Médico Vial */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Certificado Médico</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-neutral-900 dark:text-white">Certificado Médico Vial</h4>
                <p className="text-neutral-500 font-mono text-[11px]">{selectedDriver.legal.certificadoMedicoNumero}</p>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Vigente hasta: {selectedDriver.legal.certificadoMedicoVencimiento}
                </div>
              </div>

              {/* Seguro RCV */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Seguro Vehicular</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <h4 className="font-bold text-neutral-900 dark:text-white">{selectedDriver.legal.rcvAseguradora}</h4>
                <p className="text-neutral-500 font-mono text-[11px]">{selectedDriver.legal.rcvPolizaNumero}</p>
                <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Vencimiento: {selectedDriver.legal.rcvVencimiento}
                </div>
              </div>
            </div>

            {/* Customer reviews and ratings log */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                Historial de Calificaciones y Opiniones Recientes ({selectedDriver?.resenas?.length ?? 0})
              </h4>

              <div className="space-y-2">
                {(selectedDriver?.resenas || []).map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{r.clienteNombre}</span>
                      <div className="flex text-amber-400">
                        {[...Array(r.calificacion)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 text-[11px] italic">
                      "{r.comentario}"
                    </p>
                    <span className="text-[10px] text-neutral-400 block font-mono text-right">{r.fecha}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
