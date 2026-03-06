import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { Dataset } from '../types';
import { Upload, FileSpreadsheet } from 'lucide-react';

export function UploadData() {
  const { t } = useLanguage();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  const loadDatasets = async () => {
    try {
      const response = await apiService.listDatasets({ limit: 100 });
      if (response.data) {
        setDatasets(response.data.items);
      }
    } catch (error) {
      console.error('Failed to load datasets:', error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
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
          <Select
            label={t.data.selectDataset}
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(e.target.value)}
            options={[
              { value: '', label: '-- Select Dataset --' },
              ...datasets.map(ds => ({ value: ds.datasetId, label: ds.name })),
            ]}
            required
          />

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
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {file.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-16 h-16 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {t.data.dragDrop}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        CSV or Excel files only
                      </p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-green-700 dark:text-green-300">Data uploaded successfully!</p>
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
