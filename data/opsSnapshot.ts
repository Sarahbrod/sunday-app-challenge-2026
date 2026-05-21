export type MetricTier = 'success' | 'warning' | 'neutral';

export interface OpsMetric {
  id: string;
  value: string;
  label: string;
  sub: string;
  tier: MetricTier;
}

export interface OpsFocus {
  venue: string;
  issue: string;
  impact: string;
  ctaLabel: string;
}

export interface OpsStatus {
  onTrack: boolean;
  chipLabel: string;
  headline: string;
  sub: string;
  trend: {
    value: string;
    label: string;
    context: string;
  };
}

export interface OpsSnapshot {
  brand: string;
  status: OpsStatus;
  focus: OpsFocus;
  metrics: OpsMetric[];
}

const snapshot: OpsSnapshot = {
  brand: 'Dishoom',

  status: {
    onTrack: true,
    chipLabel: 'All systems on track',
    headline: 'The house is\nin good shape.',
    sub: '8 of 11 houses on or above target today.',
    trend: {
      value: '+1 location on target',
      label: '+1 location on target',
      context: 'vs yesterday',
    },
  },

  focus: {
    venue: 'Shoreditch',
    issue: 'Labour cost 4% above target. Rota overlap between 2 and 4pm.',
    impact: 'Fixing this saves ~£420 this week',
    ctaLabel: 'Review rota',
  },

  metrics: [
    {
      id: 'opportunities',
      value: '3',
      label: 'Opportunities',
      sub: 'Pacing above forecast',
      tier: 'success',
    },
    {
      id: 'needs-review',
      value: '1',
      label: 'Needs review',
      sub: 'Requires your attention',
      tier: 'warning',
    },
    {
      id: 'at-risk',
      value: '0',
      label: 'At risk',
      sub: 'No critical issues',
      tier: 'neutral',
    },
  ],
};

export default snapshot;
