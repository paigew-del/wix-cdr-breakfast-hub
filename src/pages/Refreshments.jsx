import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Coffee } from 'lucide-react';
import { toast } from 'sonner';

const REFRESHMENT_ITEMS = [
  'Energy drinks',
  'Sparkling water',
  'V8 juice',
  'Body armours',
  'Teas',
  'Milk',
  'Orange juice',
  'Coffee creamers',
  'Chicken salad',
  'Cottage cheese',
  'Boiled eggs',
  'String cheese',
  'Cheese bites',
  'Yogurt',
  'Balance breaks',
  'Applesauce',
  'Uncrustables',
  'Fresh fruit',
  'Croissants',
  'Fresh veggies',
  'Dried fruit',
  'Bread',
  'Chips',
  'Protein bars',
  'Granola bars',
  'Gum',
  'Beef jerky'
];

export default function Refreshments() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: reports = [] } = useQuery({
    queryKey: ['refreshmentReports'],
    queryFn: () => base44.entities.RefreshmentReport.list('-created_date', 100),
    initialData: []
  });

  const reportMutation = useMutation({
    mutationFn: ({ itemName, status }) => 
      base44.entities.RefreshmentReport.create({
        itemName,
        status,
        reportedBy: user?.email || 'anonymous'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refreshmentReports'] });
      toast.success('Status updated');
    }
  });

  const getItemStatus = (itemName) => {
    const itemReports = reports.filter(r => r.itemName === itemName);
    if (itemReports.length === 0) return 'in_stock';
    
    const latestReport = itemReports[0];
    return latestReport.status;
  };

  const handleToggleStock = (itemName) => {
    const currentStatus = getItemStatus(itemName);
    const newStatus = currentStatus === 'out_of_stock' ? 'restocked' : 'out_of_stock';
    reportMutation.mutate({ itemName, status: newStatus });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center">
            <Coffee className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Refreshments</h1>
            <p className="text-gray-600 mt-1">Report items that are out of stock</p>
          </div>
        </div>
      </div>

      <Card className="border-gray-200 shadow-sm rounded-2xl bg-white p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REFRESHMENT_ITEMS.map((item) => {
            const status = getItemStatus(item);
            const isOutOfStock = status === 'out_of_stock';
            
            return (
              <button
                key={item}
                onClick={() => handleToggleStock(item)}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  isOutOfStock
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`font-medium ${isOutOfStock ? 'text-red-900' : 'text-gray-900'}`}>
                    {item}
                  </span>
                  {isOutOfStock ? (
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
                <div className={`text-xs mt-2 font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}