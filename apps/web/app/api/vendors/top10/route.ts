export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${apiUrl}/vendors/top10`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error('Error fetching top vendors:', error);
    return Response.json(
      { error: 'Failed to fetch top vendors', message: error.message },
      { status: 500 }
    );
  }
}

