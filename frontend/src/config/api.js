// Centralized API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Remove trailing /api/v1 if it exists in env to normalize
const normalizedURL = API_BASE_URL.replace(/\/api\/v1$/, '');
export const API_URL = normalizedURL;
export const API_ENDPOINTS = {
  // Auth
  login: `${normalizedURL}/api/v1/auth/login`,
  logout: `${normalizedURL}/api/v1/auth/logout`,
  verify: `${normalizedURL}/api/v1/auth/verify`,
  
  // Admin
  adminDepartments: `${normalizedURL}/api/v1/auth/admin/departments`,
  adminUsers: `${normalizedURL}/api/v1/auth/admin/users`,
  
  // Departments
  tensile: `${normalizedURL}/api/v1/tensile`,
  impactTests: `${normalizedURL}/api/v1/impact-tests`,
  microTensile: `${normalizedURL}/api/v1/micro-tensile`,
  microStructure: `${normalizedURL}/api/v1/micro-structure`,
  qcReports: `${normalizedURL}/api/v1/qc-reports`,
  process: `${normalizedURL}/api/v1/process`,
  sandTestingRecords: `${normalizedURL}/api/v1/sand-testing-records`,
  foundrySandTestingNotes: `${normalizedURL}/api/v1/foundry-sand-testing-notes`,
  mouldingDisa: `${normalizedURL}/api/v1/moulding-disa`,
  mouldingDmm: `${normalizedURL}/api/v1/moulding-dmm`,
  meltingLogs: `${normalizedURL}/api/v1/melting-logs`,
  cupolaLogs: `${normalizedURL}/api/v1/cupola-logs`,
};

export default API_URL;
