import React, { useState } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Modal } from './Modal';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function OnboardingModal({ isOpen, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  const onboardingSteps = [
    {
      title: "Bem-vindo ao CardFix!",
      content: "Vamos guiá-lo rapidamente pelas principais funcionalidades para turbinar seus estudos."
    },
    {
      title: "1. Crie seu Concurso",
      content: "Clique em 'Novo Concurso', preencha os dados e faça o upload do seu edital. Nossa IA fará a leitura para você."
    },
    {
      title: "2. Gere seu Plano de Estudos",
      content: "Após criar o concurso, a IA irá sugerir a geração de uma estrutura completa de matérias e tópicos baseada no seu edital."
    },
    {
      title: "3. Crie Flashcards com um Clique",
      content: "Selecione qualquer tópico e clique em 'Gerar Flashcards'. A IA criará cards de alta qualidade para você estudar."
    },
    {
      title: "4. Estude com Repetição Espaçada",
      content: "Revise seus cards diariamente. Avalie sua resposta e nosso algoritmo agendará a próxima revisão no momento ideal."
    }
  ];

  const handleNext = () => {
    if (step < onboardingSteps.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onComplete} title={onboardingSteps[step].title}>
      <div className="min-h-[150px]">
        <p className="text-slate-300">{onboardingSteps[step].content}</p>
      </div>
      
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-slate-400">
          Passo {step + 1} de {onboardingSteps.length}
        </div>
        
        <div className="flex items-center gap-4">
          {step > 0 && (
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg flex items-center"
          >
            {step === onboardingSteps.length - 1 ? 'Concluir' : 'Próximo'}
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>
      </div>
    </Modal>
  );
}
