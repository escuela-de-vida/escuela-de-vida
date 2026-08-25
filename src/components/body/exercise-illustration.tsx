// Ilustraciones de línea, estilo pictograma (coherente con la sección 5.0:
// iconografía fina tipo SF Symbols, un solo color de trazo). Una sola
// familia de dibujo por grupo muscular, parametrizada por `tier` para
// mostrar la variante correcta sin repetir 18 ilustraciones a mano.

import type { Exercise, Tier } from "@/lib/body/exercises";

const STROKE_PROPS = {
  fill: "none",
  strokeWidth: 4.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Head({ cx, cy }: { cx: number; cy: number }) {
  return <circle cx={cx} cy={cy} r="8" {...STROKE_PROPS} />;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 90" className="h-full w-full" stroke="currentColor" aria-hidden>
      {children}
    </svg>
  );
}

function PushUpIllustration({ tier }: { tier: Tier }) {
  // facil: manos elevadas sobre un apoyo; estandar: rodillas en el piso; dificil: cuerpo recto.
  if (tier === "facil") {
    return (
      <Frame>
        <line x1="20" y1="70" x2="45" y2="70" {...STROKE_PROPS} />
        <line x1="45" y1="55" x2="45" y2="70" {...STROKE_PROPS} />
        <Head cx={92} cy={40} />
        <line x1="86" y1="46" x2="45" y2="58" {...STROKE_PROPS} />
        <line x1="70" y1="52" x2="45" y2="55" {...STROKE_PROPS} />
        <line x1="45" y1="58" x2="30" y2="72" {...STROKE_PROPS} />
      </Frame>
    );
  }
  if (tier === "estandar") {
    return (
      <Frame>
        <line x1="30" y1="75" x2="45" y2="60" {...STROKE_PROPS} />
        <Head cx={95} cy={45} />
        <line x1="89" y1="51" x2="30" y2="66" {...STROKE_PROPS} />
        <line x1="65" y1="58" x2="45" y2="75" {...STROKE_PROPS} />
      </Frame>
    );
  }
  return (
    <Frame>
      <line x1="15" y1="75" x2="45" y2="62" {...STROKE_PROPS} />
      <Head cx={100} cy={48} />
      <line x1="94" y1="54" x2="15" y2="68" {...STROKE_PROPS} />
      <line x1="65" y1="60" x2="45" y2="75" {...STROKE_PROPS} />
    </Frame>
  );
}

function RowIllustration({ tier }: { tier: Tier }) {
  // facil (superman): acostado boca abajo, brazos y piernas arriba.
  if (tier === "facil") {
    return (
      <Frame>
        <Head cx={22} cy={58} />
        <line x1="28" y1="55" x2="90" y2="60" {...STROKE_PROPS} />
        <line x1="14" y1="50" x2="4" y2="42" {...STROKE_PROPS} />
        <line x1="90" y1="60" x2="102" y2="50" {...STROKE_PROPS} />
      </Frame>
    );
  }
  // estandar/dificil: remo invertido bajo una mesa — dificil con pies elevados.
  const footY = tier === "dificil" ? 40 : 78;
  return (
    <Frame>
      <line x1="10" y1="30" x2="70" y2="30" {...STROKE_PROPS} />
      <line x1="70" y1="30" x2="70" y2="15" {...STROKE_PROPS} />
      <Head cx={45} cy={45} />
      <line x1="42" y1="52" x2="55" y2="30" {...STROKE_PROPS} />
      <line x1="42" y1="52" x2="90" y2={footY} {...STROKE_PROPS} />
      {tier === "dificil" && <line x1="85" y1="35" x2="95" y2="45" {...STROKE_PROPS} />}
    </Frame>
  );
}

