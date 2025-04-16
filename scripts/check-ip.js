// Check your current IP address
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function checkIP() {
  try {
    // Try multiple IP checking services in case one is down
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipinfo.io/json',
      'https://api.myip.com'
    ];
    
    for (const service of services) {
      try {
        console.log(`Checking IP using ${service}...`);
        const response = await fetch(service);
        if (response.ok) {
          const data = await response.json();
          console.log('Your current IP address:');
          if (data.ip) {
            console.log(data.ip);
          } else {
            console.log(data); // Some services return different formats
          }
          return;
        }
      } catch (err) {
        console.log(`Service ${service} failed, trying next...`);
      }
    }
    
    console.error('All IP checking services failed.');
  } catch (error) {
    console.error('Error checking IP:', error);
  }
}

checkIP();
