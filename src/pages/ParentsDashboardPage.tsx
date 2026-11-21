import React, { useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  UserPlus,
  Trash2,
  RotateCcw,
  Star,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { PILLARS } from '../data/catalog';
import type { AgeLevel, AvatarId, VoiceSpeed } from '../types';
import { AVATAR_OPTIONS, AvatarSvg } from '../components/illustrations/AvatarSvg';

interface Props {
  onBack: () => void;
}

export const ParentsDashboardPage: React.FC<Props> = ({ onBack }) => {
  const {
    state,
    activeProfile,
    setActiveProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    resetProfileProgress,
    updateAudio,
    say,
  } = useApp();

  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<AvatarId>('bear');
  const [newAge, setNewAge] = useState<AgeLevel>('3-4');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addProfile(newName.trim(), newAvatar, newAge);
    setNewName('');
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
            Voltar ao App
          </button>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-800">
            Área dos Pais
          </h1>
          <div className="w-24" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6 flex flex-col gap-6">
        {/* Audio Settings */}
        <section className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-800 mb-4">
            Áudio e Narração (Pré-leitores)
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateAudio({ voiceEnabled: !state.audio.voiceEnabled })}
              className={`flex items-center justify-between rounded-2xl p-4 border-2 cursor-pointer transition-colors ${
                state.audio.voiceEnabled
                  ? 'bg-indigo-50 border-indigo-400 text-indigo-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                {state.audio.voiceEnabled ? (
                  <Volume2 className="h-6 w-6 text-indigo-600" />
                ) : (
                  <VolumeX className="h-6 w-6 text-slate-400" />
                )}
                <div className="text-left">
                  <div className="font-bold">Narração em Português</div>
                  <div className="text-xs opacity-75">Lê as instruções em voz alta</div>
                </div>
              </div>
              <span className="font-extrabold text-sm">
                {state.audio.voiceEnabled ? 'ATIVO' : 'DESLIGADO'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateAudio({ sfxEnabled: !state.audio.sfxEnabled })}
              className={`flex items-center justify-between rounded-2xl p-4 border-2 cursor-pointer transition-colors ${
                state.audio.sfxEnabled
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <Music className="h-6 w-6 text-emerald-600" />
                <div className="text-left">
                  <div className="font-bold">Efeitos Sonoros</div>
                  <div className="text-xs opacity-75">Sons de acerto, toque e confete</div>
                </div>
              </div>
              <span className="font-extrabold text-sm">
                {state.audio.sfxEnabled ? 'ATIVO' : 'DESLIGADO'}
              </span>
            </button>
          </div>

          {/* Speech Speed & Voice Selection */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-bold text-slate-700 mb-2">
                Velocidade da Leitura
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'slow', label: 'Devagar' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'fast', label: 'Rápida' },
                  ] as { id: VoiceSpeed; label: string }[]
                ).map((opt) => {
                  const active = (state.audio.voiceSpeed || 'normal') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateAudio({ voiceSpeed: opt.id })}
                      className={`rounded-xl py-2 text-xs font-extrabold border-2 cursor-pointer transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-700 mb-2">
                Voz da Narração (pt-BR)
              </div>
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                <div className="text-xs font-bold text-slate-600">
                  Voz Neural da Lumi (offline)
                </div>
                <button
                  type="button"
                  onClick={() =>
                    say('Olá! Eu sou a Lumi e vou ler os exercícios com você!')
                  }
                  className="flex items-center gap-1 rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-extrabold text-indigo-700 hover:bg-indigo-200 cursor-pointer shrink-0"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Testar Voz
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Profiles Management */}
        <section className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-slate-800">
              Perfis das Crianças
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-[#6C5CE7] px-3.5 py-2 text-sm font-bold text-white hover:bg-[#5a4bd1] cursor-pointer"
            >
              <UserPlus className="h-4 w-4" />
              Novo Perfil
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={handleCreateProfile}
              className="mb-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 p-4 flex flex-col gap-3"
            >
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nome da criança"
                  required
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
                <select
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value as AgeLevel)}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 font-bold text-slate-800"
                >
                  <option value="3-4">3–4 anos (Exploradores)</option>
                  <option value="5-6">5–6 anos (Descobridores)</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setNewAvatar(av.id)}
                    className={`rounded-full p-1 border-3 cursor-pointer ${
                      newAvatar === av.id ? 'border-indigo-600 scale-105' : 'border-transparent'
                    }`}
                  >
                    <AvatarSvg avatar={av.id} size={46} />
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  Criar Perfil
                </button>
              </div>
            </form>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {state.profiles.map((prof) => {
              const isActive = prof.id === activeProfile.id;
              return (
                <div
                  key={prof.id}
                  className={`rounded-2xl p-4 border-2 flex flex-col gap-3 ${
                    isActive
                      ? 'bg-indigo-50/60 border-indigo-400'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AvatarSvg avatar={prof.avatar} size={52} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-display text-lg font-bold text-slate-800 truncate">
                          {prof.name}
                        </span>
                        {isActive && (
                          <CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span className="inline-flex items-center gap-0.5 text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {prof.stars} estrelas
                        </span>
                        <span>•</span>
                        <span>{prof.unlockedStickers.length} figurinhas</span>
                      </div>
                    </div>
                  </div>

                  {/* Age Level toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateProfile(prof.id, { ageLevel: '3-4' })}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-extrabold border cursor-pointer ${
                        prof.ageLevel === '3-4'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      3–4 anos
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProfile(prof.id, { ageLevel: '5-6' })}
                      className={`flex-1 rounded-xl py-1.5 text-xs font-extrabold border cursor-pointer ${
                        prof.ageLevel === '5-6'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      5–6 anos
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/70">
                    {!isActive ? (
                      <button
                        type="button"
                        onClick={() => setActiveProfile(prof.id)}
                        className="text-xs font-extrabold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Selecionar perfil
                      </button>
                    ) : (
                      <span className="text-xs font-extrabold text-indigo-600">
                        Perfil ativo
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Zerar o progresso de ${prof.name}?`)) {
                            resetProfileProgress(prof.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                        title="Resetar progresso"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      {state.profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Excluir o perfil ${prof.name}?`)) {
                              deleteProfile(prof.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                          title="Excluir perfil"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Progress by Pillar */}
        <section className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-800 mb-1">
            Progresso de {activeProfile.name}
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Nível atual: {activeProfile.ageLevel === '3-4' ? '3–4 anos (Exploradores)' : '5–6 anos (Descobridores)'}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PILLARS.map((pillar) => {
              const stat = activeProfile.stats[pillar.id];
              return (
                <div
                  key={pillar.id}
                  className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-2"
                >
                  <div className="font-display text-base font-bold text-slate-800">
                    {pillar.title}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-slate-50 p-2">
                      <div className="text-lg font-extrabold text-indigo-600">
                        {stat.completedRounds}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">Rodadas</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <div className="text-lg font-extrabold text-emerald-600">
                        {stat.correctAnswers}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">Acertos</div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2">
                      <div className="text-lg font-extrabold text-amber-500">
                        {stat.starsEarned}
                      </div>
                      <div className="text-[11px] font-bold text-slate-500">Estrelas</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};
