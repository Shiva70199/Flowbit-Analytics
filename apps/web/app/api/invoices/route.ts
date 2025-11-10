export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return Response.json([]);
  }
  
  try {
    const response = await fetch(`${apiUrl}/invoices`, {
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
    console.error('Error fetching invoices:', error);
    return Response.json([]);
  }
}

