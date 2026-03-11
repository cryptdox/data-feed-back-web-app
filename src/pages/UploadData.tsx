import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { Dataset } from '../types';
import { Upload, FileSpreadsheet, Search } from 'lucide-react';

export function UploadData() {
  const { t } = useLanguage();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  // click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDatasets = async (searchText = '') => {
    try {
      setLoadingSearch(true);
      const response = await apiService.listDatasets({
        limit: 100,
        search: searchText,
      });
      if (response.data) {
        setDatasets(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load datasets:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const filteredDatasets = datasets
    .filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 10);

  const selectedDatasetName =
    datasets.find((d) => d.datasetId === selectedDataset)?.name || '';

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedDataset) return;

    setLoading(true);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('datasetId', selectedDataset);

      await apiService.uploadData(formData);

      setSuccess(true);
      setFile(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to upload data:', error);
      alert('Failed to upload data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card title={t.data.upload}>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* SEARCHABLE DATASET SELECT */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t.data.selectDataset}
            </label>

            <div
              className="border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 cursor-text"
              onClick={() => setDropdownOpen(true)}
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={dropdownOpen ? search : selectedDatasetName}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    loadDatasets(e.target.value); // debounce can be added later
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search dataset..."
                  className="w-full outline-none bg-transparent"
                />
              </div>
            </div>

            {dropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-900 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {loadingSearch ? (
                  <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                    Loading...
                  </div>
                ) : filteredDatasets.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500">
                    No dataset found
                  </div>
                ) : (
                  filteredDatasets.map((dataset) => (
                    <div
                      key={dataset.datasetId}
                      onClick={() => {
                        setSelectedDataset(dataset.datasetId);
                        setSearch('');
                        setDropdownOpen(false);
                      }}
                      className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      {dataset.name}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* FILE UPLOAD */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t.data.selectFile}
            </label>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-[#00a8ff] bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center">
                  {file ? (
                    <>
                      <FileSpreadsheet className="w-16 h-16 text-[#4cd137] mb-4" />
                      <p className="text-lg font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">{t.data.dragDrop}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        CSV or Excel files only
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700">Data uploaded successfully!</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !file || !selectedDataset}
            className="w-full"
          >
            {loading ? 'Uploading...' : t.common.upload}
          </Button>
        </form>
      </Card>
    </div>
  );
}