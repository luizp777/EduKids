import type { ColorId, FigureId, ForeignLanguage } from '../types';

/** Traduções das 36 figuras do catálogo para Inglês e Espanhol. */
export const FIGURE_TRANSLATIONS: Record<FigureId, Record<ForeignLanguage, string>> = {
  abelha: { en: 'Bee', es: 'Abeja' },
  elefante: { en: 'Elephant', es: 'Elefante' },
  ilha: { en: 'Island', es: 'Isla' },
  ovelha: { en: 'Sheep', es: 'Oveja' },
  urso: { en: 'Bear', es: 'Oso' },
  bola: { en: 'Ball', es: 'Pelota' },
  casa: { en: 'House', es: 'Casa' },
  dado: { en: 'Dice', es: 'Dado' },
  flor: { en: 'Flower', es: 'Flor' },
  gato: { en: 'Cat', es: 'Gato' },
  lua: { en: 'Moon', es: 'Luna' },
  maca: { en: 'Apple', es: 'Manzana' },
  nuvem: { en: 'Cloud', es: 'Nube' },
  pato: { en: 'Duck', es: 'Pato' },
  sapo: { en: 'Frog', es: 'Rana' },
  sol: { en: 'Sun', es: 'Sol' },
  peixe: { en: 'Fish', es: 'Pez' },
  morango: { en: 'Strawberry', es: 'Fresa' },
  banana: { en: 'Banana', es: 'Plátano' },
  borboleta: { en: 'Butterfly', es: 'Mariposa' },
  carro: { en: 'Car', es: 'Coche' },
  foguete: { en: 'Rocket', es: 'Cohete' },
  rato: { en: 'Mouse', es: 'Ratón' },
  pao: { en: 'Bread', es: 'Pan' },
  mao: { en: 'Hand', es: 'Mano' },
  uva: { en: 'Grape', es: 'Uva' },
  arvore: { en: 'Tree', es: 'Árbol' },
  estrela: { en: 'Star', es: 'Estrella' },
  cachorro: { en: 'Dog', es: 'Perro' },
  leao: { en: 'Lion', es: 'León' },
  passaro: { en: 'Bird', es: 'Pájaro' },
  tartaruga: { en: 'Turtle', es: 'Tortuga' },
  aviao: { en: 'Airplane', es: 'Avión' },
  livro: { en: 'Book', es: 'Libro' },
  arcoiris: { en: 'Rainbow', es: 'Arcoíris' },
  melancia: { en: 'Watermelon', es: 'Sandía' },
};

/** Traduções das 6 cores principais para Inglês e Espanhol. */
export const COLOR_TRANSLATIONS: Record<ColorId, Record<ForeignLanguage, string>> = {
  vermelho: { en: 'Red', es: 'Rojo' },
  azul: { en: 'Blue', es: 'Azul' },
  amarelo: { en: 'Yellow', es: 'Amarillo' },
  verde: { en: 'Green', es: 'Verde' },
  laranja: { en: 'Orange', es: 'Naranja' },
  roxo: { en: 'Purple', es: 'Morado' },
};

/** Traduções dos números de 1 a 10 para Inglês e Espanhol. */
export const NUMBER_TRANSLATIONS: Record<number, Record<ForeignLanguage, string>> = {
  1: { en: 'One', es: 'Uno' },
  2: { en: 'Two', es: 'Dos' },
  3: { en: 'Three', es: 'Tres' },
  4: { en: 'Four', es: 'Cuatro' },
  5: { en: 'Five', es: 'Cinco' },
  6: { en: 'Six', es: 'Seis' },
  7: { en: 'Seven', es: 'Siete' },
  8: { en: 'Eight', es: 'Ocho' },
  9: { en: 'Nine', es: 'Nueve' },
  10: { en: 'Ten', es: 'Diez' },
};

/** Identificador de cumprimento ou expressão cotidiana no pilar de Idiomas. */
export type GreetingId =
  | 'hello'
  | 'good-morning'
  | 'good-night'
  | 'thank-you'
  | 'bye'
  | 'friend';

