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
      const schema = {
        type: "array",
        items: {
          type: "object",
          properties: {
            date: { type: "string" },
            itemName: { type: "string" },
            description: { type: "string" },
            isGF: { type: "boolean" },
            isGFA: { type: "boolean" },
            isVEG: { type: "boolean" },
            isVGN: { type: "boolean" },
            isDFA: { type: "boolean" },
            specialNotes: { type: "string" }
          }
        }
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: { 
          type: "object",
          properties: {
            menu_items: schema
          }
        }
      });

      if (result.status === 'success' && result.output?.menu_items) {
        // Group by date
        const menuByDate = {};
        result.output.menu_items.forEach(item => {
          if (!menuByDate[item.date]) {
            menuByDate[item.date] = {
              date: item.date,
              menuItems: [],
              specialNotes: item.specialNotes || ''
            };
          }
          menuByDate[item.date].menuItems.push({
            itemName: item.itemName,
            description: item.description || '',
            isGF: item.isGF || false,
            isGFA: item.isGFA || false,
            isVEG: item.isVEG || false,
            isVGN: item.isVGN || false,
            isDFA: item.isDFA || false
          });
        });

        // Create menu days
        await base44.entities.MenuDay.bulkCreate(Object.values(menuByDate));
        
        setStatus({ type: 'success', message: 'Menu uploaded successfully!' });
        setFile(null);
        onUploadComplete();
      } else {
        setStatus({ type: 'error', message: result.details || 'Failed to extract menu data' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/60 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <FileSpreadsheet className="h-5 w-5 text-amber-600" />
        <h3 className="font-semibold text-slate-900">Upload Menu (CSV/Excel)</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="menu-file" className="text-sm text-slate-700 mb-2 block">
            Select file with columns: date, itemName, description, isGF, isGFA, isVEG, isVGN, isDFA, specialNotes
          </Label>
          <Input
            id="menu-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            disabled={uploading}
          />
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