import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConfidenceIndicatorProps {
  level: 'Actual' | 'Estimated' | 'Not Available';
  showLabel?: boolean;
}

const CONFIDENCE_CONFIG = {
  'Actual': {
    indicator: '🟢',
    color: 'bg-green-100 text-green-800',
    description: 'Based on verified data'
  },
  'Estimated': {
    indicator: '🟡',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Based on estimates or projections'
  },
  'Not Available': {
    indicator: '🔴',
    color: 'bg-red-100 text-red-800',
    description: 'Data not available'
  }
};

export const ConfidenceIndicator = ({ level, showLabel = true }: ConfidenceIndicatorProps) => {
  const config = CONFIDENCE_CONFIG[level];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${config.color} cursor-help`}>
            <span className="mr-1">{config.indicator}</span>
            {showLabel && level}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
