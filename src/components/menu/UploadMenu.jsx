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
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Extract data from file
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: "object",
          properties: {
            rows: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  week: { type: "string" },
                  date: { type: "string" },
                  food: { type: "string" },
                  allergyAccommodations: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result.status === 'success' && result.output?.rows) {
        // Group by date
        const menuByDate = {};
        result.output.rows.forEach(item => {
          if (!menuByDate[item.date]) {
            menuByDate[item.date] = {
              date: item.date,
              menuItems: [],
              specialNotes: ''
            };
          }

          // Parse allergy accommodations
          const accommodations = (item.allergyAccommodations || item.allergy_accommodations || '').toLowerCase();
          
          menuByDate[item.date].menuItems.push({
            itemName: item.food,
            description: '',
            isGF: accommodations.includes('gf') && !accommodations.includes('gfa'),
            isGFA: accommodations.includes('gfa'),
            isVEG: accommodations.includes('veg') && !accommodations.includes('vgn'),
            isVGN: accommodations.includes('vgn') && !accommodations.includes('vgna'),
            isDFA: accommodations.includes('dfa') || accommodations.includes('df'),
            isVGNA: accommodations.includes('vgna')
          });
        });

        // Create menu days
        await base44.entities.MenuDay.bulkCreate(Object.values(menuByDate));
        
        setStatus({ type: 'success', message: 'Menu uploaded successfully!' });
        setFile(null);
        onUploadComplete();
      } else {
        setStatus({ type: 'error', message: result.details || 'Failed to extract menu data. Please check your CSV format.' });
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error?.message || 'Upload failed';
      setStatus({ 
        type: 'error', 
        message: errorMsg.includes('Invalid file') 
          ? 'Invalid CSV format. Column headers must be exactly: week, date, food, allergyAccommodations (case-sensitive, no spaces)'
          : errorMsg
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="h-5 w-5 text-amber-600" />
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
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-700 font-medium mb-2">CSV Format Requirements:</p>
            <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
              <li><strong>Required columns:</strong> week, date, food, allergyAccommodations (no spaces in header)</li>
              <li><strong>Date format:</strong> YYYY-MM-DD (e.g., 2024-02-15)</li>
              <li><strong>Allergy accommodations:</strong> Use GF, GFA, VEG, VGN, DFA, VGNA (comma-separated)</li>
              <li>Example: "GF, VEG" or "GFA, DFA, VGNA"</li>
              <li>If you have Excel, save as CSV before uploading</li>
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
          className="w-full bg-amber-600 hover:bg-amber-700"
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