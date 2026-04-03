import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loading } from '../components/Loading';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { Dataset, Data } from '../types';
import { ArrowRight, CheckCircle } from 'lucide-react';
import AdUnit from '../services/Ads';

export function Labeling() {
  const { t } = useLanguage();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState('');
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [count, setCount] = useState<number>(0);
  const [offset, setOffset] = useState<number>(0);
  const [currentData, setCurrentData] = useState<Data | null>(null);
  const [datasetInfo, setDatasetInfo] = useState<Dataset | null>(null);
  const [labelValues, setLabelValues] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ------------------- debounce API call ------------------- */
  useEffect(() => {
    if (search === '') return;

    const timer = setTimeout(() => {
      fetchDatasets(search);
    }, 600);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchDatasets = async (query: string) => {
    try {
      const res = await apiService.listDatasets({ search: query, limit: 50 });
      if (res.data) {
        setDatasets(res.data.items);
      }
    } catch (err) {
      console.error('Dataset search failed', err);
    }
  };

  /* ------------------- click outside ------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ------------------- load random data ------------------- */
  useEffect(() => {
    if (selectedDataset) loadRandomData();
  }, [selectedDataset, count, offset]);

  const loadRandomData = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const res = await apiService.getRandomData({
        datasetId: selectedDataset,
        count: count ?? 0,
        offset,
      });
      if (res.data) {
        setCurrentData((res as any).data);
        setDatasetInfo((res as any).dataset);
        setLabelValues({});
      }
    } catch (err) {
      console.error('Failed to load data', err);
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
      setTimeout(() => loadRandomData(), 1000);
    } catch (err) {
      console.error(err);
      alert('Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDatasetInfo = datasets.find(ds => ds.datasetId === selectedDataset);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Dataset Select */}
      <Card title={t.labeling.title}>
        <div className="grid gap-6 md:grid-cols-3 grid-cols-1">
          <div className="flex flex-col relative" ref={pickerRef}>
            <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Select Dataset
            </label>
            <div className="relative">
              <input
                value={selectedDatasetInfo?.name || search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedDataset('');
                  setShowPicker(true);
                }}
                onFocus={() => setShowPicker(true)}
                placeholder="Search dataset..."
                className="p-3 pr-10 border border-gray-300 dark:border-gray-600 font-semibold rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-full"
              />
              {/* Clear Button */}
              {(selectedDataset || search) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDataset('');
                    setSearch('');
                    setShowPicker(false);
                    setCurrentData(null)
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              )}
            </div>

            {showPicker && (
              <div className="absolute top-full mt-1 w-full max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50">
                {datasets.length === 0 && (
                  <div className="p-3 text-sm text-gray-500">No datasets found</div>
                )}
                {datasets.map(ds => (
                  <div
                    key={ds.datasetId}
                    className="p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    onClick={() => {
                      setSelectedDataset(ds.datasetId);
                      setSearch(ds.name);
                      setShowPicker(false);
                    }}
                  >
                    {ds.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Count */}
          <div className="flex flex-col w-full">
            <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Count (optional)
            </label>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-32">
              {/* Decrement */}
              <button
                type="button"
                onClick={() => setCount(prev => (prev && prev > 0 ? prev - 1 : 0))}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                -
              </button>

              {/* Input */}
              <input
                type="number"
                min={0}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-16 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none
                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                [&::-moz-appearance]:textfield"                 />

              {/* Increment */}
              <button
                type="button"
                onClick={() => setCount(prev => (prev ? prev + 1 : 1))}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                +
              </button>
            </div>
          </div>
          {/* Offset */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              Offset (optional)
            </label>
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden w-32">
              {/* Decrement */}
              <button
                type="button"
                onClick={() => setOffset(prev => (prev && prev > 0 ? prev - 1 : 0))}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                -
              </button>

              {/* Input */}
              <input
                type="number"
                min={0}
                value={offset}
                onChange={(e) => setOffset(Number(e.target.value))}
                className="w-16 text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none
                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                [&::-moz-appearance]:textfield"              />

              {/* Increment */}
              <button
                type="button"
                onClick={() => setOffset(prev => (prev ? prev + 1 : 1))}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                +
              </button>
            </div>
          </div>

        </div>
      </Card>

      {/* Dataset description */}
      {selectedDatasetInfo && (
        <Card title="Dataset description">
          <p className="text-justify leading-relaxed text-gray-700 dark:text-gray-300">{selectedDatasetInfo.description}</p>
        </Card>
      )}

      <div className="">
        <AdUnit slotId="6108526231" />
      </div>

      {loading && <Loading message="Loading data..." />}

      {/* Data and labels */}
      {!loading && currentData && datasetInfo && (
        <>
          <Card title="Data to Label">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {Object.entries(currentData.row).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{key}:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 break-all">{String(value)}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="">
            <AdUnit slotId="6108526231" />
          </div>

          <Card title="Apply Labels">
            <div className="space-y-6">
              {Object.entries(datasetInfo.labels).map(([labelName, options]) => (
                <div key={labelName}>
                  <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300 font-semibold">{labelName}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(options).map(([key, value]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setLabelValues({ ...labelValues, [labelName]: Number(key) })}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 text-gray-700 dark:text-gray-300 ${labelValues[labelName] === Number(key)
                          ? 'border-[#00a8ff] bg-blue-50 dark:bg-blue-900/20 text-[#00a8ff]'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#00a8ff]'
                          }`}
                      >
                        <div className="flex justify-between">
                          <span>{value}</span>
                          {labelValues[labelName] === Number(key) && <CheckCircle className="w-5 h-5" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {success && <div className="p-4 bg-green-50 border border-green-200 rounded-lg">Feedback submitted successfully!</div>}

              <div className="flex gap-3">
                <Button onClick={handleSubmit} disabled={submitting || Object.keys(labelValues).length === 0} className="flex-1">
                  {submitting ? 'Submitting...' : t.labeling.submitFeedback}
                </Button>
                <Button onClick={loadRandomData} variant="secondary">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {!loading && !currentData && !selectedDataset && (
        <Card>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            {t.labeling.noData}
          </p>
        </Card>
      )}
    </div>
  );
}