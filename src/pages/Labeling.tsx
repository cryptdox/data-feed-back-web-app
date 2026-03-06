import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Loading } from '../components/Loading';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { Dataset, Data } from '../types';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function Labeling() {
  const { t } = useLanguage();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [currentData, setCurrentData] = useState<Data | null>(null);
  const [datasetInfo, setDatasetInfo] = useState<Dataset | null>(null);
  const [labelValues, setLabelValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadDatasets();
  }, []);

  useEffect(() => {
    if (selectedDataset) {
      loadRandomData();
    }
  }, [selectedDataset]);

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

  const loadRandomData = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const response = await apiService.getRandomData({ datasetId: selectedDataset });
      if (response.data) {
        setCurrentData(response.data.data);
        setDatasetInfo(response.data.dataset);
        setLabelValues({});
      }
    } catch (error) {
      console.error('Failed to load random data:', error);
      setCurrentData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentData || Object.keys(labelValues).length === 0) return;

    setSubmitting(true);
    try {
      await apiService.submitFeedback({
        dataId: currentData.dataId,
        value: labelValues,
      });
      setSuccess(true);
      setTimeout(() => {
        loadRandomData();
      }, 1000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card title={t.labeling.title}>
        <Select
          label="Select Dataset"
          value={selectedDataset}
          onChange={(e) => setSelectedDataset(e.target.value)}
          options={[
            { value: '', label: '-- Select Dataset --' },
            ...datasets.map(ds => ({ value: ds.datasetId, label: ds.name })),
          ]}
        />
      </Card>

      {loading && <Loading message="Loading data..." />}

      {!loading && currentData && datasetInfo && (
        <>
          <Card title="Data to Label">
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                {Object.entries(currentData.row).map(([key, [value, type]]) => (
                  <div key={key} className="mb-3">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {key}:
                    </span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">
                      {String(value)}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({type})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Apply Labels">
            <div className="space-y-6">
              {Object.entries(datasetInfo.labels).map(([labelName, options]) => (
                <div key={labelName}>
                  <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                    {labelName}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(options).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setLabelValues({ ...labelValues, [labelName]: Number(key) })}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                          labelValues[labelName] === Number(key)
                            ? 'border-[#00a8ff] bg-blue-50 dark:bg-blue-900/20 text-[#00a8ff]'
                            : 'border-gray-300 dark:border-gray-600 hover:border-[#00a8ff]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{value}</span>
                          {labelValues[labelName] === Number(key) && (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {success && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                  <p className="text-green-700 dark:text-green-300">Feedback submitted successfully!</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(labelValues).length === 0}
                  className="flex-1"
                >
                  {submitting ? 'Submitting...' : t.labeling.submitFeedback}
                </Button>
                <Button
                  onClick={loadRandomData}
                  variant="secondary"
                  disabled={loading}
                >
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {!loading && !currentData && selectedDataset && (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t.labeling.noData}
          </p>
        </Card>
      )}
    </div>
  );
}
