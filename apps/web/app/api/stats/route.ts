export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch(`${apiUrl}/stats`, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      return Response.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return Response.json({
      totalSpend: "€ 0.00",
      totalInvoices: 0,
      documentsUploaded: 0,
      averageInvoiceValue: "€ 0.00",
      spendDelta: "+0.0% from last month",
      invoicesDelta: "+0.0% from last month",
      docsDelta: "0 less from last month",
      avgValueDelta: "+0.0% from last month"
    });
  }
}

