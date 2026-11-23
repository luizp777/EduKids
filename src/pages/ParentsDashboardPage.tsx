import React, { useRef, useState } from 'react';
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
  Pencil,
  Download,
  Upload,
  Trophy,
  Sparkles,
  Moon,
  Clock,
  WifiOff,
  Flame,
  History,
  Globe,
} from 'lucide-react';
import { useApp } from '../state/AppContext';
import { PILLARS } from '../data/catalog';
import { playMusicalNote } from '../utils/audio';
import { useTimers } from '../utils/useTimers';
import type { AgeLevel, AvatarId, VoiceSpeed } from '../types';
import { AVATAR_OPTIONS, AvatarSvg } from '../components/illustrations/AvatarSvg';

interface Props {
  onBack: () => void;
}

/** Painel administrativo dos pais para controle de áudio/volume global, perfis infantis, backup e métricas por pilar. */
export const ParentsDashboardPage: React.FC<Props> = ({ onBack }) => {
  const {
    state,
    activeProfile,
    setActiveProfile,
    addProfile,
    updateProfile,
    deleteProfile,
    resetProfileProgress,
    importBackupState,
    updateAudio,
    updateScreenTimeLimit,
    say,
  } = useApp();

  const [offlineProgress, setOfflineProgress] = useState<{
    running: boolean;
    done: number;
    total: number;
    status: string;
  } | null>(null);

  const handleDownloadAllOfflineAudio = async () => {
    if (typeof window === 'undefined' || !('caches' in window)) {
      setOfflineProgress({
        running: false,
        done: 0,
        total: 0,
        status: 'Seu navegador não suporta cache offline (Cache API).',
      });
      return;
    }
    try {
      setOfflineProgress({ running: true, done: 0, total: 0, status: 'Carregando lista de áudios...' });
      const res = await fetch('/audio/pt-br/manifest.json');
      if (!res.ok) throw new Error('Manifest unavailable');
      const urls = (await res.json()) as string[];
      const cache = await caches.open('edukids-cache-v4');
      let completed = 0;
      setOfflineProgress({
        running: true,
        done: 0,
        total: urls.length,
        status: `Baixando 0 de ${urls.length} áudios...`,
      });
      const batchSize = 12;
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (url) => {
            const existing = await cache.match(url);
            if (!existing) {
              await cache.add(url);
            }
            completed += 1;
          })
        );
        setOfflineProgress({
          running: true,
          done: completed,
          total: urls.length,
          status: `Baixando ${completed} de ${urls.length} áudios...`,
        });
      }
      setOfflineProgress({
        running: false,
        done: urls.length,
        total: urls.length,
        status: `Pronto! Todos os ${urls.length} áudios estão salvos para uso 100% offline!`,
      });
    } catch {
      setOfflineProgress({
        running: false,
        done: 0,
        total: 0,
        status: 'Não foi possível concluir o download offline. Verifique sua conexão.',
      });
    }
  };

  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState<AvatarId>('bear');
  const [newAge, setNewAge] = useState<AgeLevel>('3-4');
  const [showAddForm, setShowAddForm] = useState(false);

  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState<AvatarId>('owl');
  const [backupMessage, setBackupMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { schedule, clearAll } = useTimers();

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addProfile(newName.trim(), newAvatar, newAge);
    setNewName('');
    setShowAddForm(false);
  };

  const handleStartEdit = (id: string, name: string, avatar: AvatarId) => {
    setEditingProfileId(id);
    setEditName(name);
    setEditAvatar(avatar);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfileId || !editName.trim()) return;
    updateProfile(editingProfileId, { name: editName.trim(), avatar: editAvatar });
    setEditingProfileId(null);
  };

  const handleExportBackup = () => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `edukids-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage({ kind: 'ok', text: 'Backup exportado com sucesso!' });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const ok = importBackupState(parsed);
        setBackupMessage(
          ok
            ? { kind: 'ok', text: 'Perfis e progresso restaurados com sucesso!' }
            : { kind: 'err', text: 'Arquivo inválido. Selecione um backup do EduKids.' }
        );
      } catch {
        setBackupMessage({ kind: 'err', text: 'Não foi possível ler o arquivo JSON.' });
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const pillarRankings = PILLARS.map((p) => ({
    pillar: p,
    stat: activeProfile.stats[p.id],
  }));
  const maxRounds = Math.max(1, ...pillarRankings.map((r) => r.stat.completedRounds));
  const favoritePillar = [...pillarRankings].sort(
    (a, b) => b.stat.starsEarned - a.stat.starsEarned || b.stat.completedRounds - a.stat.completedRounds
  )[0];
  const practiceSuggestion = [...pillarRankings].sort(
    (a, b) => a.stat.completedRounds - b.stat.completedRounds || a.stat.starsEarned - b.stat.starsEarned
  )[0];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              clearAll();
              onBack();
            }}
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

          {/* Calm / Sensory Mode */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => updateAudio({ calmMode: !state.audio.calmMode })}
              className={`w-full flex items-center justify-between rounded-2xl p-4 border-2 cursor-pointer transition-colors ${
                state.audio.calmMode
                  ? 'bg-teal-50 border-teal-400 text-teal-900'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className={`h-6 w-6 ${state.audio.calmMode ? 'text-teal-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className="font-bold">Modo Calmo / Sensorial</div>
                  <div className="text-xs opacity-75">
                    Desativa confetes, reduz vibrações/saturação e suaviza o volume para momentos tranquilos
                  </div>
                </div>
              </div>
              <span className="font-extrabold text-sm shrink-0">
                {state.audio.calmMode ? 'ATIVO' : 'DESLIGADO'}
              </span>
            </button>
          </div>

          {/* Master Volume Control */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <div className="text-sm font-bold text-slate-700">
                  Volume Geral (Voz, Melodia e Efeitos)
                </div>
                <div className="text-xs text-slate-500">
                  Mantém todos os sons do app equilibrados no mesmo volume
                </div>
              </div>
              <span className="font-display text-sm font-bold text-indigo-600">
                {Math.round((state.audio.volume ?? 0.85) * 100)}%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={state.audio.volume ?? 0.85}
                onChange={(e) => updateAudio({ volume: Number(e.target.value) })}
                aria-label="Volume Geral do Aplicativo"
                className="flex-1 accent-indigo-600 cursor-pointer"
              />
              <div className="grid grid-cols-3 gap-1.5 sm:w-56">
                {[
                  { label: 'Baixo', val: 0.4 },
                  { label: 'Médio', val: 0.75 },
                  { label: 'Alto', val: 1 },
                ].map((preset) => {
                  const isSelected = Math.abs((state.audio.volume ?? 0.85) - preset.val) < 0.06;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateAudio({ volume: preset.val })}
                      className={`rounded-xl py-1.5 text-xs font-extrabold border-2 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>
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
                  onClick={() => {
                    clearAll();
                    playMusicalNote(0, state.audio.sfxEnabled);
                    schedule(() => {
                      playMusicalNote(4, state.audio.sfxEnabled);
                    }, 220);
                    schedule(() => {
                      say('Olá! Eu sou a Lumi e vou ler os exercícios com você!');
                    }, 520);
                  }}
                  className="flex items-center gap-1 rounded-xl bg-indigo-100 px-3 py-1.5 text-xs font-extrabold text-indigo-700 hover:bg-indigo-200 cursor-pointer shrink-0"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Testar Som e Voz
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

                  {/* Foreign Language preference toggle */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-500 shrink-0">
                      <Globe className="h-3.5 w-3.5 text-sky-600" />
                      Idioma:
                    </span>
                    <button
                      type="button"
                      aria-pressed={(prof.preferredLanguage || 'en') === 'en'}
                      onClick={() => updateProfile(prof.id, { preferredLanguage: 'en' })}
                      className={`flex-1 rounded-xl py-1 text-xs font-extrabold border cursor-pointer ${
                        (prof.preferredLanguage || 'en') === 'en'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Inglês (EN)
                    </button>
                    <button
                      type="button"
                      aria-pressed={prof.preferredLanguage === 'es'}
                      onClick={() => updateProfile(prof.id, { preferredLanguage: 'es' })}
                      className={`flex-1 rounded-xl py-1 text-xs font-extrabold border cursor-pointer ${
                        prof.preferredLanguage === 'es'
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-600 border-slate-300'
                      }`}
                    >
                      Espanhol (ES)
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

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(prof.id, prof.name, prof.avatar)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer"
                        title="Editar nome e avatar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
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

                  {editingProfileId === prof.id && (
                    <form
                      onSubmit={handleSaveEdit}
                      className="mt-1 rounded-xl bg-white border border-indigo-200 p-3 flex flex-col gap-2.5"
                    >
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nome da criança"
                        required
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:outline-none"
                      />
                      <div className="flex flex-wrap items-center gap-1.5">
                        {AVATAR_OPTIONS.map((av) => (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setEditAvatar(av.id)}
                            className={`rounded-full p-0.5 border-2 cursor-pointer ${
                              editAvatar === av.id ? 'border-indigo-600 scale-105' : 'border-transparent'
                            }`}
                          >
                            <AvatarSvg avatar={av.id} size={36} />
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingProfileId(null)}
                          className="rounded-lg px-3 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer"
                        >
                          Salvar
                        </button>
                      </div>
                    </form>
                  )}
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
            Nível atual:{' '}
            {activeProfile.ageLevel === '3-4' ? '3–4 anos (Exploradores)' : '5–6 anos (Descobridores)'}
            {' • '}
            Idioma:{' '}
            {(activeProfile.preferredLanguage || 'en') === 'en' ? 'Inglês (EN)' : 'Espanhol (ES)'}
          </p>

          {/* Pedagogical Summary */}
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-amber-800 shrink-0">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold uppercase tracking-wide text-amber-700">
                  Pilar Favorito
                </div>
                <div className="font-display text-base font-bold text-slate-800 truncate">
                  {favoritePillar.stat.starsEarned > 0
                    ? `${favoritePillar.pillar.title} (${favoritePillar.stat.starsEarned} ★)`
                    : 'Comece a jogar!'}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-200 text-indigo-800 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold uppercase tracking-wide text-indigo-700">
                  Sugestão para Praticar
                </div>
                <div className="font-display text-base font-bold text-slate-800 truncate">
                  {practiceSuggestion.pillar.title}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-orange-50 border border-orange-200 p-3.5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-200 text-orange-800 shrink-0">
                <Flame className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold uppercase tracking-wide text-orange-700">
                  Dias Brincando
                </div>
                <div className="font-display text-base font-bold text-slate-800 truncate">
                  {activeProfile.streakDays || 0}{' '}
                  {(activeProfile.streakDays || 0) === 1 ? 'dia seguido' : 'dias seguidos'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PILLARS.map((pillar) => {
              const stat = activeProfile.stats[pillar.id];
              const pct = Math.round((stat.completedRounds / maxRounds) * 100);
              return (
                <div
                  key={pillar.id}
                  className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display text-base font-bold text-slate-800 truncate">
                      {pillar.title}
                    </div>
                    {stat.lastPlayedAt && (
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {new Date(stat.lastPlayedAt).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${stat.completedRounds > 0 ? Math.max(10, pct) : 0}%`,
                        backgroundColor: pillar.borderColor,
                      }}
                    />
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
          {/* Recent Activity History */}
          {(activeProfile.recentHistory || []).length > 0 && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h3 className="font-display text-sm font-bold text-slate-700 flex items-center gap-1.5 mb-2.5">
                <History className="h-4 w-4 text-indigo-500" />
                Atividades Recentes
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {(activeProfile.recentHistory || []).slice(0, 6).map((entry, idx) => {
                  const pMeta = PILLARS.find((p) => p.id === entry.pillar);
                  return (
                    <div
                      key={`${entry.completedAt}-${idx}`}
                      className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                    >
                      <span className="truncate">{pMeta?.title || entry.pillar}</span>
                      <span className="shrink-0 text-amber-600">
                        +{entry.starsEarned} ★ •{' '}
                        {new Date(entry.completedAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Screen Time & Gentle Break */}
        <section className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h2 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-600" />
              Tempo de Tela (Hora da Pausa com a Lumi)
            </h2>
            <span className="text-xs font-extrabold text-indigo-600">
              Hoje: {Math.floor((state.screenTime?.usedSecondsToday || 0) / 60)} min
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Quando o tempo diário acabar, a Lumi aparece com soninho convidando a criança para descansar.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {[
              { label: 'Sem limite', mins: 0 },
              { label: '15 min', mins: 15 },
              { label: '30 min', mins: 30 },
              { label: '45 min', mins: 45 },
              { label: '60 min', mins: 60 },
            ].map((opt) => {
              const active = (state.screenTime?.limitMinutes || 0) === opt.mins;
              return (
                <button
                  key={opt.mins}
                  type="button"
                  onClick={() => updateScreenTimeLimit(opt.mins)}
                  className={`rounded-xl py-2.5 text-xs font-extrabold border-2 cursor-pointer transition-colors ${
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
        </section>

        {/* Full Offline Mode (PWA Audio Download) */}
        <section className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2 mb-1">
            <WifiOff className="h-5 w-5 text-emerald-600" />
            Modo Offline Total (Viagens sem Internet)
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Baixe todos os clipes de voz neural da Lumi de uma só vez para usar o EduKids sem Wi-Fi ou 4G.
          </p>
          <button
            type="button"
            disabled={offlineProgress?.running}
            onClick={handleDownloadAllOfflineAudio}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            {offlineProgress?.running ? 'Baixando áudios...' : 'Baixar Todos os Áudios Offline'}
          </button>
          {offlineProgress && (
            <div className="mt-3">
              {offlineProgress.total > 0 && (
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${Math.round((offlineProgress.done / offlineProgress.total) * 100)}%`,
                    }}
                  />
                </div>
              )}
              <p className="text-xs font-bold text-slate-600">{offlineProgress.status}</p>
            </div>
          )}
        </section>

        {/* Backup & Restore */}
        <section className="rounded-3xl bg-white p-5 border border-slate-200 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-800 mb-1">
            Backup de Perfis e Progresso
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Salve ou restaure estrelas, figurinhas e perfis em outro celular ou navegador.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              Exportar Backup (.json)
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-xl bg-slate-100 border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Importar Backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </div>

          {backupMessage && (
            <p
              className={`mt-3 text-sm font-bold ${
                backupMessage.kind === 'ok' ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {backupMessage.text}
            </p>
          )}
        </section>
      </main>
    </div>
  );
};
