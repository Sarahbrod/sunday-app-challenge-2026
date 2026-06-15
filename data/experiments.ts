export type ExperimentStatus = 'active' | 'completed' | 'paused';
export type ExperimentWinner = 'variant' | 'control' | 'inconclusive';
export type ImpactLevel = 'Low' | 'Medium' | 'High';
export type SignalDir = 'up' | 'down' | 'neutral';

export interface ExperimentTemplate {
  id: string;
  category: string;
  name: string;
  description: string;
  defaultHypothesis: string;
  successMetric: string;
  avgImpact: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeToResult: string;
  icon: string;
}

export interface ActiveExperiment {
  id: string;
  creator: string;
  templateId: string;
  title: string;
  hypothesis: string;
  variable: string;
  successMetric: string;
  target: string;
  startDate: string;
  daysRunning: number;
  expectedImpact: ImpactLevel;
  confidence: number;
  status: ExperimentStatus;
  signal: SignalDir;
  currentLift: string;
}

export interface AIReport {
  whatHappened: string;
  whyItMayHave: string;
  whatWeLearned: string;
  whatToTestNext: string;
}

export interface CompletedExperiment {
  id: string;
  creator: string;
  templateId: string;
  title: string;
  successMetric: string;
  metricUnit: string;
  baseline: number;
  result: number;
  lift: string;
  winner: ExperimentWinner;
  significance: number;
  completedDate: string;
  aiReport: AIReport;
}

export interface RecommendedExperiment {
  id: string;
  creator: string;
  templateId: string;
  templateName: string;
  rationale: string;
  expectedImpact: ImpactLevel;
  confidence: number;
}

export interface PlaybookEntry {
  creator: string;
  finding: string;
  source: string;
  implementedDate: string;
  impact: string;
  category: string;
}

