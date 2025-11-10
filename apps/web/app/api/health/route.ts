export async function GET() {
  const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
  return Response.json({
    status: 'ok',
    runtime: 'node',
    apiUrlConfigured: Boolean(apiUrl),
    apiUrl: apiUrl || null,
    timestamp: new Date().toISOString(),
  });
}
