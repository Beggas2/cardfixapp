import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, ThumbsDown, Brain, ThumbsUp } from 'lucide-react';
import type { Contest } from '~backend/contests/types';
import type { TodaysCardsResponse, CardStatus } from '~backend/study/types';
import { useAuth } from '../hooks/useAuth';
import { Flashcard } from './Flashcard';

interface StudySessionProps {
  contest: Contest;
  subtopic: any;
  onBack: () => void;
}

export function StudySession({ contest, subtopic, onBack }: StudySessionProps) {
  const { getAuthenticatedBackend } = useAuth();
  const [cards, setCards] = useState<TodaysCardsResponse['cards']>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    difficult: 0,
    wrong: 0,
  });

  useEffect(() => {
    loadTodaysCards();
  }, []);

  const loadTodaysCards = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const response = await backend.study.getTodaysCards({
        contestId: contest.id,
        subtopicId: subtopic.id,
      });
      setCards(response.cards);
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateCard = async (rating: CardStatus) => {
    const currentCard = cards[currentCardIndex];
    if (!currentCard) return;

    try {
      const backend = getAuthenticatedBackend();
      await backend.study.reviewCard({
        flashcardId: currentCard.flashcardId,
        rating,
      });

      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        [rating === 'GOOD' ? 'correct' : rating === 'DIFFICULT' ? 'difficult' : 'wrong']: 
          prev[rating === 'GOOD' ? 'correct' : rating === 'DIFFICULT' ? 'difficult' : 'wrong'] + 1
      }));

      // Add points for gamification
      let points = 0;
      let reason = 'card_reviewed';
      
      if (rating === 'GOOD') {
        points = 10;
        reason = 'correct_answer';
      } else if (rating === 'DIFFICULT') {
        points = 5;
      } else {
        points = 1;
      }

      await backend.gamification.addPoints({ points, reason });

      // Move to next card or finish session
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
      } else {
        // Session complete - add daily study bonus
        await backend.gamification.addPoints({ 
          points: 20, 
          reason: 'daily_study',
          metadata: { subtopicId: subtopic.id }
        });
        onBack();
      }
    } catch (error) {
      console.error('Failed to rate card:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div>
        <button
          onClick={onBack}
          className="flex items-center text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>
        
        <div className="text-center bg-slate-800/50 p-10 rounded-2xl">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-2xl font-bold text-white">Tudo em dia!</h3>
          <p className="text-slate-400 mt-2">
            Não há cards para revisar neste subtópico hoje.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </button>
        
        <div className="text-slate-400">
          {currentCardIndex + 1} de {cards.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Progresso da Sessão</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-500/10 rounded-lg p-3 text-center">
          <div className="text-green-400 font-bold text-lg">{sessionStats.correct}</div>
          <div className="text-green-300 text-sm">Acertos</div>
        </div>
        <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
          <div className="text-yellow-400 font-bold text-lg">{sessionStats.difficult}</div>
          <div className="text-yellow-300 text-sm">Difíceis</div>
        </div>
        <div className="bg-red-500/10 rounded-lg p-3 text-center">
          <div className="text-red-400 font-bold text-lg">{sessionStats.wrong}</div>
          <div className="text-red-300 text-sm">Erros</div>
        </div>
      </div>

      <h3 className="text-2xl font-bold text-white mb-6">
        {subtopic.name}
      </h3>

      <div className="max-w-2xl mx-auto">
        <Flashcard
          card={currentCard.flashcard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          onRate={handleRateCard}
        />
      </div>
    </div>
  );
}
