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
  brand: 'FOBA',

  status: {
    onTrack: true,
    chipLabel: 'Network growing',
    headline: 'Your creators are\nin good shape.',
    sub: '8 of 11 creators on or above their growth target today.',
    trend: {
      value: '+1 creator on target',
      label: '+1 creator on target',
      context: 'vs yesterday',
    },
  },

  focus: {
    venue: 'TechTalk Daily',
    issue: 'Upload cadence has slipped — 12 days since last video, the longest gap in 6 months.',
    impact: 'Protecting 2.1M subscriber momentum',
    ctaLabel: 'Review content calendar',
  },

  metrics: [
    {
      id: 'experiments',
      value: '24',
      label: 'Experiments',
      sub: 'Running now',
      tier: 'success',
    },
    {
      id: 'needs-review',
      value: '2',
      label: 'Need review',
      sub: 'Require your attention',
      tier: 'warning',
    },
    {
      id: 'at-risk',
      value: '1',
      label: 'At risk',
      sub: 'Creator needs support',
      tier: 'neutral',
    },
  ],
};

export default snapshot;
