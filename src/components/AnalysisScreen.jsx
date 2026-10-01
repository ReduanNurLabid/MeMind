import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { pipeline, env } from '@xenova/transformers';
import Brain3D from './Brain3D';

// Skip local checks so it pulls from HuggingFace
env.allowLocalModels = false;

const ANALYSIS_STAGES = [
  { text: "Calibrating baseline neural response latencies...", progress: 20 },
  { text: "Running transformer embeddings on trigger-response pairs...", progress: 45 },
  { text: "Calculating semantic distance & unconscious deflections...", progress: 70 },
  { text: "Detecting subconscious resistance & defensive censorship...", progress: 88 },
  { text: "Synthesizing Dr. Freud's psychodynamic diagnostic profile...", progress: 98 }
];

const AnalysisScreen = ({ answers, inputMode, userName, onRestart }) => {
  const [analyzing, setAnalyzing] = useState(true);
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [semanticScores, setSemanticScores] = useState({});
  const exportRef = useRef(null);

  // Calculate baseline metrics
  const baselines = answers.filter(a => !a.isTrigger && a.response);
  const avgBaselineTime = baselines.length > 0 
    ? baselines.reduce((acc, curr) => acc + curr.timeTaken, 0) / baselines.length 
    : 2.0;

  const triggers = answers.filter(a => a.isTrigger);
  const triggerBlanks = triggers.filter(a => !a.response).length;
  const avgTriggerTime = triggers.reduce((acc, curr) => acc + curr.timeTaken, 0) / triggers.length;

  useEffect(() => {
    let currentStage = 0;
    const stageTimer = setInterval(() => {
      currentStage++;
      if (currentStage < ANALYSIS_STAGES.length) {
        setStageIndex(currentStage);
        setProgress(ANALYSIS_STAGES[currentStage].progress);
      }
    }, 1200);

    const runSemanticAnalysis = async () => {
      const startTime = Date.now();
      try {
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        const dotProduct = (a, b) => a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitude = (arr) => Math.sqrt(arr.reduce((sum, val) => sum + val * val, 0));
        const cosineSimilarity = (a, b) => dotProduct(a, b) / (magnitude(a) * magnitude(b));

        const scores = {};
        for (const t of triggers) {
          if (!t.response) {
            scores[t.word] = 0;
            continue;
          }
          const outTrigger = await extractor(t.word, { pooling: 'mean', normalize: true });
          const outResponse = await extractor(t.response, { pooling: 'mean', normalize: true });
          scores[t.word] = cosineSimilarity(outTrigger.data, outResponse.data);
        }
        setSemanticScores(scores);
      } catch (err) {
        console.error("Semantic engine failed:", err);
        setSemanticScores({}); // fallback
      }
      
      // Ensure at least 4.5 seconds of clinical immersion as requested
      const elapsed = Date.now() - startTime;
      const minDelay = 4500;
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      clearInterval(stageTimer);
      setProgress(100);
      setTimeout(() => setAnalyzing(false), 500);
    };

    runSemanticAnalysis();

    return () => clearInterval(stageTimer);
  }, []);

  if (analyzing) {
    return (
      <div className="analysis-screen animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '2rem', textAlign: 'center' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '650px', padding: '3rem 2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '75px', height: '75px', 
              border: '4px solid rgba(255,255,255,0.08)',
              borderTopColor: 'var(--accent-color)',
              borderRightColor: 'var(--accent-glow, rgba(99,102,241,0.5))',
              borderRadius: '50%',
              animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite' 
            }} />
          </div>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.75rem' }}>
            Psychoanalytic Decompression In Progress
          </p>

          <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', letterSpacing: '0.02em', minHeight: '3.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {ANALYSIS_STAGES[stageIndex]?.text || "Synthesizing..."}
          </h2>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden', marginTop: '2rem', position: 'relative' }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, var(--accent-color), #ec4899)', 
              borderRadius: '999px',
              transition: 'width 0.8s ease-in-out'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
            <span>Stage {stageIndex + 1} of {ANALYSIS_STAGES.length}</span>
            <span>{progress}%</span>
          </div>

          <style>{`
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          `}</style>
        </div>
      </div>
    );
  }

  // --- Insight Generation Logic ---

  const isGibberish = (text) => {
    if (!text) return false;
    const clean = text.trim().toLowerCase();
    if (clean.length === 1 && clean !== 'i' && clean !== 'a') return true;
    if (/^(.)\1+$/i.test(clean)) return true; // e.g. 'wwww', 'xxxx', 'aaaa'
    if (clean.length >= 3 && !/[aeiouy]/i.test(clean)) return true; // e.g. 'zxxczx', 'wqqe'
    const mash = ['asdf', 'hjkl', 'qwerty', 'zxcv', 'qwe', 'asd', 'zxc'];
    if (mash.some(m => clean.includes(m)) && clean.length <= 6) return true;
    return false;
  };

  const gibberishCount = triggers.filter(t => isGibberish(t.response)).length;

  const getArchetypeAndDefense = () => {
    if (gibberishCount >= 2) {
      const sample = triggers.find(t => isGibberish(t.response))?.response;
      return {
        archetype: "The Cynical Saboteur",
        defense: "Defensive Mockery & Nihilistic Farce",
        summary: `You attempted to sabotage Dr. Freud's clinical inquiry through keyboard static and intentional farce ('${sample}'). In psychoanalysis, patients who mock the clinician or deploy absurd non-sequiturs are often the most terrified of genuine emotional exposure.`
      };
    }
    if (triggerBlanks >= 2) {
      return {
        archetype: "The Guarded Fortress",
        defense: "Affective Repression & Evasive Stalling",
        summary: `You exhibited substantial subconscious resistance to core emotional stimuli. When confronted with sensitive psychological triggers, your internal defense system chose silence over exposure.`
      };
    }
    if (avgTriggerTime < avgBaselineTime - 0.3) {
      return {
        archetype: "The Impulsive Realist",
        defense: "Immediate Deflection & Unfiltered Discharge",
        summary: `Your responses to loaded emotional triggers were actually faster than your neutral baseline. Rather than deliberating, your mind reflexively discharges tension before cognitive scrutiny can intercede.`
      };
    }
    if (avgTriggerTime > avgBaselineTime + 0.9) {
      return {
        archetype: "The Vigilant Over-Thinker",
        defense: "Intellectualization & Prefrontal Censorship",
        summary: `You experienced measurable cognitive friction when confronted with emotional triggers. Your conscious ego actively audited and sanitized your instinctual impulses before granting them verbal expression.`
      };
    }
    return {
      archetype: "The Balanced Synthesizer",
      defense: "Ego-Syntonic Integration & Measured Restraint",
      summary: `You maintain an equilibrium between instinctual spontaneity and conscious filtering. Your psyche confronts provocative stimuli without catastrophic delays or manic deflections.`
    };
  };

  const getLifeProblemDiagnosis = () => {
    if (gibberishCount >= 2) {
      return "Compulsive Cynicism & Fear of Sincere Vulnerability";
    }

    let worstTrigger = null;
    let maxDelay = -Infinity;

    triggers.forEach(t => {
      if (!t.response) {
        maxDelay = 999;
        worstTrigger = t;
      } else {
        const delay = t.timeTaken - avgBaselineTime;
        if (delay > maxDelay) {
          maxDelay = delay;
          worstTrigger = t;
        }
      }
    });

    if (!worstTrigger) return "Existential Fatigue & Emotional Blunting";

    if (maxDelay < -0.6) return "Restless Impulsivity & Panic Escapism";
    
    const domain = worstTrigger.domain;
    const map = {
      'Career/Pressure': "Chronic Burnout & Impostor Exhaustion",
      'Relationships': "Intimacy Ambivalence & Fear of Abandonment",
      'Inner Self': "Suppressed Identity Crisis & Existential Hollow",
      'Vulnerability': "Hyper-Independence & The Armor of Self-Reliance",
      'Conflict/Anger': "Suppressed Hostility & Toxic People-Pleasing",
      'Ego/Power': "Ego Fragility & Chronic Validation Seeking",
      'Burnout': "Severe Career Burnout & Depleted Reserves",
      'Isolation': "Social Alienation & The 'Unseen' Complex",
      'Future Panic': "Existential Dread & Fear of Future Stagnation",
      'Safety': "Hyper-Vigilance & Subconscious Fear of Instability",
      'Family Dynamics': "Formative Parental Expectations & Familial Guilt",
      'Loss of Innocence': "Unresolved Childhood Trauma & Nostalgic Grief"
    };

    return map[domain] || `Unprocessed Emotional Blockage (${domain})`;
  };

  const generateSemanticInsight = (ans) => {
    const timeDiff = ans.timeTaken - avgBaselineTime;
    const similarity = semanticScores[ans.word] || 0;
    
    // Seed variance selector to avoid repeated text across cards
    const seed = (ans.word.charCodeAt(0) * 3 + (ans.response ? ans.response.length * 7 : 11)) % 3;

    // 0. Gibberish / Keyboard Mash / Test-Sabotage Detection
    if (isGibberish(ans.response)) {
      const gibberishInsights = [
        `Cynical Sabotage & Evasive Static. Responding with keyboard noise ('${ans.response}') is an aggressive ego defense. When confronted with '${ans.word}', rather than offering an authentic subconscious association, your conscious ego staged an intentional farce to mock the test and evade vulnerability.`,
        `Mockery as Psychological Armor. You discharged keyboard static ('${ans.response}') to terminate the stimulus. In psychoanalysis, patients who mock the clinician's couch or offer deliberately absurd associations are often the most terrified of what sincere self-reflection might expose.`,
        `Defensive Jesting & Farce. Entering nonsense ('${ans.response}') acts as a psychological smoke grenade. Your psyche deployed absurdism to protect '${ans.word}' from diagnostic scrutiny, choosing the safety of being a prankster over the risk of being known.`
      ];
      return gibberishInsights[seed];
    }

    // 1. Total Silence / Timeout
    if (!ans.response) {
      const silenceMap = {
        'Family Dynamics': `Repression of Formative Conditioning. The stimulus '${ans.word}' triggered a total subconscious stall. Rather than allowing childhood memories or parental conflict to surface, your ego chose complete verbal paralysis.`,
        'Loss of Innocence': `Subconscious Defense Freeze. When confronted with '${ans.word}', conscious processing abruptly halted. Your psyche actively barricaded against vulnerable grief or nostalgic pain, shielding you behind total silence.`,
        'Vulnerability': `Ego Preservation Shutdown. Total speech paralysis. Admitting to exposure, weakness, or shame proved too threatening to your conscious self-image, triggering an instantaneous mental circuit-break.`,
        'Conflict/Anger': `Suppressed Hostility. The confrontational energy of '${ans.word}' triggered an immediate moral blackout. Your subconscious prefers total silence over acknowledging taboo or aggressive instincts.`,
        'Career/Pressure': `Paralytic Overwhelm. When confronted with '${ans.word}', cognitive faculties jammed. This paralysis mirrors the chronic impostor dread and burnout you experience under external scrutiny.`,
        'Burnout': `Depletion Stupor. When presented with '${ans.word}', mental reserves gave out completely. Your inability to react highlights deep psychological fatigue with this demand.`,
        'Relationships': `Intimacy Blockade. The concept of '${ans.word}' closed off speech. Pausing into silence suggests unresolved interpersonal trauma or profound fear of emotional exposure.`
      };
      return silenceMap[ans.domain] || `Subconscious Block. The inability to respond to '${ans.word}' within 5 seconds indicates a defensive stall. Your subconscious actively erected a wall to shield your conscious mind from the emotional weight of this concept.`;
    }

    // 2. High Hesitation / Resistance (+0.8s or more above baseline)
    if (timeDiff >= 0.8) {
      if (similarity > 0.38) {
        if (seed === 0) return `Delayed Orthodoxy. You took +${timeDiff.toFixed(1)}s longer than your baseline to settle on '${ans.response}'. This delay betrays an internal censorship: your first instinct was flagged as unsafe, so you retreated to a safe, conventional answer.`;
        if (seed === 1) return `Filtered Rationalization. It took significant conscious effort (+${timeDiff.toFixed(1)}s) to connect '${ans.word}' with '${ans.response}'. You paused to audit your thoughts before offering this sanitized response.`;
        return `Suppressed Primary Association. Pausing for +${timeDiff.toFixed(1)}s before selecting '${ans.response}' indicates an inner dispute. Your mind rejected an uncensored initial thought before settling here.`;
      }
      if (similarity >= 0.22) {
        if (seed === 0) return `Cognitive Friction. An abnormal +${timeDiff.toFixed(1)}s hesitation before delivering '${ans.response}'. The stimulus '${ans.word}' ignited an internal dispute in ${ans.domain}, forcing your conscious ego to negotiate before releasing this thought.`;
        if (seed === 1) return `Hesitant Subconscious Alignment. You stumbled before connecting '${ans.word}' to '${ans.response}'. While the link has personal logic, the extended delay indicates that exploring ${ans.domain} is fraught with emotional resistance.`;
        return `Ambivalent Association. Spending +${timeDiff.toFixed(1)}s on '${ans.word}' before settling on '${ans.response}' points to deep internal ambivalence. You grappled with conflicting feelings around this concept.`;
      }
      // Low similarity + High latency = evasive scramble
      if (seed === 0) return `Defensive Scrambling. Confronted with '${ans.word}', a severe hesitation (+${timeDiff.toFixed(1)}s) culminated in the distant association '${ans.response}'. When your mind grazed an emotional nerve, it scrambled to find an unrelated concept to neutralize the tension.`;
      if (seed === 1) return `Censored Evasion. You stalled (+${timeDiff.toFixed(1)}s) and deflected to '${ans.response}'. The vast conceptual distance between these ideas reveals an active defense mechanism: actively steering away from the core truth of '${ans.word}'.`;
      return `Emergency Dissociation. Stalling (+${timeDiff.toFixed(1)}s) before producing '${ans.response}' suggests that '${ans.word}' tapped into an uncomfortable core memory, prompting your psyche to grasp at an arbitrary distraction.`;
    }

    // 3. Mild Hesitation / Conscious Filtering (+0.3s to +0.8s above baseline)
    if (timeDiff >= 0.3) {
      if (similarity > 0.38) {
        if (seed === 0) return `Controlled Reflection. A slight +${timeDiff.toFixed(1)}s pause before offering '${ans.response}'. While logically coherent, the micro-hesitation shows your conscious mind briefly double-checking your composure in ${ans.domain}.`;
        if (seed === 1) return `Polished Conventionality. You paused just long enough to ensure '${ans.response}' was fitting. This reflects a steady, socially attuned processing of '${ans.word}' rather than uncurated raw instinct.`;
        return `Measured Coherence. You took a brief moment (+${timeDiff.toFixed(1)}s) to connect '${ans.word}' with '${ans.response}', verifying that the association aligned with your conscious self-image.`;
      }
      if (similarity >= 0.22) {
        if (seed === 0) return `Subconscious Introspection. A slight pause (+${timeDiff.toFixed(1)}s) leading to '${ans.response}'. You allowed yourself a brief moment of internal contemplation before answering, revealing an active, thoughtful relationship with ${ans.domain}.`;
        if (seed === 1) return `Deliberate Associative Leap. Bridging '${ans.word}' to '${ans.response}' required a slight pause (+${timeDiff.toFixed(1)}s), indicating personal memory retrieval rather than a knee-jerk reaction.`;
        return `Cognitive Deliberation. A momentary pause (+${timeDiff.toFixed(1)}s) before delivering '${ans.response}'. This reveals that '${ans.word}' required a conscious mental shift before releasing an answer.`;
      }
      // Low similarity + Mild delay = Deflection / Irony / Humor
      if (seed === 0) return `Deflective Detour. A noticeable pause (+${timeDiff.toFixed(1)}s) followed by the unexpected pairing '${ans.response}'. Rather than absorbing the sobering weight of '${ans.word}', your psyche employed humor, irony, or detachment as an emotional buffer.`;
      if (seed === 1) return `Protective Irony. Associating '${ans.word}' with '${ans.response}' after a mild delay suggests an idiosyncratic coping strategy: defusing emotional gravity by reframing it through an unexpected, playful lens.`;
      return `Subtle Diversion. Taking +${timeDiff.toFixed(1)}s before selecting '${ans.response}' indicates an instinctive pivot away from the literal meaning of '${ans.word}' toward a more comfortable conceptual space.`;
    }

    // 4. Fluid Baseline Flow (-0.3s to +0.3s relative to baseline)
    if (timeDiff >= -0.3) {
      if (similarity > 0.38) {
        if (seed === 0) return `Conditioned Reflex. Instantaneous pairing of '${ans.word}' with '${ans.response}' at your exact baseline tempo. This reflects a deeply wired, unconflicted neural pathway—a formative association in ${ans.domain} formed early in life.`;
        if (seed === 1) return `Direct Archetypal Route. You bridged '${ans.word}' to '${ans.response}' with zero friction. There is no second-guessing here; your mind views this connection as an intuitive certainty.`;
        return `Uninhibited Alignment. Connecting '${ans.word}' to '${ans.response}' at your natural baseline pace demonstrates complete psychological ease with this concept.`;
      }
      if (similarity >= 0.22) {
        if (seed === 0) return `Effortless Resonance. Pairing '${ans.word}' with '${ans.response}' flowed naturally. Your subconscious holds a clear, emotionally grounded perspective on ${ans.domain} with complete cognitive ease.`;
        if (seed === 1) return `Harmonious Synthesis. At baseline speed, your mind linked '${ans.word}' to '${ans.response}'. This reveals healthy emotional processing and an absence of latent friction regarding this concept.`;
        return `Fluid Association. You moved from '${ans.word}' to '${ans.response}' without internal drag, displaying a balanced and uncomplicated mental bridge.`;
      }
      // Low similarity + Baseline speed = Private intuitive symbolism
      if (seed === 0) return `Intuitive Metaphor. You bridged '${ans.word}' and '${ans.response}' without hesitation, despite their conceptual distance. This reveals a private, imaginative symbolic vocabulary that operates fluidly beneath conscious logic.`;
      if (seed === 1) return `Idiosyncratic Flow. An unconventional bridge between '${ans.word}' and '${ans.response}' delivered with effortless speed. Your mind holds a unique, non-conformist imprint of ${ans.domain}.`;
      return `Personalized Symbolism. Seamlessly pairing '${ans.word}' with '${ans.response}' highlights an idiosyncratic, deeply personal association that bypasses standard linguistic conventions.`;
    }

    // 5. Hyper-Impulsive Rush (faster than baseline by -0.3s or more)
    if (similarity > 0.38) {
      if (seed === 0) return `Unfiltered Eruption. Firing back '${ans.response}' ${Math.abs(timeDiff).toFixed(1)}s faster than your baseline. This connection is primal and automatic, bypassing your conscious prefrontal filters entirely.`;
      if (seed === 1) return `Visceral Reflex. An urgent, immediate release of '${ans.response}'. The stimulus '${ans.word}' lives at the absolute surface of your consciousness, ready to erupt without warning.`;
      return `Pre-Emptive Response. Blurted out ${Math.abs(timeDiff).toFixed(1)}s ahead of baseline, pairing '${ans.word}' with '${ans.response}' indicates an automatic, hyper-primed neural circuit.`;
    }
    if (similarity >= 0.22) {
      if (seed === 0) return `Urgent Resonance. A sudden, instinctual burst connecting '${ans.word}' to '${ans.response}'. You felt an immediate magnetic attraction to this word before your conscious judgment could intervene.`;
      if (seed === 1) return `Impulsive Disclosure. Released with noticeable speed (${Math.abs(timeDiff).toFixed(1)}s faster than baseline), pairing '${ans.word}' with '${ans.response}' highlights an emotionally charged, high-priority node in your psyche.`;
      return `Instinctive Flash. Connecting '${ans.word}' to '${ans.response}' occurred in a rapid flash. Your subconscious propelled this association forward before your critical mind could review it.`;
    }
    // Low similarity + High speed = Panic shielding
    if (seed === 0) return `Preemptive Shielding. You fired off '${ans.response}' abnormally fast (${Math.abs(timeDiff).toFixed(1)}s ahead of baseline) to escape '${ans.word}'. When an emotional nerve was grazed, your brain tossed out the first unrelated word it could grasp to terminate the stimulus.`;
    if (seed === 1) return `Panic Camouflage. A hasty, mismatched association. Erupting with '${ans.response}' at breakneck speed indicates an instinctive defensive maneuver to deflect attention from what '${ans.word}' actually awakened inside you.`;
    return `Reflexive Evasion. Rushing to pair '${ans.word}' with '${ans.response}' (${Math.abs(timeDiff).toFixed(1)}s ahead of baseline) suggests an urgent defensive impulse to dismiss the trigger word before it could register deeply.`;
  };

  const profile = getArchetypeAndDefense();

  return (
    <div className="results-screen animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', width: '100%', flex: 1, overflowY: 'auto', position: 'relative' }}>
      
      <div ref={exportRef} style={{ width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-base)', padding: '2rem 1rem', borderRadius: '16px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', textAlign: 'center' }}>Your Mind, Decoded</h1>
        
        {/* Interactive 3D Brain */}
        <div className="glass-panel" style={{ width: '100%', maxWidth: '1000px', marginBottom: '3rem', padding: '0', height: '650px', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          <Brain3D triggers={triggers} avgBaselineTime={avgBaselineTime} />
        </div>

        {/* Overall Profile Card */}
        <div 
          className="glass-panel" 
          style={{ 
            width: '100%', maxWidth: '900px', marginBottom: '3rem', 
            borderLeft: `5px solid var(--accent-color)`,
            background: 'var(--bg-dark)', /* Solid bg for html2canvas to render properly */
            position: 'relative'
          }}
        >
        <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', opacity: 0.15, fontSize: '4.5rem' }}>🧠</div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
            Psychodynamic Evaluation
          </span>
        </div>

        <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem', letterSpacing: '0.02em' }}>
          Dr. Freud's Diagnosis of {userName}
        </h2>
        
        <div style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(239, 68, 68, 0.12)', 
          border: '1px solid rgba(239, 68, 68, 0.4)', 
          color: '#f87171', 
          padding: '0.5rem 1.25rem', 
          borderRadius: '10px',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
          fontSize: '1.15rem'
        }}>
          <span>⚠️</span> Primary Burden: {getLifeProblemDiagnosis()}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '0.75rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Psychic Archetype</p>
              <p style={{ fontSize: '1.15rem', color: 'var(--accent-color)', fontWeight: 600, marginTop: '0.2rem' }}>{profile.archetype}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Primary Defense Mechanism</p>
              <p style={{ fontSize: '1.15rem', color: '#e4e4e7', fontWeight: 600, marginTop: '0.2rem' }}>{profile.defense}</p>
            </div>
          </div>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#d4d4d8' }}>
            {profile.summary}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
          <span>Calculated Baseline Speed: <strong style={{ color: '#fff' }}>{avgBaselineTime.toFixed(1)}s</strong></span>
          <span>Average Trigger Latency: <strong style={{ color: '#fff' }}>{avgTriggerTime.toFixed(1)}s</strong></span>
          <span>Latency Delta: <strong style={{ color: (avgTriggerTime - avgBaselineTime) > 0.5 ? '#f87171' : '#34d399' }}>{(avgTriggerTime - avgBaselineTime) > 0 ? '+' : ''}{(avgTriggerTime - avgBaselineTime).toFixed(1)}s</strong></span>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Core Trigger Analysis</h3>
        {triggers.map((ans, idx) => {
          const similarity = semanticScores[ans.word] || 0;
          const timeDiff = ans.timeTaken - avgBaselineTime;
          return (
            <div key={idx} className="glass-panel trigger-analysis-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: !ans.response || timeDiff > 0.8 ? '4px solid #ef4444' : timeDiff < -0.3 ? '4px solid #10b981' : '4px solid var(--accent-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {ans.domain}
                  </p>
                  <h3 style={{ fontSize: '2rem', color: '#fff' }}>{ans.word}</h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Response</p>
                  <h3 style={{ fontSize: '2rem', color: ans.response ? 'var(--accent-color)' : '#ef4444', fontStyle: 'italic' }}>
                    {ans.response || '[Silence]'}
                  </h3>
                </div>
              </div>
              
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.25rem 0' }} />
              
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                  <span>
                    Latency: <span style={{ color: '#fff' }}>{ans.timeTaken.toFixed(1)}s</span> 
                    <span style={{ marginLeft: '0.5rem', fontWeight: 600, color: timeDiff > 0.8 || !ans.response ? '#ef4444' : timeDiff < -0.3 ? '#10b981' : 'var(--text-muted)' }}>
                      ({timeDiff > 0 ? '+' : ''}{timeDiff.toFixed(1)}s vs baseline)
                    </span>
                  </span>
                  {ans.response && (
                    <span>
                      Semantic Match: <span style={{ color: similarity < 0.25 ? '#f59e0b' : '#38bdf8', fontWeight: 600 }}>{(similarity * 100).toFixed(0)}%</span>
                    </span>
                  )}
                </div>
                <p style={{ lineHeight: 1.65, color: '#e4e4e7', fontSize: '1.05rem' }}>
                  {generateSemanticInsight(ans)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
      </div>
      
      {/* Floating Action Bar (Sticky Bottom) */}
      <div className="action-bar-container" style={{
        position: 'sticky',
        bottom: '20px',
        zIndex: 100,
        display: 'flex',
        gap: '12px',
        background: 'rgba(8, 8, 16, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '100px',
        padding: '8px',
        marginTop: '2rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        alignSelf: 'center'
      }}>
         <button onClick={onRestart} className="action-btn" title="Take Test Again">
           <span className="material-symbols-outlined">restart_alt</span>
           <span>Restart</span>
         </button>
         <button onClick={async () => {
          if (exportRef.current) {
            try {
              const canvas = await html2canvas(exportRef.current, { 
                backgroundColor: '#05050a', 
                scale: 2,
                useCORS: true
              });
              const image = canvas.toDataURL("image/png");
              const link = document.createElement('a');
              link.href = image;
              link.download = `Memind_Diagnosis_${userName.replace(/\s+/g, '_')}.png`;
              link.click();
            } catch (err) {
              console.error("Failed to generate image", err);
              alert("Failed to save image. Please try again.");
            }
          }
        }} className="action-btn accent" title="Save Image">
           <span className="material-symbols-outlined">download</span>
           <span>Export</span>
         </button>
         <button onClick={() => {
          const blocks = triggers.map(t => {
            const timeDiff = t.timeTaken - avgBaselineTime;
            const emoji = timeDiff > 0.8 || !t.response ? '🟥' : (timeDiff < -0.3 ? '🟩' : '🟪');
            return `${emoji} ${t.domain}`;
          }).join('\n');
          const text = `Dr. Freud's Test 🧠\n\nPatient: ${userName}\nPrimary Burden: ${getLifeProblemDiagnosis()}\nArchetype: ${profile.archetype}\n\n${blocks}\n\nCan you beat your subconscious? Try it:`;
          navigator.clipboard.writeText(text);
          alert("Result copied to clipboard! Ready to share on social media.");
        }} className="action-btn" title="Copy Social Text">
           <span className="material-symbols-outlined">share</span>
           <span>Social</span>
         </button>
         <button onClick={() => {
          let fullReport = `Dr. Freud's Diagnosis of ${userName}\n`;
          fullReport += `Primary Burden: ${getLifeProblemDiagnosis()}\n`;
          fullReport += `Archetype: ${profile.archetype}\n`;
          fullReport += `Primary Defense: ${profile.defense}\n`;
          fullReport += `Calculated Baseline Speed: ${avgBaselineTime.toFixed(1)}s\n`;
          fullReport += `\n${profile.summary}\n\n`;
          fullReport += `--- Core Trigger Analysis ---\n\n`;
          
          triggers.forEach(t => {
            const timeDiff = t.timeTaken - avgBaselineTime;
            const similarity = semanticScores[t.word] || 0;
            
            fullReport += `Domain: ${t.domain}\n`;
            fullReport += `Dr. Freud: ${t.word}\n`;
            fullReport += `Your Response: ${t.response || '[Silence]'}\n`;
            fullReport += `Latency: ${t.timeTaken.toFixed(1)}s (${timeDiff > 0 ? '+' : ''}${timeDiff.toFixed(1)}s vs baseline)\n`;
            if (t.response) {
              fullReport += `Semantic Match: ${(similarity * 100).toFixed(0)}%\n`;
            }
            fullReport += `Analysis: ${generateSemanticInsight(t)}\n\n`;
          });
          
          navigator.clipboard.writeText(fullReport);
          alert("Full detailed report copied to clipboard!");
        }} className="action-btn" title="Copy Full Report">
           <span className="material-symbols-outlined">description</span>
           <span>Report</span>
         </button>
      </div>
    </div>
  );
};

export default AnalysisScreen;

