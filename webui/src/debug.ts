// Debug helper to check environment variables
export function logEnvironment() {
  console.log('=== Environment Debug ===');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('MODE:', import.meta.env.MODE);
  console.log('DEV:', import.meta.env.DEV);
  console.log('PROD:', import.meta.env.PROD);
  console.log('All env:', import.meta.env);
  console.log('=========================');
}
