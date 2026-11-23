import React from 'react';
import { Home, RotateCcw } from 'lucide-react';
import { LumiMascot } from '../illustrations/LumiMascot';

/** Propriedades do componente resiliente `ErrorBoundary`. */
interface ErrorBoundaryProps {
  /** Escopo do fallback: `'root'` recarrega o app; `'activity'` permite tentar novamente ou voltar ao início. */
  scope?: 'root' | 'activity';
  /** Chave que, ao mudar, reseta automaticamente o estado de erro do boundary. */
  resetKey?: string;
  /** Callback para retornar à tela inicial (usado quando `scope="activity"`). */
  onGoHome?: () => void;
  /** Conteúdo protegido pelo Error Boundary. */
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/** Error Boundary resiliente com a mascote Lumi para recuperar falhas sem tela branca. */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('[EduKids ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleRetry = (): void => {
    if (this.props.scope === 'root') {
      window.location.reload();
      return;
    }
    this.setState({ hasError: false });
  };

  private handleGoHome = (): void => {
    this.setState({ hasError: false });
    this.props.onGoHome?.();
  };

  render(): React.ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const isRoot = this.props.scope === 'root';

    return (
      <div
        role="alert"
        className="min-h-dvh bg-gradient-to-b from-[#EDE9FE] via-[#FFF9F0] to-[#FFF9F0] flex items-center justify-center p-6"
      >
        <div className="w-full max-w-md rounded-[32px] bg-white border-4 border-purple-200 p-6 sm:p-8 text-center card-3d">
          <div className="flex justify-center mb-2">
            <LumiMascot mood="encouraging" size={104} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#6C5CE7]">
            Ops! A Lumi tropeçou!
          </h1>
          <p className="mt-2 text-sm sm:text-base font-bold text-slate-600 leading-relaxed">
            {isRoot
              ? 'Algo inesperado aconteceu, mas seu progresso continua salvo. Vamos recarregar o app?'
              : 'Essa atividade precisou de uma pausinha. Podemos tentar de novo ou voltar ao início!'}
          </p>

          <div className={`mt-6 grid gap-3 ${!isRoot && this.props.onGoHome ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {!isRoot && this.props.onGoHome && (
              <button
                type="button"
                onClick={this.handleGoHome}
                className="btn-3d flex items-center justify-center gap-2 rounded-2xl bg-slate-200 hover:bg-slate-300 px-4 py-3.5 font-display text-base sm:text-lg font-bold text-slate-700 cursor-pointer"
              >
                <Home className="h-5 w-5" />
                Início
              </button>
            )}
            <button
              type="button"
              onClick={this.handleRetry}
              className="btn-3d flex items-center justify-center gap-2 rounded-2xl bg-[#6C5CE7] hover:bg-[#5a4bd1] px-4 py-3.5 font-display text-base sm:text-lg font-bold text-white cursor-pointer"
            >
              <RotateCcw className="h-5 w-5" />
              {isRoot ? 'Recarregar o App' : 'Tentar de novo'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
