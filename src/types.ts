export interface RouteData {
  id: string;
  summary: string;
  duration: string;
  distance: string;
  polyline: string;
  isRecommended: boolean;
  recommendationReason: string;
  chaosScore: number;
  trafficSeverity: 'Low' | 'Moderate' | 'Heavy' | 'Extreme';
}

export interface PredictionData {
  chaosScore: number;
  summary: string;
  streetVoice: string;
  localIntel: string[];
  routes: RouteData[];
}
