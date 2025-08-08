import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const BucketTest: React.FC = () => {
  const [testFile, setTestFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');

  const testBucket = async (bucketName: string) => {
    try {
      setResult(`Testing ${bucketName} bucket...`);
      
      // Try to list files in the bucket
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list();

      if (error) {
        setResult(`Error with ${bucketName}: ${error.message}`);
        return false;
      }

      setResult(`${bucketName} bucket exists and is accessible. Files: ${data?.length || 0}`);
      return true;
    } catch (error) {
      setResult(`Exception with ${bucketName}: ${error}`);
      return false;
    }
  };

  const testUpload = async () => {
    if (!testFile) {
      setResult('Please select a file first');
      return;
    }

    try {
      setResult('Testing upload to curriculum-uploads...');
      
      const fileName = `test_${Date.now()}_${testFile.name}`;
      const { error } = await supabase.storage
        .from('curriculum-uploads')
        .upload(fileName, testFile);

      if (error) {
        setResult(`Upload error: ${error.message}`);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('curriculum-uploads')
        .getPublicUrl(fileName);

      setResult(`Upload successful! URL: ${publicUrl}`);
    } catch (error) {
      setResult(`Upload exception: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bucket Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => testBucket('curriculum-uploads')}
          >
            Test curriculum-uploads bucket
          </Button>

          <Button
            variant="success"
            className="w-full"
            onClick={() => testBucket('cv-bucket')}
          >
            Test cv-bucket
          </Button>

          <Input type="file" onChange={(e) => setTestFile(e.target.files?.[0] || null)} />

          <Button className="w-full" onClick={testUpload} disabled={!testFile}>
            Test Upload
          </Button>

          <div className="rounded-md border bg-muted p-4">
            <pre className="text-sm whitespace-pre-wrap break-words">{result}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
};

export default BucketTest; 