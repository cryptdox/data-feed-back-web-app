
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
  const [usersFeedback, setUsersFeedback] = useState<any>(null);
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

  useEffect(() => {
    if (selectedDataset) {
      const loadUsersFeedback = async () => {
        try {
          const response = await apiService.getDatasetUsersFeedback(selectedDataset.datasetId);
          setUsersFeedback(response.data);
        } catch (error) {
          console.error('Failed to load users feedback:', error);
        }
      };
      loadUsersFeedback();
    }
  }, [selectedDataset]);

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

      {selectedDataset && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

            {/* HEADER */}
            <div className="flex justify-between items-start p-5 border-b">
              <div>
                <h2 className="text-xl font-semibold dark:text-gray-100">
                  {selectedDataset.name}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Created {new Date(selectedDataset.createdAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedDataset(null)}
                className="text-gray-400 hover:text-red-500 text-lg"
              >
                ✕
              </button>
            </div>

            {/* BODY (SCROLLABLE) */}
            <div className="p-5 overflow-y-auto scrollbar-none space-y-5">

              {/* DESCRIPTION (COLLAPSIBLE) */}
              {selectedDataset.description && (
                <details className="group">
                  <summary className="cursor-pointer font-medium text-gray-700 dark:text-gray-300 flex justify-between items-center">
                    Description
                    <span className="text-xs text-gray-400 group-open:rotate-180 transition">
                      ▼
                    </span>
                  </summary>

                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-100 max-h-40 overflow-y-auto scrollbar-none pr-1  whitespace-pre-line">
                    {selectedDataset.description}
                  </p>
                </details>
              )}

              {/* TABLE */}
              <div className="border rounded-xl overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left dark:text-gray-100">User ID</th>
                        <th className="px-4 py-2 text-left dark:text-gray-100">Feedback</th>
                        <th className="px-4 py-2 text-left dark:text-gray-100">Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {usersFeedback?.userFeedbackCount?.map((item: any) => (
                        <tr
                          key={item.userId}
                          className="border-t hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                        >
                          <td className="px-4 py-2 break-all text-xs text-gray-600 dark:text-gray-100 ">
                            {item.userId}
                          </td>
                          <td className="px-4 py-2 font-medium dark:text-gray-100">
                            {item._count?.feedbackId}
                          </td>
                          <td className="px-4 py-2 dark:text-gray-100">
                            {item._sum?.count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* FOOTER */}
                <div className="p-3 bg-gray-50 dark:bg-gray-800 text-sm font-medium border-t flex justify-between dark:text-gray-100">
                  <span>Total Data</span>
                  <span>{usersFeedback?.dataCount}</span>
                </div>
              </div>

              {/* LABELS */}
              <div>
                <p className="font-medium mb-2 dark:text-gray-100">Labels</p>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(selectedDataset.labels).map(label => (
                    <span
                      key={label}
                      className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* FOOTER ACTION */}
            <div className="p-4 border-t flex justify-end">
              {/* keep download button here too */}
              <Button variant="secondary" onClick={() => setSelectedDataset(null)}>
                Download
              </Button>
              &nbsp;&nbsp;
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

