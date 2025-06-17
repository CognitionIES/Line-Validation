import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { FileText, Download, Upload, Search, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FileUploader from '@/components/FileUploader';
import ResultsTable from '@/components/ResultsTable';
import FilterPanel from '@/components/FilterPanel';
import StatsOverview from '@/components/StatsOverview';

interface FileAnalysisResult {
  lineNumber: string;
  extractedPrefix: string;
  hasUpvf: boolean;
  hasUpvc: boolean;
  status: 'complete' | 'missing-upvf' | 'missing-upvc' | 'missing-both';
  upvfFiles: string[];
  upvcFiles: string[];
}

interface OrphanFile {
  filename: string;
  lineNumber: string;
  extension: string;
}

interface AnalysisStats {
  totalLines: number;
  completeMatches: number;
  missingUpvf: number;
  missingUpvc: number;
  missingBoth: number;
  orphanFiles: number;
  duplicateLines: number;
  blankLines: number;
  malformedEntries: number;
}

const Index = () => {
  const [column1Data, setColumn1Data] = useState('');
  const [column2Data, setColumn2Data] = useState('');
  const [results, setResults] = useState<FileAnalysisResult[]>([]);
  const [orphanFiles, setOrphanFiles] = useState<OrphanFile[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);
  const [filters, setFilters] = useState({
    showComplete: true,
    showMissingUpvf: true,
    showMissingUpvc: true,
    showMissingBoth: true,
  });
  const { toast } = useToast();

  const parseData = (data: string): string[] => {
    return data
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  };

  const extractPrefix = (lineNumber: string): string => {
    // Find the second hyphen and extract everything up to and including it
    const hyphens = [];
    for (let i = 0; i < lineNumber.length; i++) {
      if (lineNumber[i] === '-') {
        hyphens.push(i);
      }
    }
    
    if (hyphens.length >= 2) {
      // Include the second hyphen in the prefix
      return lineNumber.substring(0, hyphens[1] + 1);
    }
    
    // If less than 2 hyphens, return the whole string with a trailing hyphen
    return lineNumber + '-';
  };

  const handleDataLoaded = (column1: string, column2: string) => {
    setColumn1Data(column1);
    setColumn2Data(column2);
  };

  const resultCounts = useMemo(() => {
    return {
      complete: results.filter(r => r.status === 'complete').length,
      missingUpvf: results.filter(r => r.status === 'missing-upvf').length,
      missingUpvc: results.filter(r => r.status === 'missing-upvc').length,
      missingBoth: results.filter(r => r.status === 'missing-both').length,
    };
  }, [results]);

  const analyzeFiles = () => {
    if (!column1Data.trim() || !column2Data.trim()) {
      toast({
        title: "Missing Data",
        description: "Please provide data for both columns.",
        variant: "destructive",
      });
      return;
    }

    const lineNumbers = parseData(column1Data);
    const filenames = parseData(column2Data);

    // Track statistics
    const statsTracker: AnalysisStats = {
      totalLines: 0,
      completeMatches: 0,
      missingUpvf: 0,
      missingUpvc: 0,
      missingBoth: 0,
      orphanFiles: 0,
      duplicateLines: 0,
      blankLines: 0,
      malformedEntries: 0,
    };

    // Process line numbers and extract prefixes
    const processedLineNumbers = lineNumbers
      .filter(line => {
        if (!line.trim()) {
          statsTracker.blankLines++;
          return false;
        }
        return line.trim().length > 0;
      })
      .map(line => ({
        original: line,
        prefix: extractPrefix(line)
      }));

    // Remove duplicates based on prefixes
    const uniqueLineNumbers = processedLineNumbers.filter((item, index, arr) => 
      arr.findIndex(other => other.prefix === item.prefix) === index
    );

    statsTracker.duplicateLines = processedLineNumbers.length - uniqueLineNumbers.length;
    statsTracker.totalLines = uniqueLineNumbers.length;

    // Group filenames by their prefixes
    const upvfFiles: { [key: string]: string[] } = {};
    const upvcFiles: { [key: string]: string[] } = {};
    const orphans: OrphanFile[] = [];

    filenames.forEach(filename => {
      const upvfMatch = filename.match(/^(.+)\.upvf$/i);
      const upvcMatch = filename.match(/^(.+)\.upvc$/i);
      
      if (upvfMatch) {
        const baseFileName = upvfMatch[1];
        // Find which prefix this file matches
        const matchingPrefix = uniqueLineNumbers.find(item => 
          baseFileName.startsWith(item.prefix.slice(0, -1)) // Remove trailing hyphen for comparison
        );
        
        if (matchingPrefix) {
          const prefix = matchingPrefix.prefix;
          if (!upvfFiles[prefix]) upvfFiles[prefix] = [];
          upvfFiles[prefix].push(filename);
        } else {
          orphans.push({
            filename,
            lineNumber: baseFileName,
            extension: 'upvf',
          });
        }
      } else if (upvcMatch) {
        const baseFileName = upvcMatch[1];
        // Find which prefix this file matches
        const matchingPrefix = uniqueLineNumbers.find(item => 
          baseFileName.startsWith(item.prefix.slice(0, -1)) // Remove trailing hyphen for comparison
        );
        
        if (matchingPrefix) {
          const prefix = matchingPrefix.prefix;
          if (!upvcFiles[prefix]) upvcFiles[prefix] = [];
          upvcFiles[prefix].push(filename);
        } else {
          orphans.push({
            filename,
            lineNumber: baseFileName,
            extension: 'upvc',
          });
        }
      } else {
        statsTracker.malformedEntries++;
      }
    });

    // Analyze each prefix
    const analysisResults: FileAnalysisResult[] = uniqueLineNumbers.map(({ original, prefix }) => {
      const hasUpvf = !!upvfFiles[prefix] && upvfFiles[prefix].length > 0;
      const hasUpvc = !!upvcFiles[prefix] && upvcFiles[prefix].length > 0;
      
      let status: FileAnalysisResult['status'];
      if (hasUpvf && hasUpvc) {
        status = 'complete';
        statsTracker.completeMatches++;
      } else if (!hasUpvf && !hasUpvc) {
        status = 'missing-both';
        statsTracker.missingBoth++;
      } else if (!hasUpvf) {
        status = 'missing-upvf';
        statsTracker.missingUpvf++;
      } else {
        status = 'missing-upvc';
        statsTracker.missingUpvc++;
      }

      return {
        lineNumber: original,
        extractedPrefix: prefix,
        hasUpvf,
        hasUpvc,
        status,
        upvfFiles: upvfFiles[prefix] || [],
        upvcFiles: upvcFiles[prefix] || [],
      };
    });

    statsTracker.orphanFiles = orphans.length;

    setResults(analysisResults);
    setOrphanFiles(orphans);
    setStats(statsTracker);

    toast({
      title: "Analysis Complete",
      description: `Analyzed ${statsTracker.totalLines} line numbers and found ${statsTracker.completeMatches} complete matches.`,
    });
  };

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      switch (result.status) {
        case 'complete':
          return filters.showComplete;
        case 'missing-upvf':
          return filters.showMissingUpvf;
        case 'missing-upvc':
          return filters.showMissingUpvc;
        case 'missing-both':
          return filters.showMissingBoth;
        default:
          return true;
      }
    });
  }, [results, filters]);

  const downloadResults = () => {
    const csvContent = [
      ['Line Number', 'Prefix', 'Status', 'UPVF Files', 'UPVC Files'].join(','),
      ...filteredResults.map(result => [
        result.lineNumber,
        result.extractedPrefix,
        result.status,
        result.upvfFiles.join(';'),
        result.upvcFiles.join(';')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'file-analysis-results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadSampleData = () => {
    setColumn1Data(`001-001-001
001-001-002
001-001-003
002-001-001
002-001-002
003-001-001`);
    
    setColumn2Data(`001-001-001.upvf
001-001-001.upvc
001-001-002.upvf
002-001-001.upvf
002-001-001.upvc
003-001-001.upvc`);

    toast({
      title: "Sample Data Loaded",
      description: "Sample data has been loaded into both columns.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">File Analysis Tool</h1>
          <p className="text-gray-600 mt-2">
            Analyze line numbers and file pairs to identify missing UPVF/UPVC files
          </p>
        </div>

        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Input</TabsTrigger>
            <TabsTrigger value="upload">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="manual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Column 1: Line Numbers
                  </CardTitle>
                  <CardDescription>
                    Enter line numbers, one per line (e.g., 001-001-001)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="001-001-001&#10;001-001-002&#10;002-001-001"
                    value={column1Data}
                    onChange={(e) => setColumn1Data(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Column 2: Filenames
                  </CardTitle>
                  <CardDescription>
                    Enter filenames, one per line (e.g., 001-001-001.upvf)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="001-001-001.upvf&#10;001-001-001.upvc&#10;001-001-002.upvf"
                    value={column2Data}
                    onChange={(e) => setColumn2Data(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button onClick={analyzeFiles} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Analyze Files
              </Button>
              <Button onClick={loadSampleData} variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Load Sample Data
              </Button>
              {results.length > 0 && (
                <Button onClick={downloadResults} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Results
                </Button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <FileUploader onDataLoaded={handleDataLoaded} />
          </TabsContent>
        </Tabs>

        {stats && (
          <StatsOverview stats={stats} />
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <h2 className="text-xl font-semibold">Analysis Results</h2>
              <FilterPanel 
                filters={filters} 
                onFiltersChange={setFilters} 
                resultCounts={resultCounts}
              />
            </div>
            
            <ResultsTable results={filteredResults} />

            {orphanFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    Orphan Files ({orphanFiles.length})
                  </CardTitle>
                  <CardDescription>
                    Files that don't match any line number prefixes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {orphanFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                        <Badge variant="outline" className="text-xs">
                          {file.extension.toUpperCase()}
                        </Badge>
                        <span className="font-mono text-sm">{file.filename}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
