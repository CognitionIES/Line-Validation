
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface FilterPanelProps {
  filters: {
    showComplete: boolean;
    showMissingUpvf: boolean;
    showMissingUpvc: boolean;
    showMissingBoth: boolean;
  };
  onFiltersChange: (filters: any) => void;
  resultCounts: {
    complete: number;
    missingUpvf: number;
    missingUpvc: number;
    missingBoth: number;
  };
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, resultCounts }) => {
  const handleFilterChange = (filterKey: string, checked: boolean) => {
    onFiltersChange({
      ...filters,
      [filterKey]: checked,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </CardTitle>
        <CardDescription>
          Show or hide different types of results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="complete"
                checked={filters.showComplete}
                onCheckedChange={(checked) => handleFilterChange('showComplete', checked as boolean)}
              />
              <Label htmlFor="complete" className="text-sm">Complete Matches</Label>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              {resultCounts.complete}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="missing-upvf"
                checked={filters.showMissingUpvf}
                onCheckedChange={(checked) => handleFilterChange('showMissingUpvf', checked as boolean)}
              />
              <Label htmlFor="missing-upvf" className="text-sm">Missing UPVF</Label>
            </div>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              {resultCounts.missingUpvf}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="missing-upvc"
                checked={filters.showMissingUpvc}
                onCheckedChange={(checked) => handleFilterChange('showMissingUpvc', checked as boolean)}
              />
              <Label htmlFor="missing-upvc" className="text-sm">Missing UPVC</Label>
            </div>
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              {resultCounts.missingUpvc}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="missing-both"
                checked={filters.showMissingBoth}
                onCheckedChange={(checked) => handleFilterChange('showMissingBoth', checked as boolean)}
              />
              <Label htmlFor="missing-both" className="text-sm">Missing Both</Label>
            </div>
            <Badge className="bg-red-100 text-red-800 border-red-200">
              {resultCounts.missingBoth}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