export const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
  {
    id: 'thumbnail-concept',
    category: 'Thumbnail',
    name: 'Thumbnail A/B test',
    description: 'Test two thumbnail concepts — emotion vs. curiosity, face vs. no-face, text vs. minimal.',
    defaultHypothesis: 'A thumbnail showing a clear emotional reaction will outperform a text-heavy thumbnail.',
    successMetric: 'CTR',
    avgImpact: '+18% CTR',
    difficulty: 'Easy',
    timeToResult: '1–2 weeks',
    icon: '🖼️',
  },
  {
    id: 'title-framing',
    category: 'Title',
    name: 'Title framing test',
    description: 'Test title structures — question vs. statement, curiosity gap vs. direct value, numbers vs. none.',
    defaultHypothesis: 'A question-format title will generate higher CTR by triggering curiosity.',
    successMetric: 'CTR',
    avgImpact: '+12% CTR',
    difficulty: 'Easy',
    timeToResult: '1–2 weeks',
    icon: '✍️',
  },
  {
    id: 'intro-hook',
    category: 'Hook',
    name: 'Intro / hook test',
    description: 'Test opening structures — direct answer first, bold claim, story cold-open, or question hook.',
    defaultHypothesis: 'Starting with the core answer in the first 15 seconds will improve 30-second retention.',
    successMetric: '30s retention',
    avgImpact: '+22% retention',
    difficulty: 'Medium',
    timeToResult: '2–3 weeks',
    icon: '⚡',
  },
  {
    id: 'description-seo',
    category: 'Description',
    name: 'Description SEO test',
    description: 'Test keyword-optimised descriptions with timestamps vs. minimal descriptions.',
    defaultHypothesis: 'A fully optimised description with keywords in the first 2 lines will increase search impressions.',
    successMetric: 'Search impressions',
    avgImpact: '+15% search views',
    difficulty: 'Easy',
    timeToResult: '3–4 weeks',
    icon: '🔍',
  },
  {
    id: 'chapters',
    category: 'Chapters',
    name: 'Chapter markers test',
    description: 'Test adding detailed chapter markers vs. no chapters to measure watch time and re-watch behaviour.',
    defaultHypothesis: 'Adding chapter markers will increase average view duration by making the video feel navigable.',
    successMetric: 'Avg view duration',
    avgImpact: '+11% watch time',
    difficulty: 'Easy',
    timeToResult: '2 weeks',
    icon: '📑',
  },
  {
    id: 'pinned-comment',
    category: 'Pinned comment',
    name: 'Pinned comment CTA',
    description: 'Test a pinned comment that drives a specific action — debate question, subscribe, or link.',
    defaultHypothesis: 'A pinned comment asking a direct question will increase comment engagement rate.',
    successMetric: 'Comment engagement',
    avgImpact: '+25% comments',
    difficulty: 'Easy',
    timeToResult: '1 week',
    icon: '📌',
  },
  {
    id: 'channel-trailer',
    category: 'Channel trailer',
    name: 'Channel trailer test',
    description: 'Test trailer formats — story-led vs. value proposition vs. highlight reel.',
    defaultHypothesis: 'A value-first channel trailer will convert more non-subscriber visits.',
    successMetric: 'Subscriber conversion',
    avgImpact: '+8% conversion',
    difficulty: 'Hard',
    timeToResult: '4 weeks',
    icon: '🎬',
  },
  {
    id: 'playlist-structure',
    category: 'Playlist',
    name: 'Playlist structure test',
    description: 'Test topic-based playlists vs. chronological order to measure session watch time.',
    defaultHypothesis: 'Topic-based playlists will increase session duration as viewers follow curated paths.',
    successMetric: 'Session duration',
    avgImpact: '+19% session time',
    difficulty: 'Medium',
    timeToResult: '3 weeks',
    icon: '📋',
  },
  {
    id: 'shorts-cta',
    category: 'Shorts CTA',
    name: 'Shorts-to-longform CTA',
    description: 'Test different end-card strategies on Shorts to drive viewers to long-form content.',
    defaultHypothesis: 'A Shorts end screen with a direct teaser question will convert more viewers to long-form.',
    successMetric: 'Longform click-through',
    avgImpact: '+31% crossover',
    difficulty: 'Medium',
    timeToResult: '1–2 weeks',
    icon: '📱',
  },
  {
    id: 'guest-packaging',
    category: 'Guest packaging',
    name: 'Guest packaging test',
    description: "Test how guest episodes are packaged — guest name vs. topic first in title, face vs. graphic thumbnail.",
    defaultHypothesis: "Leading with the guest's name in the title will outperform a topic-first title.",
    successMetric: 'CTR',
    avgImpact: '+14% CTR',
    difficulty: 'Easy',
    timeToResult: '1 week',
    icon: '🎙️',
  },
];