function SquatIllustration({ tier }: { tier: Tier }) {
  if (tier === "dificil") {
    // zancada
    return (
      <Frame>
        <Head cx={55} cy={20} />
        <line x1="55" y1="28" x2="52" y2="55" {...STROKE_PROPS} />
        <line x1="52" y1="55" x2="30" y2="55" {...STROKE_PROPS} />
        <line x1="30" y1="55" x2="30" y2="78" {...STROKE_PROPS} />
        <line x1="52" y1="55" x2="78" y2="70" {...STROKE_PROPS} />
        <line x1="78" y1="70" x2="70" y2="78" {...STROKE_PROPS} />
        <line x1="55" y1="34" x2="35" y2="42" {...STROKE_PROPS} />
        <line x1="55" y1="34" x2="75" y2="42" {...STROKE_PROPS} />
      </Frame>
    );
  }
  const kneeBend = tier === "facil" ? 55 : 62;
  return (
    <Frame>
      {tier === "facil" && <line x1="90" y1="30" x2="90" y2="78" {...STROKE_PROPS} />}
      <Head cx={45} cy={20} />
      <line x1="45" y1="28" x2="45" y2={kneeBend} {...STROKE_PROPS} />
      <line x1="45" y1={kneeBend} x2="32" y2="78" {...STROKE_PROPS} />
      <line x1="45" y1={kneeBend} x2="58" y2="78" {...STROKE_PROPS} />
      <line x1="45" y1="34" x2="30" y2="45" {...STROKE_PROPS} />
      <line x1="45" y1="34" x2="60" y2="45" {...STROKE_PROPS} />
    </Frame>
  );
}

function PikeIllustration({ tier }: { tier: Tier }) {
  const footY = tier === "dificil" ? 40 : 78;
  return (
    <Frame>
      {tier === "facil" && <line x1="12" y1="55" x2="12" y2="78" {...STROKE_PROPS} />}
      {tier === "dificil" && <line x1="95" y1="34" x2="95" y2="46" {...STROKE_PROPS} />}
      <Head cx={55} cy={32} />
      <line x1="52" y1="39" x2="15" y2={tier === "facil" ? 55 : 74} {...STROKE_PROPS} />
      <line x1="52" y1="39" x2="92" y2={footY} {...STROKE_PROPS} />
      <line x1="55" y1="32" x2="40" y2="48" {...STROKE_PROPS} />
    </Frame>
  );
}

function DipIllustration({ tier }: { tier: Tier }) {
  const legAngle = tier === "facil" ? 65 : tier === "estandar" ? 78 : 78;
  return (
    <Frame>
      <line x1="8" y1="30" x2="34" y2="30" {...STROKE_PROPS} />
      <line x1="34" y1="30" x2="34" y2="15" {...STROKE_PROPS} />
      {tier === "dificil" && <line x1="80" y1="45" x2="105" y2="45" {...STROKE_PROPS} />}
      <Head cx={40} cy={45} />
      <line x1="38" y1="52" x2="32" y2="30" {...STROKE_PROPS} />
      <line x1="38" y1="52" x2="95" y2={legAngle} {...STROKE_PROPS} />
    </Frame>
  );
}

function PlankIllustration({ tier }: { tier: Tier }) {
  return (
    <Frame>
      <Head cx={18} cy={45} />
      <line x1="24" y1="48" x2="95" y2="55" {...STROKE_PROPS} />
      <line x1="18" y1="52" x2="10" y2="65" {...STROKE_PROPS} />
      {tier === "facil" && <line x1="95" y1="55" x2="95" y2="72" {...STROKE_PROPS} />}
      {tier !== "facil" && <line x1="95" y1="55" x2="108" y2="60" {...STROKE_PROPS} />}
      {tier === "dificil" && <line x1="45" y1="50" x2="55" y2="32" {...STROKE_PROPS} />}
    </Frame>
  );
}

const BY_FAMILY = {
  pushup: PushUpIllustration,
  row: RowIllustration,
  squat: SquatIllustration,
  pike: PikeIllustration,
  dip: DipIllustration,
  plank: PlankIllustration,
};

export function ExerciseIllustration({ exercise }: { exercise: Exercise }) {
  const Component = BY_FAMILY[exercise.family];
  return <Component tier={exercise.tier} />;
}