/** Metadados de um cumprimento ilustrado em português, inglês e espanhol. */
export interface GreetingItem {
  /** Identificador único do cumprimento. */
  id: GreetingId;
  /** Rótulo em português. */
  ptLabel: string;
  /** Tradução em inglês e espanhol. */
  translations: Record<ForeignLanguage, string>;
  /** Figura SVG ilustrativa associada à situação. */
  figureId: FigureId;
  /** Cor de destaque do cartão. */
  bgHex: string;
}

/** Catálogo dos 6 cumprimentos e expressões do dia a dia do pilar de Idiomas. */
export const GREETINGS: GreetingItem[] = [
  {
    id: 'hello',
    ptLabel: 'Olá!',
    translations: { en: 'Hello!', es: '¡Hola!' },
    figureId: 'mao',
    bgHex: '#FFE8CC',
  },
  {
    id: 'good-morning',
    ptLabel: 'Bom dia!',
    translations: { en: 'Good morning!', es: '¡Buenos días!' },
    figureId: 'sol',
    bgHex: '#FFF3BF',
  },
  {
    id: 'good-night',
    ptLabel: 'Boa noite!',
    translations: { en: 'Good night!', es: '¡Buenas noches!' },
    figureId: 'lua',
    bgHex: '#E5DBFF',
  },
  {
    id: 'thank-you',
    ptLabel: 'Obrigado!',
    translations: { en: 'Thank you!', es: '¡Gracias!' },
    figureId: 'flor',
    bgHex: '#FFD8E4',
  },
  {
    id: 'bye',
    ptLabel: 'Tchau!',
    translations: { en: 'Goodbye!', es: '¡Adiós!' },
    figureId: 'aviao',
    bgHex: '#D0EBFF',
  },
  {
    id: 'friend',
    ptLabel: 'Amigo!',
    translations: { en: 'Friend!', es: '¡Amigo!' },
    figureId: 'cachorro',
    bgHex: '#D3F9D8',
  },
];

/** Frase curta ilustrada para prática auditiva (Listening) em Inglês e Espanhol. */
export interface ShortPhraseItem {
  /** Identificador único da frase curta. */
  id: string;
  /** Figura SVG principal da frase. */
  figureId: FigureId;
  /** Cor associada à figura na frase. */
  colorId: ColorId;
  /** Tradução/legenda em português exibida no cartão. */
  ptLabel: string;
  /** Texto da frase em inglês (`en`) e espanhol (`es`). */
  translations: Record<ForeignLanguage, string>;
  /** Cor hexadecimal de fundo do cartão ilustrado. */
  bgHex: string;
}

/** Catálogo de 6 frases curtas (cor + figura) para o modo Listening em EN e ES. */
export const SHORT_PHRASES: ShortPhraseItem[] = [
  {
    id: 'red-apple',
    figureId: 'maca',
    colorId: 'vermelho',
    ptLabel: 'A maçã vermelha',
    translations: { en: 'The red apple', es: 'La manzana roja' },
    bgHex: '#FFE3E3',
  },
  {
    id: 'yellow-sun',
    figureId: 'sol',
    colorId: 'amarelo',
    ptLabel: 'O sol amarelo',
    translations: { en: 'The yellow sun', es: 'El sol amarillo' },
    bgHex: '#FFF3BF',
  },
  {
    id: 'blue-bird',
    figureId: 'passaro',
    colorId: 'azul',
    ptLabel: 'O pássaro azul',
    translations: { en: 'The blue bird', es: 'El pájaro azul' },
    bgHex: '#D0EBFF',
  },
  {
    id: 'green-frog',
    figureId: 'sapo',
    colorId: 'verde',
    ptLabel: 'O sapo verde',
    translations: { en: 'The green frog', es: 'La rana verde' },
    bgHex: '#D3F9D8',
  },
  {
    id: 'orange-cat',
    figureId: 'gato',
    colorId: 'laranja',
    ptLabel: 'O gato laranja',
    translations: { en: 'The orange cat', es: 'El gato naranja' },
    bgHex: '#FFE8CC',
  },
  {
    id: 'purple-flower',
    figureId: 'flor',
    colorId: 'roxo',
    ptLabel: 'A flor roxa',
    translations: { en: 'The purple flower', es: 'La flor morada' },
    bgHex: '#F3D9FA',
  },
];