export const ACTIVE_EXPERIMENTS: ActiveExperiment[] = [
  { id: 'exp-001', creator: 'TechTalk Daily',   templateId: 'intro-hook',        title: 'Direct answer vs. story opener',         hypothesis: 'Starting with the core answer in the first 15 seconds will improve 30-second retention vs. the current story opener.',                        variable: 'First 15 seconds structure',          successMetric: '30s audience retention', target: '+15%', startDate: '2026-06-02', daysRunning: 13, expectedImpact: 'High',   confidence: 78, status: 'active', signal: 'up',      currentLift: '+8%'  },
  { id: 'exp-002', creator: 'Everyday Finance', templateId: 'thumbnail-concept', title: 'Emotion face vs. clean graphic thumbnail',hypothesis: 'A thumbnail showing a clear emotional reaction will outperform a clean graphic thumbnail.',                                                      variable: 'Thumbnail style (face vs. graphic)',   successMetric: 'CTR',                   target: '+20%', startDate: '2026-06-05', daysRunning: 10, expectedImpact: 'High',   confidence: 82, status: 'active', signal: 'up',      currentLift: '+14%' },
  { id: 'exp-003', creator: 'Pod & Chill',      templateId: 'guest-packaging',   title: "Guest name-first vs. topic-first titles", hypothesis: "Leading with the guest's name in the episode title will drive higher CTR than leading with the topic.",                                    variable: 'Title structure (name vs. topic)',     successMetric: 'CTR',                   target: '+10%', startDate: '2026-06-08', daysRunning:  7, expectedImpact: 'Medium', confidence: 65, status: 'active', signal: 'neutral', currentLift: '+2%'  },
  { id: 'exp-004', creator: 'GameStream Live',  templateId: 'shorts-cta',        title: 'Shorts end-screen CTA test',             hypothesis: 'A Shorts end screen with a direct teaser question will drive more viewers to the full stream.',                                              variable: 'End screen copy & structure',          successMetric: 'Longform CTR',          target: '+25%', startDate: '2026-06-01', daysRunning: 14, expectedImpact: 'Medium', confidence: 71, status: 'active', signal: 'down',    currentLift: '-3%'  },
  { id: 'exp-005', creator: 'Sarah Codes',      templateId: 'description-seo',   title: 'Keyword-optimised description test',     hypothesis: 'A fully keyword-optimised description with key terms in the first 2 lines will increase search impressions by 15%.',                       variable: 'Description structure & keyword density', successMetric: 'Search impressions', target: '+15%', startDate: '2026-05-28', daysRunning: 18, expectedImpact: 'Medium', confidence: 74, status: 'active', signal: 'up',      currentLift: '+11%' },
  { id: 'exp-006', creator: 'Vlog Universe',    templateId: 'title-framing',     title: 'Question vs. statement title format',    hypothesis: 'A question-format title will generate higher CTR by triggering curiosity compared to a direct statement.',                                 variable: 'Title format (question vs. statement)', successMetric: 'CTR',                 target: '+10%', startDate: '2026-06-09', daysRunning:  6, expectedImpact: 'Medium', confidence: 60, status: 'active', signal: 'neutral', currentLift: '+1%'  },
  { id: 'exp-007', creator: 'Creative Brief',   templateId: 'pinned-comment',    title: 'Pinned question vs. pinned link',        hypothesis: 'A pinned comment with a direct question will generate more engagement than a pinned comment with a subscription link.',                    variable: 'Pinned comment type',                 successMetric: 'Comment rate',          target: '+20%', startDate: '2026-06-10', daysRunning:  5, expectedImpact: 'Low',    confidence: 55, status: 'active', signal: 'up',      currentLift: '+18%' },
  { id: 'exp-008', creator: 'Morning Mindset',  templateId: 'chapters',          title: 'Episode chapters vs. no chapters',       hypothesis: 'Adding detailed chapter markers will increase average listen duration by making the episode feel more navigable.',                          variable: 'Chapter markers (present vs. absent)', successMetric: 'Avg listen duration',  target: '+10%', startDate: '2026-06-03', daysRunning: 12, expectedImpact: 'Medium', confidence: 68, status: 'active', signal: 'up',      currentLift: '+7%'  },
];

