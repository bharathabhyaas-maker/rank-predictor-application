// Test script to check current user login state
console.log('🔍 Checking current user login state...');

// Get user from localStorage
const savedUser = localStorage.getItem("user");
console.log('🔍 Saved user data:', savedUser);

if (savedUser) {
  const user = JSON.parse(savedUser);
  console.log('🔍 Parsed user data:', user);
  console.log('🔍 User institution:', user?.institution);
  console.log('🔍 User institutionId:', user?.institutionId);
  console.log('🔍 User role:', user?.role);
  
  // Check if user has institution data
  if (user?.institution?.id) {
    console.log('✅ User has institution.id:', user.institution.id);
  } else if (user?.institutionId) {
    console.log('✅ User has institutionId:', user.institutionId);
  } else {
    console.log('❌ User has no institution ID');
  }
} else {
  console.log('❌ No user found in localStorage');
}

// Test API call to get templates for a known institution
const testInstitutionId = 'cmmj4w3y30000e8lhfe3figk1'; // Test Institution API
console.log(`🔍 Testing API call for institution ${testInstitutionId}...`);

fetch(`/api/institution-templates?institutionId=${testInstitutionId}`)
  .then(response => {
    console.log('🔍 API Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('🔍 API Response data:', data);
    console.log('🔍 Number of templates:', data.length);
  })
  .catch(error => {
    console.error('❌ API call failed:', error);
  });
