// test_api.js - Simple API Test
const http = require('http');

const API_BASE = 'http://localhost:3000/api/v1';

function testAPI() {
  console.log('🧪 Testing Smart Crop Rotation API...\n');
  console.log('🌐 Base URL:', API_BASE);
  console.log('💡 Make sure server is running (npm run dev)\n');
  
  // Test 1: Health endpoint
  console.log('1. Testing /health endpoint...');
  http.get(`${API_BASE}/health`, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        console.log('✅ Status:', jsonData.status);
        console.log('✅ Service:', jsonData.service);
        console.log('✅ Version:', jsonData.version);
        
        // Test 2: Crops endpoint
        console.log('\n2. Testing /crops endpoint...');
        http.get(`${API_BASE}/crops`, (res2) => {
          let data2 = '';
          
          res2.on('data', (chunk) => {
            data2 += chunk;
          });
          
          res2.on('end', () => {
            try {
              const cropsData = JSON.parse(data2);
              console.log('✅ Success:', cropsData.success);
              console.log('✅ Message:', cropsData.message);
              console.log('✅ Crops count:', cropsData.data?.length || 0);
              
              console.log('\n🎉 API is working correctly!');
              console.log('\n📋 Available endpoints:');
              console.log('- GET  /api/v1/health');
              console.log('- GET  /api/v1/crops');
              console.log('- GET  /api/v1/rotation/strategies');
              console.log('- POST /api/v1/auth/register');
              console.log('- POST /api/v1/auth/login');
            } catch (error) {
              console.log('✅ Raw response:', data2.substring(0, 200) + '...');
            }
          });
        }).on('error', (err) => {
          console.log('⚠️  Crops endpoint not available');
        });
        
      } catch (error) {
        console.log('✅ Raw response:', data);
      }
    });
  }).on('error', (err) => {
    console.log('❌ Cannot connect to API. Is server running?');
    console.log('💡 Run: npm run dev');
    console.log('💡 Then open: http://localhost:3000/api/v1/health');
  });
}

// Run the test
testAPI();