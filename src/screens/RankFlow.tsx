import { useState, type ReactNode } from 'react';
import { Frown, Heart, Meh, Undo2, X } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ComparisonCards } from '../components/ComparisonCards';
import { getPlace } from '../lib/data';
import { useMyRank } from '../lib/hooks';
import {
  answer,
  currentMid,
  expectedComparisons,
  insertPosition,
  startInsert,
  undo,
  type Answer,
  type InsertState,
} from '../lib/ranking';
import { formatScore } from '../lib/scores';
import { isRanked, useStore } from '../lib/store';
import { TIER_SHORT, type Place, type Sentiment } from '../lib/types';
import { NotFound } from './NotFound';

// Leaving partway commits nothing: the place stays collected but unranked (section 5).

type Step =
  | { kind: 'sentiment' }
  | { kind: 'compare'; sentiment: Sentiment; group: string[]; state: InsertState }
  | { kind: 'result' };

const SENTIMENT_OPTIONS: { value: Sentiment; label: string; icon: ReactNode }[] = [
  { value: 'loved', label: 'Loved it', icon: <Heart size={26} color="var(--water-deep)" /> },
  { value: 'okay', label: 'It was okay', icon: <Meh size={26} color="var(--ink-muted)" /> },
  { value: 'disliked', label: "Didn't like it", icon: <Frown size={26} color="var(--ink-muted)" /> },
];

export function RankFlow() {
  const { id } = useParams();
  const place = getPlace(id);
  if (!place) return <NotFound />;
  return <Rank key={place.id} place={place} />;
}

function Rank({ place }: { place: Place }) {
  const navigate = useNavigate();
  const collected = useStore((s) => !!s.collections[place.id]);
  const ranking = useStore((s) => s.rankings[place.tier]);
  const ranked = useStore((s) => isRanked(s.rankings, place.tier, place.id));
  const rank = useStore((s) => s.rank);
  const myRank = useMyRank(place);
  const [step, setStep] = useState<Step>({ kind: 'sentiment' });

  if (!collected) return <Navigate to={`/place/${place.id}`} replace />;
  // Re-ranking is out of scope for Demo 4.
  if (ranked && step.kind !== 'result') return <Navigate to={`/place/${place.id}`} replace />;

  const commit = (sentiment: Sentiment, state: InsertState) => {
    // Show the result before the store marks the place ranked, so the redirect above doesn't fire.
    setStep({ kind: 'result' });
    rank(place.id, place.tier, sentiment, insertPosition(state));
  };

  const chooseSentiment = (sentiment: Sentiment) => {
    const group = ranking.groups[sentiment].filter((pid) => pid !== place.id);
    const state = startInsert(group.length);
    if (state.done) commit(sentiment, state);
    else setStep({ kind: 'compare', sentiment, group, state });
  };

  const respond = (a: Answer) => {
    if (step.kind !== 'compare') return;
    const next = answer(step.state, a);
    if (next.done) commit(step.sentiment, next);
    else setStep({ ...step, state: next });
  };

  const back = () => {
    if (step.kind !== 'compare') return;
    const prev = undo(step.state);
    setStep(prev ? { ...step, state: prev } : { kind: 'sentiment' });
  };

  const leave = () => navigate(`/place/${place.id}`, { replace: true });

  return (
    <div className="flow">
      <div className="flow-top">
        {step.kind === 'compare' ? (
          <button className="btn-text" onClick={back} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingLeft: 0 }}>
            <Undo2 size={18} /> Undo
          </button>
        ) : (
          <span className="eyebrow">Rank · {TIER_SHORT[place.tier]}</span>
        )}
        {step.kind !== 'result' && (
          <button className="icon-btn" aria-label="Stop ranking" onClick={leave} style={{ boxShadow: 'none', background: 'none' }}>
            <X size={22} />
          </button>
        )}
      </div>

      {step.kind === 'sentiment' && (
        <div className="flow-body">
          <div style={{ marginBottom: 'auto', paddingTop: 'var(--s5)' }}>
            <p className="eyebrow">How was it?</p>
            <h1 style={{ marginTop: 6 }}>{place.name}</h1>
          </div>
          <div className="sentiments">
            {SENTIMENT_OPTIONS.map((o) => (
              <button key={o.value} className="sentiment" onClick={() => chooseSentiment(o.value)}>
                {o.icon}
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step.kind === 'compare' && (
        <CompareStep
          place={place}
          other={getPlace(step.group[currentMid(step.state)])!}
          k={step.state.history.length + 1}
          total={expectedComparisons(step.group.length)}
          onAnswer={respond}
        />
      )}

      {step.kind === 'result' && myRank && (
        <>
          <div className="flow-center">
            <span className="eyebrow">{place.name}</span>
            <div className="result-rank">
              #{myRank.rank} of {myRank.of}
            </div>
            <h2>{TIER_SHORT[place.tier]}</h2>
            <p className="muted" style={{ fontWeight: 600 }}>
              Score {formatScore(myRank.score)}
            </p>
          </div>
          <div className="flow-actions">
            <button className="btn btn-primary btn-block" onClick={leave}>
              Done
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function CompareStep(props: { place: Place; other: Place; k: number; total: number; onAnswer: (a: Answer) => void }) {
  const { place, other, k, total, onAnswer } = props;
  return (
    <div className="flow-body">
      <div style={{ marginBottom: 'auto', paddingTop: 'var(--s4)' }}>
        <p className="eyebrow">
          Comparison {k} of about {total}
        </p>
        <h1 style={{ marginTop: 6 }}>Which was better?</h1>
      </div>
      <ComparisonCards left={place} right={other} onPick={(side) => onAnswer(side === 'left' ? 'new' : 'existing')} />
      <button className="btn btn-secondary btn-block" onClick={() => onAnswer('tie')}>
        Too tough to call
      </button>
    </div>
  );
}
