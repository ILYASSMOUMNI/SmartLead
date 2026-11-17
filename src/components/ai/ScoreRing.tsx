export function ScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 62;
  return (
    <div
      className="score-ring"
      role="img"
      aria-label={`Demo AI Score ${score} out of 100`}
    >
      <svg viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r="62"
          fill="none"
          stroke="#eef0fb"
          strokeWidth="10"
        />
        <circle
          cx="75"
          cy="75"
          r="62"
          fill="none"
          stroke="#626de3"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
          strokeLinecap="round"
          transform="rotate(-90 75 75)"
        />
      </svg>
      <div>
        <strong>
          {score}
          <span>/100</span>
        </strong>
        <small>Demo AI Score</small>
      </div>
    </div>
  );
}
