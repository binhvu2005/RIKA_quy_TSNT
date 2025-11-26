/**
 * Script lấy IP hiện tại của bạn để thêm vào MongoDB Atlas whitelist
 * Chạy: node get-my-ip.js
 */

const https = require('https');

console.log('🔍 Đang lấy IP hiện tại của bạn...\n');

https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      const ip = result.ip;
      
      console.log('✅ IP hiện tại của bạn:');
      console.log(`   ${ip}\n`);
      console.log('📝 Hướng dẫn thêm IP vào MongoDB Atlas:\n');
      console.log('1. Truy cập: https://cloud.mongodb.com/');
      console.log('2. Vào Security > Network Access');
      console.log('3. Click "Add IP Address"');
      console.log(`4. Nhập IP: ${ip}`);
      console.log('5. Click "Confirm"\n');
      console.log('📖 Xem file FIX_MONGODB_CONNECTION.md để biết chi tiết\n');
    } catch (error) {
      console.error('❌ Lỗi khi parse response:', error.message);
    }
  });
}).on('error', (err) => {
  console.error('❌ Lỗi khi lấy IP:', err.message);
  console.log('\n💡 Thử cách khác:');
  console.log('   - Truy cập: https://whatismyipaddress.com/');
  console.log('   - Hoặc chạy: curl ifconfig.me\n');
});

