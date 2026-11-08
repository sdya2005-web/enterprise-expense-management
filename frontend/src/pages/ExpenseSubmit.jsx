import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import {
  PlusCircle,
  Upload,
  Receipt,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  X,
  ShieldAlert,
  Hash,
  DollarSign,
  Calendar,
  Building2,
  FolderGit2,
  CreditCard
} from 'lucide-react';

const CATEGORIES = [
  { value: 'TRAVEL', label: 'Travel', max: 1500 },
  { value: 'FOOD', label: 'Food', max: 150 },
  { value: 'ACCOMMODATION', label: 'Accommodation', max: 800 },
  { value: 'TRANSPORTATION', label: 'Transportation', max: 200 },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies', max: 500 },
  { value: 'CLIENT_MEETINGS', label: 'Client Meetings', max: 600 },
  { value: 'INTERNET_AND_COMMUNICATION', label: 'Internet and Communication', max: 100 },
  { value: 'MEDICAL', label: 'Medical', max: 1000 },
  { value: 'OTHER', label: 'Other Expenses', max: 300 },
];

const PAYMENT_METHODS = [
  { value: 'PERSONAL_CREDIT_CARD', label: 'Personal Credit Card' },
  { value: 'CORPORATE_CARD', label: 'Corporate Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE_TRANSFER', label: 'Online Transfer' },
];

export const ExpenseSubmit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '');
  const [departmentId, setDepartmentId] = useState(user?.departmentId || '');
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState('TRAVEL');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [businessPurpose, setBusinessPurpose] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PERSONAL_CREDIT_CARD');

  // Receipt & Hash
  const [receiptFile, setReceiptFile] = useState(null);
  const [fileHash, setFileHash] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  // Lists
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [policies, setPolicies] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [policyWarning, setPolicyWarning] = useState('');

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [deptRes, projRes, polRes] = await Promise.all([
          api.get('/departments'),
          api.get('/projects'),
          api.get('/policies'),
        ]);
        setDepartments(deptRes.data);
        setProjects(projRes.data);
        setPolicies(polRes.data);

        if (!departmentId && deptRes.data.length > 0) {
          setDepartmentId(deptRes.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load metadata', err);
      }
    };
    loadMetadata();
  }, []);

  // Compute live client-side SHA-256 for instant duplicate detection visibility
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file type! Only PDF, JPG, and PNG files are allowed.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds maximum 25 MB limit.');
      return;
    }

    setError('');
    setReceiptFile(file);

    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }

    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      setFileHash(hex);
    } catch (err) {
      console.warn('Failed to compute client hash', err);
    }
  };

  const removeReceipt = () => {
    setReceiptFile(null);
    setPreviewUrl(null);
    setFileHash('');
  };

  // Check live policy violations
  useEffect(() => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      const selectedCat = CATEGORIES.find((c) => c.value === category);
      if (selectedCat && numAmount > selectedCat.max) {
        setPolicyWarning(
          `Amount ($${numAmount}) exceeds standard policy threshold ($${selectedCat.max}) for ${selectedCat.label}. This claim will require secondary management approval.`
        );
      } else {
        setPolicyWarning('');
      }
    } else {
      setPolicyWarning('');
    }
  }, [amount, category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || !expenseDate || !businessPurpose.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('employeeId', employeeId || user?.employeeId || '');
      if (departmentId) formData.append('departmentId', departmentId);
      if (projectId) formData.append('projectId', projectId);
      formData.append('category', category);
      formData.append('amount', amount);
      formData.append('expenseDate', expenseDate);
      formData.append('businessPurpose', businessPurpose);
      formData.append('paymentMethod', paymentMethod);
      if (receiptFile) {
        formData.append('receipt', receiptFile);
      }

      await api.post('/expenses', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/expenses');
    } catch (err) {
      if (err.response?.data?.errorType === 'DUPLICATE_RECEIPT') {
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || 'Failed to submit expense.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-[#6C3CE8]" />
            Submit New Expense Claim
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Fill in the details, attach proof receipts, and submit for manager review.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <div>
              <strong className="block font-bold">Submission Blocked:</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {policyWarning && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
            <div>
              <strong className="block font-bold">Expense Policy Notice:</strong>
              <span>{policyWarning}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Information */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              1. Expense Claim Summary
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expense Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flight ticket to San Francisco for Cloud Summit"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="EMP-001"
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department *
                  </label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                    required
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Project (Optional)
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                  >
                    <option value="">-- No Specific Project --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Section 2: Expense Financials */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              2. Category & Amount
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label} (Max ${cat.max})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount ($ USD) *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expense Incurred Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Method *
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Business Purpose & Context *
              </label>
              <textarea
                rows={3}
                value={businessPurpose}
                onChange={(e) => setBusinessPurpose(e.target.value)}
                placeholder="Explain the business reason for this expenditure, event or equipment purchase..."
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6C3CE8]"
                required
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* Section 3: Receipt Upload with SHA-256 duplicate detection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                3. Receipt Upload & Duplicate Detection (PDF, JPG, PNG)
              </h3>
              <span className="text-[11px] text-purple-600 font-semibold flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                SHA-256 Hash Guard
              </span>
            </div>

            {!receiptFile ? (
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#6C3CE8] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors group bg-slate-50/50 dark:bg-slate-800/30">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#6C3CE8] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to upload receipt, invoice, or voucher
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supported formats: PDF, JPG, PNG (Max 25 MB)
                </p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,image/png,image/jpeg,image/jpg"
                  className="hidden"
                />
              </label>
            ) : (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-purple-50/30 dark:bg-purple-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Receipt preview"
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-[#6C3CE8] flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {receiptFile.name}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(receiptFile.size / 1024).toFixed(1)} KB • {receiptFile.type}
                    </p>
                    {fileHash && (
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-purple-700 dark:text-purple-300 font-mono">
                        <Hash className="w-3 h-3 text-[#6C3CE8]" />
                        <span>SHA-256: {fileHash.substring(0, 16)}...</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={removeReceipt}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => navigate('/expenses')}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#6C3CE8] hover:bg-[#5A2FD1] text-xs font-bold text-white shadow-md shadow-purple-500/25 transition-colors cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Submit Expense Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
