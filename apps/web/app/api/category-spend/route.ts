export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return Response.json([
      { category: 'Operations', spend: 9000 },
      { category: 'Marketing', spend: 7250 },
      { category: 'Facilities', spend: 1000 },
      { category: 'R&D', spend: 4000 },
    ]);
  }
  
  try {
    const response = await fetch(`${apiUrl}/category-spend`, {
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
    console.error('Error fetching category spend:', error);
    return Response.json([
      { category: 'Operations', spend: 9000 },
      { category: 'Marketing', spend: 7250 },
      { category: 'Facilities', spend: 1000 },
      { category: 'R&D', spend: 4000 },
    ]);
  }
}

