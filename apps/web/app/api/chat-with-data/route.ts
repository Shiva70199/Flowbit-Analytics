export async function POST(request: Request) {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return Response.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const response = await fetch(`${apiUrl}/chat-with-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error('Error in chat-with-data:', error);
    return Response.json(
      { error: 'Failed to process query', message: error.message },
      { status: 500 }
    );
  }
}

