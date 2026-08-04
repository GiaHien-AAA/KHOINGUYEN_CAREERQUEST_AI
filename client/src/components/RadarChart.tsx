export interface RadarMetric {
  label: string;
  value: number;
  shortLabel?: string;
}

interface RadarChartProps {
  metrics: RadarMetric[];
  size?: number;
}

export function RadarChart({ metrics, size = 320 }: RadarChartProps) {
  const safeMetrics = metrics.slice(0, 6);
  const center = size / 2;
  const radius = size * 0.33;
  const rings = [0.25, 0.5, 0.75, 1];

  const points = safeMetrics.map((metric, index) => {
    const angle = (Math.PI * 2 * index) / safeMetrics.length - Math.PI / 2;
    const valueRadius = radius * clamp(metric.value, 0, 100) / 100;
    return {
      x: center + Math.cos(angle) * valueRadius,
      y: center + Math.sin(angle) * valueRadius,
    };
  });

  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(' ');

  return (
    <div className="w-full overflow-hidden border-4 border-[#4d568c] bg-[#0b1022] p-3 shadow-[6px_6px_0_#070a17]">
      <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[360px]">
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8be9fd" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.08" />
          </radialGradient>
        </defs>

        {rings.map((ring) => {
          const ringPoints = safeMetrics
            .map((_, index) => {
              const angle = (Math.PI * 2 * index) / safeMetrics.length - Math.PI / 2;
              const ringRadius = radius * ring;
              return `${center + Math.cos(angle) * ringRadius},${center + Math.sin(angle) * ringRadius}`;
            })
            .join(' ');

          return (
            <polygon
              key={ring}
              points={ringPoints}
              fill="none"
              stroke="#4d568c"
              strokeWidth="2"
              opacity={ring === 1 ? 0.95 : 0.55}
            />
          );
        })}

        {safeMetrics.map((metric, index) => {
          const angle = (Math.PI * 2 * index) / safeMetrics.length - Math.PI / 2;
          const axisX = center + Math.cos(angle) * radius;
          const axisY = center + Math.sin(angle) * radius;
          const labelX = center + Math.cos(angle) * (radius + 33);
          const labelY = center + Math.sin(angle) * (radius + 33);

          return (
            <g key={metric.label}>
              <line x1={center} y1={center} x2={axisX} y2={axisY} stroke="#30375f" strokeWidth="2" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffe066"
                fontSize="11"
                fontWeight="900"
              >
                {metric.shortLabel || metric.label}
              </text>
            </g>
          );
        })}

        <polygon points={polygonPoints} fill="url(#radarGlow)" stroke="#8be9fd" strokeWidth="4" />

        {points.map((point, index) => (
          <g key={`${point.x}-${point.y}`}>
            <circle cx={point.x} cy={point.y} r="6" fill="#ffe066" stroke="#070a17" strokeWidth="3" />
            <text
              x={point.x}
              y={point.y - 12}
              textAnchor="middle"
              fill="#ffffff"
              fontSize="10"
              fontWeight="900"
            >
              {safeMetrics[index].value}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
