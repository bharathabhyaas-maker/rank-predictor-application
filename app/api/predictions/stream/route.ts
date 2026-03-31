import { NextRequest, NextResponse } from 'next/server'

// Global storage for latest prediction (shared across API routes)
declare global {
  var latestPrediction: any
}

export async function GET(request: NextRequest) {
  try {
    // Create SSE response
    const encoder = new TextEncoder()
    
    const stream = new ReadableStream({
      async start(controller) {
        console.log('📡 SSE stream starting...')
        
        // Send initial connection message
        const data = `data: ${JSON.stringify({
          type: "connected", 
          message: "Connected to prediction updates stream",
          timestamp: Date.now()
        })}\n\n`
        
        controller.enqueue(encoder.encode(data))
        console.log('📡 Sent initial connection message')
        
        // Send latest prediction if available
        if (global.latestPrediction) {
          const predictionData = `data: ${JSON.stringify({
            type: "new_prediction",
            data: global.latestPrediction,
            timestamp: Date.now()
          })}\n\n`
          
          controller.enqueue(encoder.encode(predictionData))
          console.log('📡 Sent latest prediction to SSE stream:', global.latestPrediction.id)
        } else {
          console.log('📡 No latest prediction available on connection')
        }
        
        // Keep connection alive with periodic ping
        const pingInterval = setInterval(() => {
          try {
            const pingData = `data: ${JSON.stringify({
              type: "ping", 
              timestamp: Date.now()
            })}\n\n`
            controller.enqueue(encoder.encode(pingData))
            console.log('📡 Sent ping message')
          } catch (error) {
            console.error('📡 Error sending ping:', error)
          }
        }, 30000) // Ping every 30 seconds
        
        // Check for new predictions periodically
        const checkInterval = setInterval(() => {
          try {
            if (global.latestPrediction) {
              const predictionData = `data: ${JSON.stringify({
                type: "new_prediction",
                data: global.latestPrediction,
                timestamp: Date.now()
              })}\n\n`
              
              controller.enqueue(encoder.encode(predictionData))
              console.log('📡 Sent prediction update to SSE stream:', global.latestPrediction.id)
            }
          } catch (error) {
            console.error('📡 Error checking for predictions:', error)
          }
        }, 1000) // Check every second
        
        // Cleanup on disconnect
        request.signal.addEventListener('abort', () => {
          console.log('📡 SSE stream closing...')
          clearInterval(pingInterval)
          clearInterval(checkInterval)
          controller.close()
          console.log('📡 SSE stream closed')
        })
      },
    })

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    
  } catch (error) {
    console.error('SSE Stream Error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
