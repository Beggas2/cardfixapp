import React, { useState, useEffect } from 'react';
import { Trash2, ListTree, Wand2, Bot, CheckCircle, BookOpen } from 'lucide-react';
import type { Contest } from '~backend/contests/types';
import type { StudyPlanResponse } from '~backend/study/types';
import { useAuth } from '../hooks/useAuth';
import { ConfirmationModal } from './ConfirmationModal';
import { StudySession } from './StudySession';

interface ContestViewProps {
  contest: Contest;
  onContestDeleted: (contestId: string) => void;
}

export function ContestView({ contest, onContestDeleted }: ContestViewProps) {
  const { getAuthenticatedBackend } = useAuth();
  const [studyPlan, setStudyPlan] = useState<StudyPlanResponse | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [error, setError] = useState('');
  const [activeSubtopic, setActiveSubtopic] = useState<any>(null);

  useEffect(() => {
    loadStudyPlan();
  }, [contest.id]);

  const loadStudyPlan = async () => {
    try {
      const backend = getAuthenticatedBackend();
      const response = await backend.study.getPlan({ contestId: contest.id });
      setStudyPlan(response);
    } catch (error: any) {
      if (error.message?.includes('not found')) {
        setStudyPlan(null);
      } else {
        console.error('Failed to load study plan:', error);
      }
    }
  };

  const handleGeneratePlan = async () => {
    if (!contest.editalText) return;
    
    setIsProcessing(true);
    setProcessingStatus('Gerando estrutura do plano...');
    setError('');

    try {
      const backend = getAuthenticatedBackend();
      
      // Generate plan structure with AI
      const planResponse = await backend.ai.generatePlan({
        editalText: contest.editalText,
        role: contest.role,
      });

      // Create the plan in the database
      await backend.study.createPlan({
        contestId: contest.id,
        subjects: planResponse.subjects.map(subject => ({
          name: subject.name,
          order: subject.order,
          topics: subject.topics.map(topic => ({
            name: topic.name,
            order: topic.order,
            subtopics: topic.subtopics.map(subtopic => ({
              name: subtopic.name,
              order: subtopic.order,
            })),
          })),
        })),
      });

      await loadStudyPlan();
    } catch (error: any) {
      setError(error.message || 'Falha ao gerar plano de estudos');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleEstimateCards = async () => {
    if (!studyPlan) return;

    setIsProcessing(true);
    setProcessingStatus('Estimando flashcards...');
    setError('');

    try {
      const backend = getAuthenticatedBackend();
      
      const estimatesResponse = await backend.ai.estimateCards({
        subjects: studyPlan.subjects,
      });

      // Update estimates in database
      const estimates = estimatesResponse.subjects.flatMap(subject =>
        subject.topics.flatMap(topic =>
          topic.subtopics.map(subtopic => ({
            subtopicId: subtopic.id,
            estimatedCount: subtopic.estimatedCount || 0,
          }))
        )
      );

      await backend.study.updateEstimates({
        contestId: contest.id,
        estimates,
      });

      await loadStudyPlan();
    } catch (error: any) {
      setError(error.message || 'Falha ao estimar flashcards');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleGenerateFlashcards = async (subject: any, topic: any, subtopic: any) => {
    setIsProcessing(true);
    setProcessingStatus(`Gerando flashcards para ${subtopic.name}...`);
    setError('');

    try {
      const backend = getAuthenticatedBackend();
      
      const flashcardsResponse = await backend.ai.generateFlashcards({
        subjectName: subject.name,
        topicName: topic.name,
        subtopicName: subtopic.name,
        quantity: subtopic.estimatedCount || 10,
      });

      await backend.study.generateFlashcards({
        subtopicId: subtopic.id,
        flashcards: flashcardsResponse.flashcards,
      });

    } catch (error: any) {
      setError(error.message || 'Falha ao gerar flashcards');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const handleDeleteContest = async () => {
    try {
      const backend = getAuthenticatedBackend();
      await backend.contests.deleteContest({ id: contest.id });
      onContestDeleted(contest.id);
    } catch (error: any) {
      setError(error.message || 'Falha ao deletar concurso');
    }
    setIsDeleteModalOpen(false);
  };

  const contestPhase = (() => {
    if (!studyPlan || studyPlan.subjects.length === 0) return 'NEEDS_PLAN';
    const hasEstimates = studyPlan.subjects.some(s => 
      s.topics.some(t => 
        t.subtopics.some(st => st.estimatedCount > 0)
      )
    );
    if (!hasEstimates) return 'NEEDS_ESTIMATES';
    return 'READY';
  })();

  if (activeSubtopic) {
    return (
      <StudySession
        contest={contest}
        subtopic={activeSubtopic}
        onBack={() => setActiveSubtopic(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{contest.name}</h2>
          <p className="text-slate-400 text-sm">Cargo: {contest.role}</p>
        </div>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-full"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {contestPhase === 'NEEDS_PLAN' && (
        <div className="text-center bg-slate-800/50 p-10 rounded-2xl">
          <ListTree className="h-16 w-16 mx-auto text-cyan-500 mb-4" />
          <h3 className="text-2xl font-bold text-white">Gerar Plano de Estudo</h3>
          <p className="text-slate-400 mt-2 mb-6 max-w-xl mx-auto">
            Vamos usar a IA para criar uma lista de matérias e tópicos com base no edital.
          </p>
          <button
            onClick={handleGeneratePlan}
            disabled={isProcessing}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center mx-auto"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {processingStatus}
              </>
            ) : (
              'Gerar Estrutura'
            )}
          </button>
        </div>
      )}

      {contestPhase === 'NEEDS_ESTIMATES' && (
        <div className="text-center bg-slate-800/50 p-10 rounded-2xl">
          <Wand2 className="h-16 w-16 mx-auto text-cyan-500 mb-4" />
          <h3 className="text-2xl font-bold text-white">Estimar Flashcards</h3>
          <p className="text-slate-400 mt-2 mb-6 max-w-xl mx-auto">
            Agora, a IA irá estimar a quantidade ideal de flashcards para cada subtópico do seu plano.
          </p>
          <button
            onClick={handleEstimateCards}
            disabled={isProcessing}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center mx-auto"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {processingStatus}
              </>
            ) : (
              'Estimar Quantidades'
            )}
          </button>
        </div>
      )}

      {contestPhase === 'READY' && studyPlan && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Matérias e Tópicos</h3>
          
          {studyPlan.subjects.map(subject => (
            <div key={subject.id} className="bg-slate-800/50 rounded-xl p-4">
              <h4 className="font-bold text-lg text-cyan-400 mb-3">
                {subject.name}
              </h4>
              
              {subject.topics.map(topic => (
                <div key={topic.id} className="mb-4">
                  <h5 className="font-semibold text-slate-300 px-2 pt-2">
                    {topic.name}
                  </h5>
                  
                  <ul className="space-y-1 p-1">
                    {topic.subtopics.map(subtopic => (
                      <li
                        key={subtopic.id}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-slate-700/50 group"
                      >
                        <button
                          onClick={() => setActiveSubtopic({ ...subtopic, subject, topic })}
                          className="text-left flex-grow text-slate-300 hover:text-white"
                        >
                          {subtopic.name}
                        </button>
                        
                        {subtopic.estimatedCount > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500">
                              {subtopic.estimatedCount} cards
                            </span>
                            <button
                              onClick={() => handleGenerateFlashcards(subject, topic, subtopic)}
                              disabled={isProcessing}
                              title={`Gerar ${subtopic.estimatedCount} flashcards`}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-cyan-400 hover:text-cyan-300 disabled:text-slate-500"
                            >
                              {isProcessing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                              ) : (
                                <Bot size={16} />
                              )}
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteContest}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este concurso? Todos os seus dados, incluindo matérias e flashcards, serão perdidos permanentemente."
      />
    </div>
  );
}
