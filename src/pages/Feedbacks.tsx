import { useEffect, useState, useRef } from "react";
import { FeedbackSummaryItem, Dataset } from "../types";
import { apiService } from "../services/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Loading } from "../components/Loading";
import { useLanguage } from "../contexts/LanguageContext";
import { CheckCircle, X } from "lucide-react";

function Feedbacks() {
    const { t } = useLanguage();
    const [items, setItems] = useState<FeedbackSummaryItem[]>([]);
    const [offset, setOffset] = useState(0);
    const [limit, setLimit] = useState(30);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    // Dataset Picker State
    const [datasets, setDatasets] = useState<Dataset[]>([]);
    const [selectedDataset, setSelectedDataset] = useState('');
    const [search, setSearch] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    // Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFeedback, setEditingFeedback] = useState<FeedbackSummaryItem | null>(null);
    const [modalDataset, setModalDataset] = useState<Dataset | null>(null);
    const [labelValues, setLabelValues] = useState<Record<string, number>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const [selectedUser] = useState<string>('me');

    /* ------------------- Dataset Search ------------------- */
    useEffect(() => {
        if (search === '' && !selectedDataset) {
            fetchDatasets('');
            return;
        }

        const timer = setTimeout(() => {
            if (!selectedDataset) fetchDatasets(search);
        }, 600);

        return () => clearTimeout(timer);
    }, [search]);

    const fetchDatasets = async (query: string) => {
        try {
            const res = await apiService.listDatasets({ search: query, limit: 10 });
            if (res.data) {
                setDatasets(res.data.items);
            }
        } catch (err) {
            console.error('Dataset search failed', err);
        }
    };

    /* ------------------- Load Feedbacks ------------------- */
    useEffect(() => {
        if (selectedDataset) {
            loadData();
        } else {
            setItems([]);
            setTotal(0);
        }
    }, [offset, selectedUser, selectedDataset]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await apiService.getDatasetUserFeedback(selectedDataset, selectedUser, offset, limit);
            setItems(res.data?.items || []);
            setTotal(res.data?.total || 0);
        } catch (err) {
            console.error('Failed to load feedbacks', err);
        } finally {
            setLoading(false);
        }
    };

    /* ------------------- Edit Modal Logic ------------------- */
    const handleEdit = async (item: FeedbackSummaryItem) => {
        setEditingFeedback(item);
        setIsModalOpen(true);
        setSubmitSuccess(false);
        setLabelValues({});

        try {
            const res = await apiService.getDataset(selectedDataset);
            if (res.data) {
                setModalDataset(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch dataset for modal', err);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!editingFeedback || Object.keys(labelValues).length === 0) return;
        setSubmitting(true);
        try {
            await apiService.submitFeedback({
                dataId: editingFeedback.dataId,
                value: labelValues,
            });
            setSubmitSuccess(true);
            setTimeout(() => {
                setIsModalOpen(false);
                loadData();
            }, 1000);
        } catch (err) {
            console.error('Submit failed', err);
            alert('Submit failed');
        } finally {
            setSubmitting(false);
        }
    };

    /* ------------------- Click Outside Picker ------------------- */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!pickerRef.current?.contains(e.target as Node)) {
                setShowPicker(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectedDatasetInfo = datasets.find(ds => ds.datasetId === selectedDataset);

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card title={t.nav.feedbacks}>
                <div className="grid gap-6 md:grid-cols-2 grid-cols-1 mb-6">
                    {/* Dataset Picker */}
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
                            {(selectedDataset || search) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedDataset('');
                                        setSearch('');
                                        setShowPicker(false);
                                        setItems([]);
                                        setTotal(0);
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
                                            setOffset(0);
                                        }}
                                    >
                                        {ds.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* User ID */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            User
                        </label>
                        <input
                            disabled
                            value={selectedUser}
                            className="p-3 border border-gray-300 dark:border-gray-600 font-semibold rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-500 w-full"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="py-20">
                        <Loading message="Loading feedbacks..." />
                    </div>
                ) : (
                    <>
                        {/* Feedbacks List */}
                        <div className="space-y-4">
                            {items.length === 0 ? (
                                <div className="text-center py-20 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {selectedDataset ? "No feedbacks found for this dataset." : "Please select a dataset to view feedbacks."}
                                    </p>
                                </div>
                            ) : (
                                items.map(item => (
                                    <div key={item.feedbackId} className="group p-5 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-900 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all duration-200">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="inline-block px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/40 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                    {item.topic}
                                                </div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{item.comment}</div>

                                                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                                                    <div className="text-sm flex items-center gap-2">
                                                        <span className="text-gray-400">Label:</span>
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{item.Label_mapped}</span>
                                                    </div>
                                                    <div className="text-sm flex items-center gap-2">
                                                        <span className="text-gray-400">Sentiment:</span>
                                                        <span className="font-semibold text-gray-700 dark:text-gray-300">{item.Sentiment_mapped}</span>
                                                    </div>
                                                    <div className="text-sm flex items-center gap-2">
                                                        <span className="text-gray-400">Date:</span>
                                                        <span className="text-gray-600 dark:text-gray-400">{new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                variant="secondary"
                                                className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleEdit(item)}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {selectedDataset && (
                            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-sm text-gray-500 font-medium">
                                    Displaying {offset + 1} - {Math.min(offset + limit, total)} of {total} results
                                </span>
                                <div className="flex gap-3">
                                    {total > limit && <Button
                                        variant="secondary"
                                        disabled={offset === 0}
                                        onClick={() => setOffset(prev => Math.max(prev - limit, 0))}
                                    >
                                        Previous
                                    </Button>}
                                    {/* keep options to change limit and offset */}
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value))
                                            setOffset(0)
                                        }}
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={30}>30</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    {total > limit && <select
                                        value={offset / limit}
                                        onChange={(e) =>
                                            // offset will be by counting page number. this is generally page number input on change will set offset
                                            setOffset(Number(e.target.value) * limit)
                                        }
                                        className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                                    >
                                        {/* <option value={0}>0</option>
                                        <option value={1}>1</option>
                                        <option value={2}>2</option>
                                        <option value={3}>3</option>
                                        <option value={4}>4</option>
                                        <option value={5}>5</option> */}
                                        {/* make it dynamic */}
                                        {Array.from({ length: Math.ceil(total / limit) }, (_, i) => (
                                            <option key={i} value={i}>{i + 1}</option>
                                        ))}
                                    </select>
                                    }
                                    {total > limit && <Button
                                        variant="secondary"
                                        disabled={offset + limit >= total}
                                        onClick={() => setOffset(prev => prev + limit)}
                                    >
                                        Next
                                    </Button>
                                    }
                                </div>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Edit Feedback Modal */}
            {isModalOpen && editingFeedback && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Feedback Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Review and update labels for this entry</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="px-8 py-8 overflow-y-auto space-y-10">
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entry Context</span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <div className="text-blue-600 dark:text-blue-400 text-sm font-bold mb-2 uppercase tracking-wide">{editingFeedback.topic}</div>
                                    <div className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{editingFeedback.comment}</div>
                                    {editingFeedback.url && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-medium">
                                            SOURCE URL: <a href={editingFeedback.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline inline-block max-w-full truncate align-bottom">{editingFeedback.url}</a>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Classifications</span>
                                </div>
                                {modalDataset ? (
                                    <div className="space-y-8">
                                        {Object.entries(modalDataset.labels).map(([labelName, options]) => (
                                            <div key={labelName}>
                                                <label className="block text-sm font-bold mb-4 text-gray-700 dark:text-gray-300">{labelName}</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {Object.entries(options).map(([key, value]) => (
                                                        <button
                                                            key={key}
                                                            type="button"
                                                            onClick={() => setLabelValues({ ...labelValues, [labelName]: Number(key) })}
                                                            className={`group p-4 rounded-2xl border-2 text-left transition-all duration-200 ${labelValues[labelName] === Number(key)
                                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                                : 'border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 text-gray-600 dark:text-gray-400'
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-semibold">{value}</span>
                                                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${labelValues[labelName] === Number(key) ? 'border-blue-500 bg-blue-500' : 'border-gray-200 dark:border-gray-700 group-hover:border-blue-300'}`}>
                                                                    {labelValues[labelName] === Number(key) && <CheckCircle className="w-4 h-4 text-white" />}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center py-10">
                                        <Loading message="Fetching label configuration..." />
                                    </div>
                                )}
                            </section>

                            {submitSuccess && (
                                <div className="p-5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl text-green-700 dark:text-green-300 flex items-center gap-4 animate-in slide-in-from-bottom-2">
                                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Success!</div>
                                        <div className="text-sm opacity-90">Feedback updated and list refreshed.</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-8 py-8 border-t border-gray-100 dark:border-gray-800 flex gap-4 bg-gray-50/50 dark:bg-gray-800/20">
                            <Button
                                variant="secondary"
                                className="flex-1 py-4 rounded-xl font-bold"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20"
                                onClick={handleSubmitFeedback}
                                disabled={submitting || !modalDataset || Object.keys(labelValues).length !== Object.keys(modalDataset.labels).length}
                            >
                                {submitting ? 'Processing...' : 'Apply Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Feedbacks