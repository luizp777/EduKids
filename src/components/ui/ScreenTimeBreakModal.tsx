import React, { useEffect, useRef } from 'react';
import { Moon, LockOpen } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useModalFocusTrap } from '../../utils/useModalFocusTrap';
import { LumiMascot } from '../illustrations/LumiMascot';

/** Propriedades do modal `ScreenTimeBreakModal`. */
interface ScreenTimeBreakModalProps {
  /** Callback acionado quando os pais solicitam o desbloqueio via Parental Gate. */
  onRequestParentUnlock: () => void;
}

/** Modal gentil "Hora da Pausa com a Lumi" exibido quando o limite diário de tempo de tela é atingido. */
export const ScreenTimeBreakModal: React.FC<ScreenTimeBreakModalProps> = ({
  onRequestParentUnlock,
}) => {
  const { activeProfile, say } = useApp();
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(dialogRef);

  useEffect(() => {
    say('Hora da pausa! Você brincou muito bem hoje! Vamos descansar um pouquinho?');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hora da Pausa com a Lumi"
      className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/75 backdrop-blur-md p-4"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="animate-pop-in w-full max-w-md rounded-[32px] bg-gradient-to-b from-[#EDE9FE] to-[#FFF9F0] border-4 border-purple-200 p-6 sm:p-7 text-center shadow-2xl outline-none"
      >
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-indigo-700">
          <Moon className="h-3.5 w-3.5" />
          Hora da Pausa
        </div>

        <div className="mt-3 flex justify-center">
          <LumiMascot mood="sleepy" accessory={activeProfile.lumiAccessory} size={112} />
        </div>

        <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-indigo-900">
          Você brilhou hoje, {activeProfile.name}!
        </h2>
        <p className="mt-2 text-sm sm:text-base font-bold text-slate-600 leading-relaxed">
          A Lumi já está com soninho! Que tal beber uma aguinha, descansar os olhinhos e brincar longe da tela?
        </p>

        <button
          type="button"
          onClick={onRequestParentUnlock}
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-indigo-200 px-5 py-3 text-sm font-extrabold text-indigo-700 hover:bg-indigo-50 cursor-pointer"
        >
          <LockOpen className="h-4 w-4" />
          Pais: liberar +15 min ou ajustar
        </button>
      </div>
    </div>
  );
};
