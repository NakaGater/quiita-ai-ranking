export const TARGET_TAGS = [
  'AI',
  '機械学習',
  'MachineLearning',
  'LLM',
  'ChatGPT',
  'GPT',
  '深層学習',
  'DeepLearning',
  'NLP',
  '自然言語処理',
  '生成AI',
  'Transformer',
  'TensorFlow',
  'PyTorch',
  'OpenAI',
  'Gemini',
  'Claude',
  'LangChain',
  'rag',
] as const;

export const SCORING_WEIGHTS = {
  likes: 3,
  stocks: 2,
  freshness: 1,
} as const;

export const PERIOD_DAYS = 30;
export const RANKING_SIZE = 50;

export const QIITA_API_BASE_URL = 'https://qiita.com/api/v2';
export const QIITA_PER_PAGE = 100;
export const QIITA_MAX_PAGES_PER_TAG = 5;
export const RATE_LIMIT_MIN_REMAINING = 10;
export const RATE_LIMIT_DELAY_MS = 100;
