import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UploadMenu({ onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus(null);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus(null);

    try {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        setStatus({ type: 'error', message: 'Please upload a CSV file' });
        setUploading(false);
        return;
      }

      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Use InvokeLLM to parse the CSV with more flexibility
      const csvResponse = await fetch(file_url);
      const csvText = await csvResponse.text();
      
      const llmResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Parse this CSV data and extract menu items. Return an array of objects with: date (YYYY-MM-DD format), food (item name), and allergyAccommodations (comma-separated codes if present).

CSV data:
${csvText}`,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  food: { type: "string" },
                  allergyAccommodations: { type: "string" }
                },
                required: ["date", "food"]
              }
            }
          },
          required: ["items"]
        }
      });

      if (llmResult && llmResult.items && llmResult.items.length > 0) {
        // Group by date
        const menuByDate = {};
        llmResult.items.forEach(item => {
          if (!menuByDate[item.date]) {
            menuByDate[item.date] = {
              date: item.date,
              menuItems: [],
              specialNotes: ''
            };
          }

          // Parse allergy accommodations
          const accommodations = (item.allergyAccommodations || '').toLowerCase();
          
          menuByDate[item.date].menuItems.push({
            itemName: item.food,
            description: '',
            isGF: accommodations.includes('gf') && !accommodations.includes('gfa'),
            isGFA: accommodations.includes('gfa'),
            isVEG: accommodations.includes('veg') && !accommodations.includes('vgn'),
            isVGN: accommodations.includes('vgn') && !accommodations.includes('vgna'),
            isDF: accommodations.includes('df') && !accommodations.includes('dfa'),
            isDFA: accommodations.includes('dfa'),
            isVGNA: accommodations.includes('vgna')
          });
        });

        // Create menu days
        await base44.entities.MenuDay.bulkCreate(Object.values(menuByDate));
        
        setStatus({ type: 'success', message: 'Menu uploaded successfully!' });
        setFile(null);
        onUploadComplete();
      } else {
        setStatus({ type: 'error', message: 'Failed to parse CSV. Please check your file format.' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus({ 
        type: 'error', 
        message: 'Upload failed: ' + (error?.message || 'Unknown error')
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/60 p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-slate-900">Upload Menu (CSV Only)</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="menu-file" className="text-sm text-slate-700 mb-2 block">
            Select CSV file
          </Label>
          <Input
            id="menu-file"
            type="file"
            accept=".csv,text/csv,application/csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-700 font-medium mb-2">CSV Format Requirements:</p>
            <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
              <li><strong>Required columns:</strong> date, food</li>
              <li><strong>Optional column:</strong> allergyAccommodations (or similar)</li>
              <li><strong>Date format:</strong> YYYY-MM-DD (e.g., 2024-02-15)</li>
              <li><strong>Allergy codes:</strong> GF, GFA, VEG, VGN, DF, DFA, VGNA (comma-separated)</li>
              <li>Save as CSV (UTF-8) from Excel before uploading</li>
            </ul>
          </div>
        </div>

        {status && (
          <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
            {status.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          {uploading ? (
            <>Processing...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Menu
            </>
          )}
        </Button>
      </div>
    </div>
  );
}