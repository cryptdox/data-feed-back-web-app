import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { apiService } from '../services/api';
import { Dataset } from '../types';
import { Plus, Database } from 'lucide-react';

interface DatasetsProps {
  onNavigate: (page: string) => void;
}

export function Datasets({ onNavigate }: DatasetsProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const response = await apiService.listDatasets({ limit: 50 });
      if (response.data) {
        setDatasets(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00a8ff] to-[#9c88ff] bg-clip-text text-transparent">
          Datasets
        </h1>
        <Button onClick={() => onNavigate('create-dataset')}>
          <Plus className="w-5 h-5 mr-2" />
          Create Dataset
        </Button>
      </div>

      {loading ? (
        <Loading message="Loading datasets..." />
      ) : datasets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No datasets yet</p>
            <Button onClick={() => onNavigate('create-dataset')}>
              Create Your First Dataset
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <Card key={dataset.datasetId}>
              <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                {dataset.name}
              </h3>
              {dataset.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {dataset.description}
                </p>
              )}
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Labels:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.keys(dataset.labels).map(label => (
                      <span
                        key={label}
                        className="px-2 py-1 bg-[#00a8ff]/10 text-[#00a8ff] rounded text-xs"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(dataset.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
