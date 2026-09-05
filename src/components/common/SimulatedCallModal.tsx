import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const SimulatedCallModal: React.FC = () => {
  const { callModal, closeCall } = useDelivery();
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    let timer: any;
    if (callModal.isOpen) {
      setSeconds(0);
      timer = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callModal.isOpen]);

  if (!callModal.isOpen) return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center text-white shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-neutral-800 text-amber-400 mb-6 border border-neutral-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            Llamada Encriptada Vixy VoIP
          </div>

          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-1 mb-4 shadow-lg shadow-amber-500/20">
            <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center">
              <Phone className="w-10 h-10 text-amber-400 animate-pulse" />
            </div>
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-1">
            {callModal.callee}
          </h3>
          <p className="text-xs text-neutral-400 mb-2 uppercase tracking-wider">
            {callModal.role} • {callModal.phone}
          </p>

          <div className="flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-sm font-mono text-emerald-400">
              {formatDuration(seconds)}
            </span>
          </div>

          {/* Audio waves visual simulation */}
          <div className="flex items-center justify-center gap-1.5 h-8 mb-8">
            {[40, 75, 100, 60, 90, 45, 80, 50, 95, 30].map((height, i) => (
              <span
                key={i}
                className="w-1 bg-amber-400/80 rounded-full animate-pulse"
                style={{
                  height: `${Math.max(15, (height * ((seconds % 4) + 1)) / 4)}%`,
                  animationDuration: `${0.4 + (i % 3) * 0.2}s`
                }}
              />
            ))}
          </div>

          {/* Quick Real Contact Actions: GSM Phone Call & WhatsApp */}
          <div className="grid grid-cols-2 gap-2 w-full mb-5">
            <a
              href={`tel:${callModal.phone}`}
              className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition"
              title="Llamar directamente por la red celular"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Llamar Directo</span>
            </a>

            <a
              href={`https://wa.me/${callModal.phone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition"
              title="Enviar mensaje por WhatsApp"
            >
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-4 w-full mb-6">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition ${
                isMuted ? 'bg-amber-500 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              <span className="text-[10px] font-medium">{isMuted ? 'Silenciado' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setIsSpeaker(!isSpeaker)}
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition ${
                isSpeaker ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {isSpeaker ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span className="text-[10px] font-medium">Altavoz</span>
            </button>

            <div className="p-3.5 rounded-2xl bg-neutral-800 text-neutral-400 flex flex-col items-center justify-center gap-1">
              <span className="text-xs font-bold text-amber-400">HD</span>
              <span className="text-[10px] font-medium">Audio 48k</span>
            </div>
          </div>

          <button
            onClick={closeCall}
            className="w-full py-3.5 px-6 rounded-2xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition"
          >
            <PhoneOff className="w-5 h-5" />
            Finalizar Llamada
          </button>
        </div>
      </div>
    </div>
  );
};
