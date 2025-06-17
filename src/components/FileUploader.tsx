
import React, { useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploaderProps {
  onDataLoaded: (column1: string, column2: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
  const { toast } = useToast();

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      parseFileContent(content, file.name);
    };
    reader.readAsText(file);
  }, []);

  const parseFileContent = (content: string, filename: string) => {
    try {
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      
      if (filename.toLowerCase().includes('csv')) {
        // Parse CSV format
        const rows = lines.map(line => line.split(',').map(cell => cell.trim()));
        if (rows.length > 0 && rows[0].length >= 2) {
          const column1 = rows.map(row => row[0]).filter(Boolean).join('\n');
          const column2 = rows.map(row => row[1]).filter(Boolean).join('\n');
          onDataLoaded(column1, column2);
          
          toast({
            title: "File Loaded Successfully",
            description: `Parsed ${rows.length} rows from CSV file.`,
          });
        } else {
          throw new Error('CSV file must have at least 2 columns');
        }
      } else {
        // Assume text format with tab or space separation
        const rows = lines.map(line => {
          const parts = line.split(/\s+/);
          return parts.length >= 2 ? parts : [parts[0], ''];
        });
        
        const column1 = rows.map(row => row[0]).filter(Boolean).join('\n');
        const column2 = rows.map(row => row[1]).filter(Boolean).join('\n');
        onDataLoaded(column1, column2);
        
        toast({
          title: "File Loaded Successfully",
          description: `Parsed ${rows.length} rows from text file.`,
        });
      }
    } catch (error) {
      toast({
        title: "File Parse Error",
        description: `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <Upload className="h-6 w-6" />
          <span>Upload File</span>
        </CardTitle>
        <CardDescription>
          Supports CSV and text files with tab or space-separated columns
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <input
          type="file"
          accept=".csv,.txt,.tsv"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button variant="outline" className="cursor-pointer" asChild>
            <span>Choose File</span>
          </Button>
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Maximum file size: 10MB
        </p>
      </CardContent>
    </Card>
  );
};

export default FileUploader;
