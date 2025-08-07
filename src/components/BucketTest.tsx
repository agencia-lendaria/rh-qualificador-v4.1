import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

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
      <h2 className="text-xl font-bold mb-4">Bucket Test</h2>
      
      <div className="space-y-4">
        <button
          onClick={() => testBucket('curriculum-uploads')}
          className="w-full p-2 bg-blue-500 text-white rounded"
        >
          Test curriculum-uploads bucket
        </button>
        
        <button
          onClick={() => testBucket('cv-bucket')}
          className="w-full p-2 bg-green-500 text-white rounded"
        >
          Test cv-bucket
        </button>
        
        <div>
          <input
            type="file"
            onChange={(e) => setTestFile(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          onClick={testUpload}
          disabled={!testFile}
          className="w-full p-2 bg-purple-500 text-white rounded disabled:bg-gray-300"
        >
          Test Upload
        </button>
        
        <div className="p-4 bg-gray-100 rounded">
          <pre className="text-sm">{result}</pre>
        </div>
      </div>
    </div>
  );
};

export default BucketTest; 