export const COMPLETED_EXPERIMENTS: CompletedExperiment[] = [
  {
    id: 'exp-c001', creator: 'TechTalk Daily', templateId: 'thumbnail-concept',
    title: 'Thumbnail A/B: emotion vs. graphic',
    successMetric: 'CTR', metricUnit: '%',
    baseline: 6.2, result: 9.4, lift: '+51.6%', winner: 'variant', significance: 98,
    completedDate: '2026-05-28',
    aiReport: {
      whatHappened: 'The emotion-forward thumbnail (showing a visible reaction face) outperformed the clean graphic thumbnail by 51.6% on CTR across 14 videos over 3 weeks.',
      whyItMayHave: 'Human faces trigger instinctive attention in feed environments. The reaction face created a curiosity gap — viewers wanted to know what caused the reaction — which the graphic thumbnail failed to generate.',
      whatWeLearned: "Emotion-forward thumbnails are significantly more effective for this channel. The audience responds strongly to faces showing genuine reactions, particularly surprise and intensity.",
      whatToTestNext: 'Test different emotional expressions — intensity vs. curiosity vs. joy — to find the strongest performing emotion archetype for this audience.',
    },
  },
  {
    id: 'exp-c002', creator: 'Everyday Finance', templateId: 'intro-hook',
    title: 'Value-first opener vs. story intro',
    successMetric: '30s retention', metricUnit: '%',
    baseline: 58, result: 74, lift: '+27.6%', winner: 'variant', significance: 95,
    completedDate: '2026-05-20',
    aiReport: {
      whatHappened: 'Opening videos with the core financial insight in the first 15 seconds lifted 30-second retention from 58% to 74% across 8 videos.',
      whyItMayHave: 'The finance audience comes with a specific question. Delaying the answer with a story creates friction and drop-off. Front-loading value confirms the click was worth making.',
      whatWeLearned: 'This audience is outcome-oriented. They want to know they\'re in the right place within 15 seconds. Story intros work against this channel.',
      whatToTestNext: 'Test the ideal length of the value statement — 10s vs. 20s vs. 30s — before transitioning to deeper context.',
    },
  },
  {
    id: 'exp-c003', creator: 'Pod & Chill', templateId: 'playlist-structure',
    title: 'Topic playlists vs. chronological',
    successMetric: 'Session duration', metricUnit: 'min',
    baseline: 22, result: 31, lift: '+40.9%', winner: 'variant', significance: 92,
    completedDate: '2026-05-15',
    aiReport: {
      whatHappened: 'Reorganising episodes into topic-based playlists increased average session duration from 22 minutes to 31 minutes.',
      whyItMayHave: 'Listeners who enjoy one episode on a topic want more on the same topic. Chronological feeds force manual search. Playlists reduce friction and create natural autoplay sequences.',
      whatWeLearned: 'Session duration is gated by discoverability of related content. Structure matters as much as content quality for session depth.',
      whatToTestNext: 'Test playlist title framing — topic names vs. audience need states (e.g. "Career" vs. "When you hate your job").',
    },
  },
  {
    id: 'exp-c004', creator: 'Sarah Codes', templateId: 'title-framing',
    title: 'How-to vs. question title format',
    successMetric: 'CTR', metricUnit: '%',
    baseline: 4.1, result: 3.8, lift: '-7.3%', winner: 'control', significance: 89,
    completedDate: '2026-05-10',
    aiReport: {
      whatHappened: 'Question-format titles (e.g. "Why is your code slow?") underperformed against "How to" titles with a CTR drop of 7.3%.',
      whyItMayHave: 'The coding audience is intent-driven and prefers explicit value signals. Questions create ambiguity. "How to" promises a specific skill transfer.',
      whatWeLearned: 'For tutorial content, clarity of outcome beats curiosity gaps. This audience is looking for a skill, not entertainment.',
      whatToTestNext: 'Test specificity within How-to titles — broad ("write better code") vs. specific ("reduce API response time by 80%").',
    },
  },
  {
    id: 'exp-c005', creator: 'GameStream Live', templateId: 'pinned-comment',
    title: 'Pinned debate question vs. subscribe CTA',
    successMetric: 'Comment rate', metricUnit: '%',
    baseline: 2.1, result: 4.8, lift: '+128.6%', winner: 'variant', significance: 99,
    completedDate: '2026-05-05',
    aiReport: {
      whatHappened: 'A pinned comment posing a debate question increased comment engagement rate from 2.1% to 4.8% — more than doubling it.',
      whyItMayHave: 'Gaming audiences are opinion-driven and enjoy asserting their views. A debate prompt gives them a reason to comment. The subscribe CTA has no emotional trigger.',
      whatWeLearned: 'Engagement rate is driven by emotional permission to participate. Debate questions are significantly more effective than direct CTAs for this audience.',
      whatToTestNext: 'Test debate questions specific to the video vs. general gaming debates, to see if specificity drives even higher engagement.',
    },
  },
];

