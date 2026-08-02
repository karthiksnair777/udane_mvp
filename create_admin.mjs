import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://gr7iqpxc.us-east.insforge.app',
  anonKey: 'ik_1e7611dd8d3bf1234cabf4ebcb7e1b38'
});

async function run() {
  const { data, error } = await client.auth.signUp({
    email: 'superadmin@udane.com',
    password: 'password123'
  });
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

run();
