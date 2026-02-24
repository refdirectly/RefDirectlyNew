// Run this in your browser console to debug token issues
console.log('=== Token Debug Info ===');
const token = localStorage.getItem('token');
console.log('Token exists:', !!token);
console.log('Token length:', token?.length || 0);
console.log('Token preview:', token?.substring(0, 50) + '...');

// Test API call
const API_URL = 'http://localhost:3001';
fetch(`${API_URL}/api/profile`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));
