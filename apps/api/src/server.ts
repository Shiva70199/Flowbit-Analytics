
import express from 'express';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const port = parseInt(process.env.PORT || '3001', 10);

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
}));
app.use(express.json());

const parseFloatSafe = (value: any): number => {
    const rawValue = value && value.$numberDouble !== undefined ? value.$numberDouble : value;
    if (rawValue === null || rawValue === undefined || rawValue === "") return 0;
    const parsed = parseFloat(String(rawValue)); 
    return isNaN(parsed) ? 0 : parsed;
};

const formatCurrency = (amount: number | bigint | null | undefined, currency: string = '€'): string => {
    if (amount === null || amount === undefined) return `${currency} 0.00`;
    const numericAmount = typeof amount === 'bigint' ? Number(amount) : amount;
    return `${currency} ${numericAmount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

type InvoiceRow = {
    invoiceId: string;
    invoiceTotal: number | null;
    currencySymbol: string | null;
    dueDate: Date | null;
    invoiceDate: Date;
    documentType: string | null;
    vendor: { name: string };
};

type VendorGroup = {
    vendorId: string;
    _sum: { invoiceTotal: number | null };
};

type TrendData = {
    invoiceDate: Date;
    invoiceTotal: number | null;
};

app.get('/stats', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const monthStart = new Date(new Date().setDate(1)); 

    const spendResult = await prisma.invoice.aggregate({
      _sum: { invoiceTotal: true },
      where: { invoiceDate: { gte: yearStart } }
    });

    const totalInvoices = await prisma.invoice.count();

    const documentsUploaded = await prisma.document.count({
        where: { createdAt: { gte: monthStart } }
    });
    
    const avgValueResult = await prisma.invoice.aggregate({
        _avg: { invoiceTotal: true }
    });
    
    res.json({
      totalSpend: formatCurrency(spendResult._sum.invoiceTotal),
      totalInvoices: totalInvoices,
      documentsUploaded: documentsUploaded,
      averageInvoiceValue: formatCurrency(avgValueResult._avg.invoiceTotal),
      spendDelta: "+8.2% from last month",
      invoicesDelta: "+8.2% from last month",
      docsDelta: "-8 less from last month",
      avgValueDelta: "+8.2% from last month"
    });

  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

app.get('/invoices', async (req, res) => {
    try {
        const invoices: InvoiceRow[] = await prisma.invoice.findMany({
            take: 100,
            select: {
                invoiceId: true,
                invoiceTotal: true,
                currencySymbol: true,
                dueDate: true,
                invoiceDate: true,
                documentType: true,
                vendor: { select: { name: true } },
            },
            orderBy: {
                invoiceDate: 'desc',
            }
        }) as InvoiceRow[];

        const formattedInvoices = invoices.map((inv: InvoiceRow) => ({
            id: inv.invoiceId,
            vendor: inv.vendor.name,
            date: inv.invoiceDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            status: inv.documentType === 'creditNote' ? 'Credit Issued' : 'Paid', 
            netValue: formatCurrency(inv.invoiceTotal, inv.currencySymbol || undefined),
            dueDate: inv.dueDate ? inv.dueDate.toLocaleDateString('en-US') : 'N/A'
        }));

        res.json(formattedInvoices);

    } catch (error) {
        console.error("Error fetching invoice table data:", error);
        res.status(500).json({ error: "Failed to fetch invoice list" });
    }
});

app.get('/vendors/top10', async (req, res) => {
    try {
        const rawTopVendors: any = await prisma.invoice.groupBy({
            by: ['vendorId'],
            _sum: { invoiceTotal: true },
            orderBy: {
                _sum: { invoiceTotal: 'desc' },
            },
            take: 10,
        });

        const topVendors = rawTopVendors as VendorGroup[]; 

        const vendorIds = topVendors.map((v: VendorGroup) => v.vendorId);
        const vendors = await prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, name: true },
        });

        const vendorMap = new Map(vendors.map((v: { id: any; name: any; }) => [v.id, v.name]));

        const chartData = topVendors.map((v: VendorGroup) => ({
            vendor: vendorMap.get(v.vendorId) || 'Unknown',
            spend: v._sum.invoiceTotal || 0,
        }));

        res.json(chartData);
        
    } catch (error) {
        console.error("Error fetching top vendors:", error);
        res.status(500).json({ error: "Failed to fetch top vendors data" });
    }
});
app.get('/invoice-trends', async (req, res) => {
    try {
        const allInvoices: TrendData[] = await prisma.invoice.findMany({
            select: {
                invoiceDate: true,
                invoiceTotal: true,
            }
        }) as TrendData[];

        const monthlyData = allInvoices.reduce((acc: Record<string, { count: number, value: number, date: Date }>, invoice: TrendData) => {
            const date = invoice.invoiceDate;
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`; 
            
            if (!acc[monthKey]) {
                acc[monthKey] = { count: 0, value: 0, date: date };
            }

            acc[monthKey].count += 1;
            acc[monthKey].value += invoice.invoiceTotal || 0;

            return acc;
        }, {});
        
        const sortedData = Object.keys(monthlyData)
            .map((key: string) => ({
                month: monthlyData[key].date.toLocaleString('en-US', { month: 'short' }),
                year: monthlyData[key].date.getFullYear(),
                count: monthlyData[key].count,
                value: parseFloatSafe(monthlyData[key].value),
            }))
            .sort((a, b) => new Date(a.year, a.month as any).getTime() - new Date(b.year, b.month as any).getTime())
            .slice(-12); 

        res.json(sortedData);

    } catch (error) {
        console.error("Error fetching invoice trends:", error);
        res.status(500).json({ error: "Failed to fetch invoice trend data" });
    }
});


app.get('/category-spend', (req, res) => {
    res.json([
        { category: 'Operations', spend: 9000 },
        { category: 'Marketing', spend: 7250 },
        { category: 'Facilities', spend: 1000 },
        { category: 'R&D', spend: 4000 },
    ]);
});

app.get('/cash-outflow', (req, res) => {
    res.json([
        { label: '0 - 7 days', amount: 5000 },
        { label: '8 - 30 days', amount: 12000 },
        { label: '31 - 60 days', amount: 20000 },
        { label: '60+ days', amount: 45000 },
    ]);
});


app.post('/chat-with-data', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        const vannaUrl = process.env.VANNA_API_BASE_URL || 'http://localhost:8000';

        const vannaResponse = await fetch(`${vannaUrl}/vanna/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!vannaResponse.ok) {
            let errorData;
            try {
                errorData = await vannaResponse.json();
            } catch {
                errorData = { error: `HTTP ${vannaResponse.status}: ${vannaResponse.statusText}` };
            }
            const errorMessage = errorData.detail || errorData.error || 'Vanna AI service error';
            console.error('Vanna AI error:', errorMessage);
            throw new Error(errorMessage);
        }

        const vannaData = await vannaResponse.json();

        res.json({
            sql: vannaData.sql,
            results: vannaData.results,
            message: vannaData.message || 'Query successful',
        });
    } catch (error: any) {
        console.error('Error in chat-with-data:', error);
        res.status(500).json({
            error: 'Failed to process query',
            message: error.message || 'An error occurred while processing your query',
        });
    }
});

if (process.env.VERCEL !== '1') {
  app.listen(port, () => {
    console.log(`Flowbit Analytics API running on http://localhost:${port}`);
  });
}

export default app;