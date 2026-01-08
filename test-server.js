const http = require('http');

// Simple server that acts as a placeholder
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    message: 'Public Access Point', 
    status: 'running',
    timestamp: new Date().toISOString()
  }, null, 2));
});

const PORT = 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});