export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    const body = await request.json().catch(() => ({}));
    const { query } = body;
    
    if (!query) {
      return Response.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      const response = await fetch(`${apiUrl}/chat-with-data`, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `API responded with status ${response.status}`);
      }
      
      const data = await response.json();
      return Response.json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Error in chat-with-data:', error);
    return Response.json(
      { error: 'Failed to process query', message: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

