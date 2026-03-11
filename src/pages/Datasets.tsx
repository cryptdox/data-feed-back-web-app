
import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { apiService } from '../services/api';
import { Dataset } from '../types';
import { Plus, Database, Search } from 'lucide-react';

interface DatasetsProps {
  onNavigate: (page: string) => void;
}

export function Datasets({ onNavigate }: DatasetsProps) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [limit] = useState(9);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setOffset(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadDatasets(offset);
  }, [offset, debouncedSearch]);

  const totalPages = Math.ceil(total / limit);
  const currentPage = offset / limit + 1;

  const loadDatasets = async (newOffset = offset) => {
    try {
      setLoading(true);

      const response = await apiService.listDatasets({
        limit,
        offset: newOffset,
        search: debouncedSearch || '',
      });

      if (response.data) {
        setDatasets(response.data.items);
        setTotal(response.data.total);
        setOffset(response.data.offset);
      }

    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#00a8ff] to-[#9c88ff] bg-clip-text text-transparent">
          Datasets
        </h1>

        <div className="flex gap-3">
          {/* search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search datasets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00a8ff]"
            />
          </div>
          <Button
            onClick={() => onNavigate('create-dataset')}
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Dataset
          </Button>
        </div>
      </div>

      {/* content */}
      {loading ? (
        <Loading message="Loading datasets..." />
      ) : datasets.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No datasets found
            </p>
            <Button onClick={() => onNavigate('create-dataset')}>
              Create Your First Dataset
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {datasets.map((dataset) => (
            <div
              key={dataset.datasetId}
              onClick={() => setSelectedDataset(dataset)}
              className="cursor-pointer hover:shadow-lg transition"
            >
              <Card>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
                  {dataset.name}
                </h3>

                <div className="space-y-2">

                  <div className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Labels:
                    </span>

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
            </div>
          ))}
        </div>
      )}

      {/* pagination */}
      <div className="flex justify-center items-center gap-4 mt-6">

        <Button
          disabled={offset === 0}
          onClick={() => setOffset(offset - limit)}
        >
          Previous
        </Button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages || 1}
        </span>

        <Button
          disabled={offset + limit >= total}
          onClick={() => setOffset(offset + limit)}
        >
          Next
        </Button>

      </div>

      {/* dataset modal */}
      {selectedDataset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-lg w-full">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedDataset.name}
              </h2>

              <button
                onClick={() => setSelectedDataset(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {selectedDataset.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedDataset.description}
              </p>
            )}

            <div className="mb-4">
              <span className="font-medium">Labels:</span>

              <div className="flex flex-wrap gap-2 mt-2">
                {Object.keys(selectedDataset.labels).map(label => (
                  <span
                    key={label}
                    className="px-2 py-1 bg-[#00a8ff]/10 text-[#00a8ff] rounded text-xs"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Created {new Date(selectedDataset.createdAt).toLocaleDateString()}
            </p>

            <div className="mt-6 text-right">
              <Button onClick={() => setSelectedDataset(null)}>
                Close
              </Button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

