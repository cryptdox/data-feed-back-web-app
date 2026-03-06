import { useState } from 'react';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import { Plus, Trash2 } from 'lucide-react';

export function CreateDataset() {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState<Record<string, Record<string, string>>>({});
  const [currentLabel, setCurrentLabel] = useState('');
  const [currentLabelValues, setCurrentLabelValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addLabelValue = () => {
    const key = Object.keys(currentLabelValues).length.toString();
    setCurrentLabelValues({ ...currentLabelValues, [key]: '' });
  };

  const updateLabelValue = (key: string, value: string) => {
    setCurrentLabelValues({ ...currentLabelValues, [key]: value });
  };

  const removeLabelValue = (key: string) => {
    const newValues = { ...currentLabelValues };
    delete newValues[key];
    setCurrentLabelValues(newValues);
  };

  const addLabel = () => {
    if (currentLabel && Object.keys(currentLabelValues).length > 0) {
      setLabels({ ...labels, [currentLabel]: currentLabelValues });
      setCurrentLabel('');
      setCurrentLabelValues({});
    }
  };

  const removeLabel = (labelName: string) => {
    const newLabels = { ...labels };
    delete newLabels[labelName];
    setLabels(newLabels);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      await apiService.createDataset({ name, description, labels });
      setSuccess(true);
      setName('');
      setDescription('');
      setLabels({});
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to create dataset:', error);
      alert('Failed to create dataset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card title={t.dataset.create}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t.dataset.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g., Image Classification Dataset"
          />

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              {t.dataset.description}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-[#00a8ff] focus:border-transparent
                transition-all duration-200"
              rows={3}
              placeholder="Describe your dataset..."
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              {t.dataset.labels}
            </h3>

            <div className="space-y-4 mb-4">
              <Input
                label={t.dataset.labelName}
                value={currentLabel}
                onChange={(e) => setCurrentLabel(e.target.value)}
                placeholder="e.g., category"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t.dataset.labelValues}
                </label>
                {Object.entries(currentLabelValues).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <Input
                      value={`${key}:`}
                      disabled
                      className="w-20"
                    />
                    <Input
                      value={value}
                      onChange={(e) => updateLabelValue(key, e.target.value)}
                      placeholder="Value"
                    />
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeLabelValue(key)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" onClick={addLabelValue}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Value
                </Button>
              </div>

              <Button
                type="button"
                onClick={addLabel}
                disabled={!currentLabel || Object.keys(currentLabelValues).length === 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.dataset.addLabel}
              </Button>
            </div>

            {Object.keys(labels).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Added Labels:
                </h4>
                {Object.entries(labels).map(([labelName, values]) => (
                  <div
                    key={labelName}
                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {labelName}:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {Object.entries(values).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeLabel(labelName)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <p className="text-green-700 dark:text-green-300">Dataset created successfully!</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !name || Object.keys(labels).length === 0}
            className="w-full"
          >
            {loading ? 'Creating...' : t.common.create}
          </Button>
        </form>
      </Card>
    </div>
  );
}
