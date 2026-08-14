import { RecommendationHero } from '@/components/outfit/RecommendationHero';
import type { OutfitRecommendation } from '@/types/domain';

type Props = {
  recommendation: OutfitRecommendation;
  onWear: () => void;
  onAnother: () => void;
  wearLoading?: boolean;
};

/** @deprecated Prefer RecommendationHero for new outfit surfaces. */
export function OutfitCard({ recommendation, onWear, onAnother, wearLoading = false }: Props) {
  return (
    <RecommendationHero
      recommendation={recommendation}
      wearLoading={wearLoading}
      onWear={onWear}
      onAnother={onAnother}
    />
  );
}
