import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react'
import { Database as DsIcon, ListChecks, CheckCircle, PieChart, Calendar } from 'lucide-react';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { apiService } from '../services/api';
import {
  Dataset,
  DatasetStatsItem,
  FeedbackTrendItem,
  UserAnalytics
} from '../types';
import { BarChart3, Database, Server, Search } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';


const formatLocal = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export function Analytics() {

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const format = (d: Date) => d.toISOString().split('T')[0];

  const [loading, setLoading] = useState(true);

  const dropdownRef = useRef<HTMLDivElement>(null);
  // filters
  const [datasetId, setDatasetId] = useState('');
  const [startDate, setStartDate] = useState(formatLocal(firstDay));
  const [endDate, setEndDate] = useState(formatLocal(today));

  // dataset dropdown
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedDatasetName, setSelectedDatasetName] = useState('');

  // api data
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [feedbackTrend, setFeedbackTrend] = useState<FeedbackTrendItem[]>([]);
  const [datasetStats, setDatasetStats] = useState<DatasetStatsItem[]>([]);

  let debounceTimer: any;


  const loadDatasets = (query?: string) => {

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      try {

        const res = await apiService.listDatasets({
          search: query,
          limit: 20
        });

        if (res.data) setDatasets(res.data.items);

      } catch (err) {
        console.error(err);
      }
    }, 1000);
  };


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

  useEffect(() => {
    loadDatasets();
    loadAnalytics();
  }, []);

  useEffect(() => {
    loadFeedbackTrend();
  }, [datasetId, startDate, endDate]);

  const loadAnalytics = async () => {

    setLoading(true);

    try {

      const [analyticsRes, statsRes] = await Promise.all([
        apiService.getUserAnalytics(),
        apiService.getDatasetStats({ limit: 50 })
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data);
      if (statsRes.data) setDatasetStats(statsRes.data.items);

      await loadFeedbackTrend();

    } catch (err) {
      console.error('Analytics load failed', err);
    }

    setLoading(false);
  };

  const loadFeedbackTrend = async () => {

    try {

      const res = await apiService.getFeedbackTrend({
        datasetId: datasetId || '',
        startDate,
        endDate
      });

      if (res.data) setFeedbackTrend(res.data);

    } catch (err) {
      console.error('Trend load failed', err);
    }
  };

  const handleStartDate = (value: string) => {

    if (value > format(today)) return;

    if (value > endDate) {
      setEndDate(value);
    }

    setStartDate(value);
  };

  const handleEndDate = (value: string) => {

    if (value > format(today)) return;

    if (value < startDate) return;

    setEndDate(value);
  };

  const feedbackTrendData = {
    labels: feedbackTrend.map(d => d.date),
    datasets: [
      {
        label: 'Feedbacks per Day',
        data: feedbackTrend.map(d => d.count),
        backgroundColor: '#9c88ff',
      },
    ],
  };

  if (loading) return <Loading message="Loading analytics..." />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Summary Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

        <Card>
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-[#9c88ff]" />
            <div>
              <p className="text-sm text-gray-500">Total Datasets</p>
              <p className="font-bold text-xl">{analytics?.totalDatasets || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-[#8c7ae6]" />
            <div>
              <p className="text-sm text-gray-500">Total Data Rows</p>
              <p className="font-bold text-xl">{analytics?.totalDataRows || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-[#00a8ff]" />
            <div>
              <p className="text-sm text-gray-500">Total Feedbacks</p>
              <p className="font-bold text-xl">{analytics?.totalFeedbacks || 0}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <Server className="w-6 h-6 text-[#fbc531]" />
            <div>
              <p className="text-sm text-gray-500">Storage Used (MB)</p>
              <p className="font-bold text-xl">{analytics?.totalStorageMB || 0}</p>
            </div>
          </div>
        </Card>

      </div>


      {/* Filters */}

      <Card title="Filters">

        <div className="grid gap-4 md:grid-cols-3 grid-cols-1">

          {/* Dataset picker */}

          <div className="relative" ref={dropdownRef}>

            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Dataset
            </label>

            <div
              className="border rounded-lg px-3 py-2 bg-white dark:bg-gray-900 cursor-text flex items-center justify-between"
              onClick={() => setDropdownOpen(true)}
            >

              <div className="flex items-center gap-2 w-full">

                <Search className="w-4 h-4 text-gray-400" />

                <input
                  type="text"
                  value={dropdownOpen ? search : selectedDatasetName}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    loadDatasets(e.target.value);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  placeholder="Search dataset..."
                  className="w-full outline-none bg-transparent"
                />

              </div>

              {datasetId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDatasetId('');
                    setSelectedDatasetName('');
                    setSearch('');
                  }}
                  className="ml-2 text-gray-400 hover:text-red-500 text-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

            </div>

            {dropdownOpen && (

              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border rounded-lg max-h-60 overflow-auto">

                {datasets.map(ds => (

                  <div
                    key={ds.datasetId}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setDatasetId(ds.datasetId);
                      setSelectedDatasetName(ds.name);
                      setDropdownOpen(false);
                      setSearch('');
                    }}
                  >
                    {ds.name}
                  </div>

                ))}

              </div>

            )}

          </div>


          {/* Start date */}

          <div>

            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              Start Date
            </label>

            <input
              type="date"
              value={startDate}
              max={formatLocal(today)}
              onChange={(e) => handleStartDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />

          </div>


          {/* End date */}

          <div>

            <label className="block mb-1 text-gray-700 dark:text-gray-300">
              End Date
            </label>

            <input
              type="date"
              value={endDate}
              min={startDate}
              max={formatLocal(today)}
              onChange={(e) => handleEndDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />

          </div>

        </div>

      </Card>


      {/* Feedback Trend */}

      <Card title="Feedback Trend">

        <Bar data={feedbackTrendData} />

      </Card>


      {/* Dataset Stats */}<Card title="Dataset Stats">
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-200 min-w-max">

            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-1 py-2 text-left" title="Dataset">
                  <DsIcon className="inline w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
                  <span className="hidden sm:inline text-gray-700 dark:text-gray-300">Dataset</span>
                </th>
                <th className="px-1 py-2 text-center" title="Rows">
                  <ListChecks className="inline w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
                  <span className="hidden sm:inline text-gray-700 dark:text-gray-300">Rows </span>
                </th>
                <th className="px-1 py-2 text-center" title="Labeled">
                  <CheckCircle className="inline w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
                  <span className="hidden sm:inline text-gray-700 dark:text-gray-300">Labeled </span>
                </th>
                <th className="px-1 py-2 text-center" title="Coverage">
                  <PieChart className="inline w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
                  <span className="hidden sm:inline text-gray-700 dark:text-gray-300">Coverage </span>
                </th>
                <th className="px-1 py-2 text-center" title="Created">
                  <Calendar className="inline w-4 h-4 mr-1 text-gray-600 dark:text-gray-300" />
                  <span className="hidden sm:inline text-gray-700 dark:text-gray-300">Created </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {datasetStats.map(ds => (
                <tr key={ds.datasetId} className="border-b">
                  <td className="px-1 py-2 whitespace-nowrap">{ds.datasetName}</td>
                  <td className="px-1 py-2 text-center whitespace-nowrap">{ds.totalRows}</td>
                  <td className="px-1 py-2 text-center whitespace-nowrap">{ds.labeledRows}</td>
                  <td className="px-1 py-2 text-center whitespace-nowrap">{ds.labelCoverage}%</td>
                  <td className="px-1 py-2 text-center whitespace-nowrap">
                    {new Date(ds.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}