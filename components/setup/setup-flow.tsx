'use client';
import { useState } from 'react';
import { ArrowLeft, Check, Sparkles, Wand2, X } from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import { defaultRoutines } from '@/lib/catalog';
import { uid } from '@/lib/metrics';
import { proposals as planProposals, type DaysPerWeek, type Proposal } from '@/lib/planner';
import type { Profile, Routine } from '@/lib/types';
import OwnRoutineWizard from './own-routine-wizard';
import {
  NameStep,
  ProposalCard,
  QUIZ_ORDER,
  QuizStep,
  StepBlock,
  WeekPreview,
  quizFromProfile,
  quizToInput,
  type QuizState,
} from './steps';

export interface SetupResult {
  name?: string;
  profile: Partial<Profile>;
  routines: Routine[];
}

type Step = 'name' | 'choice' | 'own' | 'quiz' | 'proposals' | 'preview';

/**
 * Arranque guiado. `first`: cuenta nueva (pide el nombre, ofrece «Más tarde»). `relaunch`: desde Entrenar
 * (empieza en «¿Ya tienes rutina?», ofrece «Cancelar»). Solo escribe al final, mediante `onFinish`.
 */
export default function SetupFlow({
  mode,
  profile,
  onFinish,
  onLater,
  onCancel,
  onOpenDetail,
}: {
  mode: 'first' | 'relaunch';
  profile: Profile;
  onFinish: (result: SetupResult) => void;
  onLater: (name?: string) => void;
  onCancel: () => void;
  onOpenDetail: (exerciseId: string) => void;
}) {
  const [step, setStep] = useState<Step>(mode === 'first' ? 'name' : 'choice');
  const [name, setName] = useState<string | undefined>(undefined);
  const [quiz, setQuiz] = useState<QuizState>(() => quizFromProfile(profile));
  const [quizIndex, setQuizIndex] = useState(0);
  const [list, setList] = useState<Proposal[]>([]);
  const [chosen, setChosen] = useState<Proposal | null>(null);

  const quizKey = QUIZ_ORDER[quizIndex];
  const quizAnswered =
    quizKey === 'limitations' ? true : quizKey === 'days' ? quiz.days !== null : quiz[quizKey] !== null;

  const finishWith = (routines: Routine[], extra: Partial<Profile> = {}) =>
    onFinish({ name, profile: extra, routines });

  const quizProfile = (
    input: NonNullable<ReturnType<typeof quizToInput>>,
    days: DaysPerWeek
  ): Partial<Profile> => ({
    goal: input.goal,
    daysPerWeek: days,
    experience: input.experience,
    sessionMinutes: input.sessionMinutes,
    kit: input.kit,
    limitations: input.limitations,
  });

  const goBack = () => {
    switch (step) {
      case 'choice':
        if (mode === 'first') setStep('name');
        break;
      case 'quiz':
        if (quizIndex === 0) setStep('choice');
        else setQuizIndex(quizIndex - 1);
        break;
      case 'proposals':
        setStep('quiz');
        break;
      case 'preview':
        setStep('proposals');
        break;
      default:
        break;
    }
  };
  const canGoBack =
    step === 'quiz' || step === 'proposals' || step === 'preview' || (step === 'choice' && mode === 'first');
  const progress =
    step === 'name'
      ? 0
      : step === 'choice'
        ? 1
        : step === 'quiz'
          ? 2 + quizIndex
          : step === 'proposals'
            ? 8
            : step === 'preview'
              ? 9
              : 2;
  const total = step === 'own' ? 0 : 10;

  return (
    <main className="setup-screen" aria-labelledby="setup-title">
      <div className="setup-card">
        <header className="setup-top">
          {canGoBack ? (
            <button type="button" className="icon-action" onClick={goBack} aria-label="Atrás">
              <ArrowLeft size={20} />
            </button>
          ) : (
            <span className="setup-brand" aria-hidden="true">
              RB
            </span>
          )}
          <span className="sr-only" id="setup-title">
            Arranque guiado
          </span>
          {total > 0 && (
            <ol className="setup-dots" aria-label={`Paso ${progress + 1} de ${total}`}>
              {Array.from({ length: total }, (_, i) => (
                <li key={i} className={i <= progress ? 'on' : ''} />
              ))}
            </ol>
          )}
          <div className="setup-top-actions">
            <ThemeToggle />
            {mode === 'first' ? (
              <button type="button" className="text-link" onClick={() => onLater(name)}>
                Más tarde
              </button>
            ) : (
              <button type="button" className="icon-action" onClick={onCancel} aria-label="Cancelar">
                <X size={20} />
              </button>
            )}
          </div>
        </header>

        {step === 'name' && (
          <NameStep
            initial={name ?? profile.name}
            onNext={(value) => {
              setName(value);
              setStep('choice');
            }}
          />
        )}

        {step === 'choice' && (
          <StepBlock title={`${name ? `${name}, ` : ''}¿ya tienes una rutina?`}>
            <div className="setup-choices">
              <button type="button" className="setup-choice" onClick={() => setStep('own')}>
                <Check size={20} aria-hidden="true" />
                <span>
                  <strong>Sí, la paso a RB</strong>
                  <small>Día por día, con los ejercicios del catálogo.</small>
                </span>
              </button>
              <button
                type="button"
                className="setup-choice setup-choice-primary"
                onClick={() => {
                  setQuizIndex(0);
                  setStep('quiz');
                }}
              >
                <Wand2 size={20} aria-hidden="true" />
                <span>
                  <strong>No, propónme una</strong>
                  <small>Seis preguntas y te propongo dos o tres ciclos.</small>
                </span>
              </button>
              <button
                type="button"
                className="setup-choice"
                onClick={() => finishWith(structuredClone(defaultRoutines))}
              >
                <Sparkles size={20} aria-hidden="true" />
                <span>
                  <strong>Empezar con el ciclo de ejemplo</strong>
                  <small>5 días con descanso, máquinas; se puede cambiar todo después.</small>
                </span>
              </button>
            </div>
          </StepBlock>
        )}

        {step === 'own' && (
          <OwnRoutineWizard
            goal={quiz.goal ?? profile.goal}
            experience={quiz.experience ?? profile.experience ?? 'intermediate'}
            onCreate={(week, days) => finishWith(week, { daysPerWeek: days })}
            onOpenDetail={onOpenDetail}
            onBackToChoice={() => setStep('choice')}
          />
        )}

        {step === 'quiz' && (
          <>
            <QuizStep step={quizKey} quiz={quiz} onChange={setQuiz} />
            <div className="setup-actions">
              <button
                type="button"
                className="lime-btn"
                disabled={!quizAnswered}
                onClick={() => {
                  if (quizIndex + 1 < QUIZ_ORDER.length) {
                    setQuizIndex(quizIndex + 1);
                    return;
                  }
                  const input = quizToInput(quiz);
                  if (!input) return;
                  setList(planProposals(input, uid));
                  setStep('proposals');
                }}
              >
                {quizIndex + 1 < QUIZ_ORDER.length ? 'Continuar' : 'Ver propuestas'}
              </button>
            </div>
          </>
        )}

        {step === 'proposals' && (
          <StepBlock
            title="Esto es lo que te propongo"
            hint="Toca una para ver cada día. Todo se puede editar después."
          >
            <div className="proposal-list">
              {list.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onOpen={() => {
                    setChosen(proposal);
                    setStep('preview');
                  }}
                />
              ))}
            </div>
            <p className="setup-disclaimer">
              No sustituye el consejo de un profesional. Si tienes una lesión, consúltalo antes.
            </p>
          </StepBlock>
        )}

        {step === 'preview' && chosen && (
          <StepBlock title={chosen.title} hint={chosen.why}>
            <WeekPreview week={chosen.week} onOpenDetail={onOpenDetail} />
            <div className="setup-actions setup-actions-sticky">
              <button
                type="button"
                className="lime-btn"
                onClick={() => {
                  const input = quizToInput(quiz);
                  finishWith(chosen.week, input ? quizProfile(input, chosen.daysPerWeek) : {});
                }}
              >
                <Check size={17} aria-hidden="true" /> Usar este ciclo
              </button>
            </div>
          </StepBlock>
        )}
      </div>
    </main>
  );
}
