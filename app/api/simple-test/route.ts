import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    message: 'Debug test successful',
    timestamp: new Date().toISOString(),
    serverWorking: true
  })
}
