'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Search, ChevronDown, Upload, FileText, DollarSign, Users, TrendingUp, TrendingDown, Clock, Layers, Home, ChevronDown as ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const CATEGORY_COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444', '#6B7280'];
const parseFloatSafe = (value: any): number => {
    const rawValue = value && value.$numberDouble !== undefined ? value.$numberDouble : value;
    if (rawValue === null || rawValue === undefined || rawValue === "") return 0;
    const parsed = parseFloat(String(rawValue)); 
    return isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (amount: number | string | null | undefined, currency: string = '€'): string => {
    if (amount === null || amount === undefined || amount === "") return `${currency} 0.00`;
    
    if (typeof amount === 'string' && (amount.includes('+') || amount.includes('-') || amount.includes('%'))) {
        return amount;
    }
    
    const numericAmount = parseFloat(String(amount));
    if (isNaN(numericAmount)) return `${currency} 0.00`;

    return `${currency} ${numericAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- API FETCH HOOK ---
const useApiData = (endpoint: string, initialData: any = null) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}${endpoint}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
                }
                const result = await response.json();
                setData(result);
            } catch (err: any) {
                setError(err.message);
                console.error(`Fetch Error on ${endpoint}:`, err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [endpoint]);

    return { data, loading, error };
};

const OverviewCard = ({ title, value, delta, icon, color = 'blue' }: { title: string, value: string, delta: string, icon: React.ReactNode, color?: string }) => {
    const isPositive = delta && (delta.includes('+') || (!delta.includes('-') && !delta.includes('less')));
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-all duration-200 hover:border-gray-200">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-gray-600 leading-tight">{title}</h3>
                <div className={`p-2.5 rounded-lg shadow-sm ${
                    color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    'bg-green-50 text-green-600'
                }`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-900 mb-2 leading-none">{value}</p>
                <div className={`text-xs font-medium flex items-center gap-1 ${
                    isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{delta}</span>
                </div>
            </div>
        </div>
    );
};

const LineChartCard = ({ trends, loading }: { trends: any[], loading: boolean }) => {
    const chartData = useMemo(() => trends.map((t: any) => ({
        ...t,
        value: parseFloatSafe(t.value) 
    })), [trends]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-full xl:col-span-1 hover:shadow-md transition-shadow">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Volume + Value Trend</h2>
                <p className="text-sm text-gray-500">Invoice count and total spend over 12 months.</p>
            </div>

            <div className="min-h-[300px] flex items-center justify-center">
                {loading ? (
                    <div className="text-center text-gray-500">Loading chart data...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" stroke="#D1D5DB" tickLine={false} axisLine={false} />
                            <YAxis yAxisId="left" stroke="#3B82F6" tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <YAxis yAxisId="right" orientation="right" stroke="#8B5CF6" tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const year = payload[0]?.payload?.year || new Date().getFullYear();
                                    const count = payload.find(p => p.name === 'count')?.value || 0;
                                    const spend = payload.find(p => p.name === 'value')?.value || 0;
                                    return (
                                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm">
                                            <p className="font-bold text-gray-900 mb-2">{label} {year}</p>
                                            <p className="text-gray-600 mb-1">Invoice count: <span className="font-semibold text-gray-900">{count}</span></p>
                                            <p className="text-gray-600">Total Spend: <span className="font-semibold text-gray-900">{formatCurrency(spend)}</span></p>
                                        </div>
                                    );
                                }
                                return null;
                            }} />
                            <Area yAxisId="left" type="monotone" dataKey="value" stroke="#3B82F6" fillOpacity={1} fill="url(#colorValue)" name="Total Spend" />
                            <Area yAxisId="right" type="monotone" dataKey="count" stroke="#8B5CF6" fillOpacity={0} name="Invoice Count" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

const VendorChartCard = ({ vendors, loading }: { vendors: any[], loading: boolean }) => {
    const chartData = useMemo(() => vendors.map((v: any) => ({
        ...v,
        spend: parseFloatSafe(v.spend)
    })).sort((a, b) => b.spend - a.spend), [vendors]);
    
    const maxSpend = chartData.length > 0 ? Math.ceil(Math.max(...chartData.map(v => v.spend)) / 5000) * 5000 : 10000;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-full md:col-span-1 hover:shadow-md transition-shadow">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Spend by Vendor (Top 10)</h2>
                <p className="text-sm text-gray-500">Vendor spend with cumulative percentage distribution.</p>
            </div>
            <div className="min-h-[300px] flex items-center justify-center">
                {loading ? (
                    <div className="text-center text-gray-500">Loading vendor data...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <XAxis type="number" stroke="#D1D5DB" tickFormatter={(value) => formatCurrency(value, '€k').replace('€', '').replace('.00', '').replace(',', '.')} domain={[0, maxSpend]} axisLine={false} tickLine={false} />
                            <YAxis dataKey="vendor" type="category" stroke="#D1D5DB" axisLine={false} tickLine={false} width={100} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm">
                                            <p className="font-bold text-gray-900 mb-2">{label}</p>
                                            <p className="text-gray-600">Vendor Spend: <span className="font-semibold text-gray-900">{formatCurrency(payload[0].value)}</span></p>
                                        </div>
                                    );
                                }
                                return null;
                            }} />
                            <Bar dataKey="spend" fill="#3B82F6" name="Total Spend" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

const PieChartCard = ({ categories, loading }: { categories: any[], loading: boolean }) => {
    const chartData = useMemo(() => categories.map((c: any) => ({
        ...c,
        value: parseFloatSafe(c.spend)
    })), [categories]);

    const totalSpend = chartData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-full md:col-span-1 hover:shadow-md transition-shadow">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Spend by Category</h2>
                <p className="text-sm text-gray-500">Distribution of spending across different categories.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-around h-64">
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading categories...</div>
                ) : (
                    <>
                        <ResponsiveContainer width="40%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={40}
                                    fill="#8884d8"
                                    labelLine={false}
                                >
                                    {chartData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const percent = (payload[0].value / totalSpend * 100).toFixed(1);
                                        return (
                                            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm">
                                                <p className="font-bold text-gray-900 mb-2">{payload[0].payload.category}</p>
                                                <p className="text-gray-600">Spend: <span className="font-semibold text-gray-900">{formatCurrency(payload[0].value)}</span> ({percent}%)</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-full sm:w-auto mt-4 sm:mt-0 space-y-1">
                            {chartData.map((c: any, index: number) => (
                                <div key={index} className="flex justify-between text-sm py-1 min-w-[200px]">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}></div>
                                        <span className="text-gray-700">{c.category}</span>
                                    </div>
                                    <span className="font-medium text-gray-800">{formatCurrency(c.spend, '$')}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const OutflowChartCard = ({ outflow, loading }: { outflow: any[], loading: boolean }) => {
    const chartData = useMemo(() => outflow.map((c: any) => ({
        ...c,
        amount: parseFloatSafe(c.amount)
    })), [outflow]);

    const maxAmount = chartData.length > 0 ? Math.ceil(Math.max(...chartData.map(c => c.amount)) / 10000) * 10000 : 50000;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-full md:col-span-1 hover:shadow-md transition-shadow">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Cash Outflow Forecast</h2>
                <p className="text-sm text-gray-500">Expected payment obligations grouped by due date ranges.</p>
            </div>
            
            <div className="min-h-[300px] flex items-center justify-center">
                {loading ? (
                    <div className="text-center text-gray-500 py-20">Loading forecast...</div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <XAxis dataKey="label" stroke="#D1D5DB" tickLine={false} axisLine={false} />
                            <YAxis stroke="#D1D5DB" tickFormatter={(value) => formatCurrency(value, '€k').replace('€', '').replace('.00', '').replace(',', '.')} domain={[0, maxAmount]} axisLine={false} tickLine={false} />
                            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                            <Tooltip content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl text-sm">
                                            <p className="font-bold text-gray-900 mb-2">{label}</p>
                                            <p className="text-gray-600">Amount: <span className="font-semibold text-gray-900">{formatCurrency(payload[0].value)}</span></p>
                                        </div>
                                    );
                                }
                                return null;
                            }} />
                            <Bar dataKey="amount" fill="#F59E0B" name="Amount Due" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

const InvoicesTable = ({ invoices, loading }: { invoices: any[], loading: boolean }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredInvoices = useMemo(() => {
        if (!searchTerm) return invoices;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return invoices.filter((inv: any) =>
            inv.vendor.toLowerCase().includes(lowerCaseSearch) ||
            inv.id.toLowerCase().includes(lowerCaseSearch) ||
            inv.netValue.toLowerCase().includes(lowerCaseSearch)
        );
    }, [invoices, searchTerm]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-full hover:shadow-md transition-shadow">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Invoices by Vendor</h2>
                <p className="text-sm text-gray-500">Top vendors by invoice count and net value.</p>
            </div>
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by Vendor or Invoice"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-gray-50 placeholder:text-gray-400"
                />
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Value</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading invoices...</td></tr>
                        ) : filteredInvoices.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-500">No invoices match your search.</td></tr>
                        ) : (
                            filteredInvoices.map((inv: any, index: number) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{inv.vendor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-mono">{inv.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{inv.netValue}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{inv.dueDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            inv.status.includes('Credit') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            {!loading && filteredInvoices.length > 0 && (
                <div className="mt-4 text-sm text-gray-500">Showing {filteredInvoices.length} of {invoices.length} total invoices.</div>
            )}
        </div>
    );
};

export default function Dashboard() {
    const { data: stats, loading: loadingStats } = useApiData('/stats');
    const { data: invoices, loading: loadingInvoices } = useApiData('/invoices', []);
    const { data: topVendors, loading: loadingVendors } = useApiData('/vendors/top10', []);
    const { data: trends, loading: loadingTrends } = useApiData('/invoice-trends', []);
    const { data: categories, loading: loadingCategories } = useApiData('/category-spend', []);
    const { data: outflow, loading: loadingOutflow } = useApiData('/cash-outflow', []);

    const placeholderStats = {
        totalSpend: "€ 0.00",
        totalInvoices: 0,
        documentsUploaded: 0,
        averageInvoiceValue: "€ 0.00",
        spendDelta: "+0.0%",
        invoicesDelta: "+0.0%",
        docsDelta: "0 less",
        avgValueDelta: "+0.0%"
    };
    const currentStats = stats || placeholderStats;

    const cardData = useMemo(() => [
        { title: "Total Spend (YTD)", value: currentStats.totalSpend, delta: currentStats.spendDelta, icon: <DollarSign className="w-5 h-5" />, color: 'blue' },
        { title: "Total Invoices Processed", value: currentStats.totalInvoices.toString(), delta: currentStats.invoicesDelta, icon: <Layers className="w-5 h-5" />, color: 'blue' },
        { title: "Documents Uploaded (This Month)", value: currentStats.documentsUploaded.toString(), delta: currentStats.docsDelta, icon: <Upload className="w-5 h-5" />, color: 'purple' },
        { title: "Average Invoice Value", value: currentStats.averageInvoiceValue, delta: currentStats.avgValueDelta, icon: <DollarSign className="w-5 h-5" />, color: 'blue' },
    ], [currentStats]);

    return (
        <div className="min-h-screen bg-gray-50 flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <aside className="w-64 bg-white p-6 border-r border-gray-200 hidden lg:flex flex-col fixed h-screen">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            A
                        </div>
                        <div className="flex-1">
                            <div className="text-gray-900 font-semibold text-base">Analytics</div>
                        </div>
                        <ChevronDownIcon className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                    </div>
                </div>

                <div className="mb-8 flex-1">
                    <nav className="space-y-1">
                        <Link href="/chat" className="flex items-center p-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors group">
                            <Users className="w-4 h-4 mr-3 text-gray-500 group-hover:text-blue-600" /> 
                            <span className="font-medium">Chat with Data</span>
                        </Link>
                        <Link href="/" className="flex items-center p-2.5 rounded-lg bg-blue-50 text-blue-600 font-medium shadow-sm">
                            <Home className="w-4 h-4 mr-3" /> 
                            <span>Dashboard</span>
                        </Link>
                    </nav>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-xs">F</span>
                        </div>
                        <span className="text-gray-900 font-bold text-sm">Flowbit AI</span>
                    </div>
                </div>
            </aside>

            <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900">Shiva</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                            S
                        </div>
                    </div>
                </header>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {loadingStats ? (
                         [1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-36 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        ))
                    ) : (
                        cardData.map((card, index) => (
                            <OverviewCard key={index} {...card} />
                        ))
                    )}
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <LineChartCard trends={trends} loading={loadingTrends} />
                    <VendorChartCard vendors={topVendors} loading={loadingVendors} />
                    <PieChartCard categories={categories} loading={loadingCategories} />
                    <OutflowChartCard outflow={outflow} loading={loadingOutflow} />
                </section>

                <section>
                    <InvoicesTable invoices={invoices} loading={loadingInvoices} />
                </section>
            </main>
        </div>
    );
}