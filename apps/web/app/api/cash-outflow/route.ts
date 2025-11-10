export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return Response.json([
      { label: '0 - 7 days', amount: 5000 },
      { label: '8 - 30 days', amount: 12000 },
      { label: '31 - 60 days', amount: 20000 },
      { label: '60+ days', amount: 45000 },
    ]);
  }
  
  try {
    const response = await fetch(`${apiUrl}/cash-outflow`, {
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
    console.error('Error fetching cash outflow:', error);
    return Response.json([
      { label: '0 - 7 days', amount: 5000 },
      { label: '8 - 30 days', amount: 12000 },
      { label: '31 - 60 days', amount: 20000 },
      { label: '60+ days', amount: 45000 },
    ]);
  }
}

