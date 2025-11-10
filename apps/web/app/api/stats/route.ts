export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
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
  
  try {
    const response = await fetch(`${apiUrl}/stats`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return Response.json(data);
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

