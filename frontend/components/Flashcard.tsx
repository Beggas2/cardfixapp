import React from 'react';
import { ThumbsDown, Brain, ThumbsUp } from 'lucide-react';
import type { Flashcard as FlashcardType } from '~backend/study/types';
import type { CardStatus } from '~backend/study/types';

interface FlashcardProps {
  card: FlashcardType;
  isFlipped: boolean;
  onFlip: () => void;
  onRate: (rating: CardStatus) => void;
}

export function Flashcard({ card, isFlipped, onFlip, onRate }: FlashcardProps) {
  return (
    <>
      <style>{`
        .flashcard { perspective: 1000px; }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.7s;
          transform-style: preserve-3d;
        }
        .flashcard.flipped .flashcard-inner {
          transform: rotateY(180deg);
        }
        .flashcard-front, .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          transition: box-shadow 0.3s, border-color 0.3s;
        }
        .flashcard-back {
          transform: rotateY(180deg);
        }
      `}</style>
      
      <div className={`w-full h-72 cursor-pointer group flashcard ${isFlipped ? 'flipped' : ''}`}>
        <div className="flashcard-inner">
          {/* Front of card */}
          <div 
            className="flashcard-front bg-slate-700 rounded-xl shadow-lg flex flex-col justify-center items-center p-6 text-center border-2 border-slate-600"
            onClick={!isFlipped ? onFlip : undefined}
          >
            <p className="text-slate-400 text-sm mb-2">Pergunta</p>
            <p className="text-white text-lg font-semibold">{card.question}</p>
            <span className="absolute bottom-4 text-xs text-slate-500 group-hover:text-cyan-400">
              Clique para ver a resposta
            </span>
          </div>

          {/* Back of card */}
          <div className="flashcard-back bg-cyan-900 rounded-xl shadow-lg flex flex-col justify-between items-center p-6 text-center border-2 border-cyan-700">
            <div>
              <p className="text-cyan-300 text-sm mb-2">Resposta</p>
              <p className="text-white text-md">{card.answer}</p>
            </div>
            
            <div className="w-full flex justify-around items-center mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate('WRONG');
                }}
                className="flex flex-col items-center text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20"
              >
                <ThumbsDown className="h-6 w-6" />
                <span className="text-xs mt-1">Errei</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate('DIFFICULT');
                }}
                className="flex flex-col items-center text-yellow-400 hover:text-yellow-300 p-2 rounded-lg hover:bg-yellow-500/20"
              >
                <Brain className="h-6 w-6" />
                <span className="text-xs mt-1">Difícil</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRate('GOOD');
                }}
                className="flex flex-col items-center text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-500/20"
              >
                <ThumbsUp className="h-6 w-6" />
                <span className="text-xs mt-1">Bom</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
