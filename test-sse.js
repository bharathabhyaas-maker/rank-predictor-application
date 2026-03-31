// Test SSE connection
console.log('🧪 TESTING SSE CONNECTION...');

const eventSource = new EventSource('http://localhost:3000/api/predictions/stream');

eventSource.onopen = () => {
  console.log('✅ SSE connection established');
};

eventSource.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log('📡 SSE message received:', data);
    
    if (data.type === 'connected') {
      console.log('✅ Connected to SSE stream');
    } else if (data.type === 'ping') {
      console.log('💓 Ping received');
    } else if (data.type === 'new_prediction') {
      console.log('🆕 New prediction received:', data.data);
      console.log('✅ SSE system working!');
    }
  } catch (error) {
    console.error('Error parsing SSE message:', error);
  }
};

eventSource.onerror = (error) => {
  console.error('❌ SSE connection error:', error);
};

setTimeout(() => {
  console.log('🔍 Closing SSE connection after 10 seconds...');
  eventSource.close();
}, 10000);