export const RECOMMENDED_EXPERIMENTS: RecommendedExperiment[] = [
  { id: 'rec-001', creator: 'ByteSize News',    templateId: 'thumbnail-concept', templateName: 'Thumbnail A/B test',        rationale: 'CTR is at a historic low (4.2%). TechTalk Daily saw +51.6% CTR from an identical test. Highest urgency in the network.',        expectedImpact: 'High',   confidence: 88 },
  { id: 'rec-002', creator: 'Vlog Universe',    templateId: 'intro-hook',        templateName: 'Intro / hook test',         rationale: 'Watch time per session dropped 22% after the daily upload pivot. A stronger hook could recover early retention fast.',           expectedImpact: 'High',   confidence: 74 },
  { id: 'rec-003', creator: 'TechTalk Daily',   templateId: 'title-framing',     templateName: 'Title framing test',        rationale: 'Channel is strong. A title test could compound existing gains. Low effort, meaningful upside.',                                   expectedImpact: 'Medium', confidence: 70 },
  { id: 'rec-004', creator: 'GameStream Live',  templateId: 'shorts-cta',        templateName: 'Shorts-to-longform CTA',    rationale: 'Subscriber growth is stalling. Improving Shorts crossover to long-form could be the catalyst for re-acceleration.',              expectedImpact: 'Medium', confidence: 66 },
  { id: 'rec-005', creator: 'Morning Mindset',  templateId: 'guest-packaging',   templateName: 'Guest packaging test',      rationale: 'Guest episodes consistently underperform solo episodes by 18%. A packaging test could close most of that gap.',                  expectedImpact: 'Medium', confidence: 62 },
];

export const PLAYBOOK: PlaybookEntry[] = [
  { creator: 'TechTalk Daily',   category: 'Thumbnail',    finding: 'Emotion-forward thumbnails with visible reaction faces drive +51% CTR. Always include a face showing a clear reaction.',         source: 'Thumbnail A/B test (May 2026)',         implementedDate: '2026-06-01', impact: '+51.6% CTR'         },
  { creator: 'Everyday Finance', category: 'Hook',         finding: 'Front-load the core financial insight in the first 15 seconds. Value-first openers improve 30s retention by +28%.',             source: 'Value-first opener test (May 2026)',    implementedDate: '2026-05-22', impact: '+27.6% 30s retention' },
  { creator: 'Pod & Chill',      category: 'Playlist',     finding: 'Topic-based playlists drive +41% session duration. Organise all episodes into themed series, not chronological feeds.',         source: 'Playlist structure test (May 2026)',    implementedDate: '2026-05-18', impact: '+40.9% session time'  },
  { creator: 'GameStream Live',  category: 'Engagement',   finding: 'Debate questions in pinned comments more than double engagement rate vs. subscribe CTAs. Use opinion prompts on every video.',   source: 'Pinned comment test (May 2026)',        implementedDate: '2026-05-08', impact: '+128.6% comment rate' },
  { creator: 'Sarah Codes',      category: 'Title',        finding: 'How-to titles outperform question titles by 7%. Lead with specific skill transfer ("How to X") not curiosity gaps ("Why Y?").', source: 'Title framing test (May 2026)',         implementedDate: '2026-05-13', impact: '+7.3% CTR (reversal)' },
];

export const GROWTH_SCORE = {
  overall: 74,
  delta: +3,
  breakdown: [
    { label: 'Experiment velocity', score: 80, note: '8 active · 4/month avg' },
    { label: 'Win rate',            score: 67, note: '4 of 5 completed positive' },
    { label: 'Implementation',      score: 75, note: '4 of 5 wins applied' },
  ],
};
