import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Test upload endpoint called');
    
    // Get the request body
    const body = await request.json();
    
    // Return a success response
    return NextResponse.json({
      message: 'Test upload endpoint working',
      receivedData: body,
      success: true
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error in test upload endpoint:', error);
    return NextResponse.json(
      { error: error.message || 'Test upload failed' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}