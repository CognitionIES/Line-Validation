
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface FileAnalysisResult {
  lineNumber: string;
  extractedPrefix: string;
  hasUpvf: boolean;
  hasUpvc: boolean;
  status: 'complete' | 'missing-upvf' | 'missing-upvc' | 'missing-both';
  upvfFiles: string[];
  upvcFiles: string[];
}

interface ResultsTableProps {
  results: FileAnalysisResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'missing-both':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Complete</Badge>;
      case 'missing-upvf':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Missing UPVF</Badge>;
      case 'missing-upvc':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Missing UPVC</Badge>;
      case 'missing-both':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Missing Both</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No results to display. Adjust your filters or run the analysis.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">Original Line #</TableHead>
            <TableHead className="w-24">Prefix</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">UPVF</TableHead>
            <TableHead className="text-center">UPVC</TableHead>
            <TableHead>UPVF Files</TableHead>
            <TableHead>UPVC Files</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result) => (
            <TableRow key={result.lineNumber} className="hover:bg-gray-50">
              <TableCell className="font-mono font-medium text-sm">
                {result.lineNumber}
              </TableCell>
              <TableCell className="font-mono font-medium text-sm">
                <Badge variant="outline" className="text-xs">
                  {result.extractedPrefix}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(result.status)}
                  {getStatusBadge(result.status)}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {result.hasUpvf ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                )}
              </TableCell>
              <TableCell className="text-center">
                {result.hasUpvc ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mx-auto" />
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {result.upvfFiles.length > 0 ? (
                    result.upvfFiles.map((file, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {file}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">None</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {result.upvcFiles.length > 0 ? (
                    result.upvcFiles.map((file, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {file}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">None</span>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ResultsTable;
