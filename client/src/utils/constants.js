// Enums
export const CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Street Light',
  'Drainage',
  'Traffic Signal',
  'Public Property Damage',
  'Other'
];

export const STATUSES = [
  'Reported',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Rejected'
];

export const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export const ROLES = ['citizen', 'officer', 'admin'];

// Display formatting
export const STATUS_COLORS = {
  'Reported': 'default',     // maps to bg-gray-100 text-gray-700
  'Under Review': 'info',    // maps to bg-blue-100 text-blue-700
  'Assigned': 'purple',      // maps to bg-violet-100 text-violet-700
  'In Progress': 'warning',  // maps to bg-amber-100 text-amber-700
  'Resolved': 'success',     // maps to bg-emerald-100 text-emerald-700
  'Rejected': 'danger'       // maps to bg-red-100 text-red-700
};

export const SEVERITY_COLORS = {
  'Low': 'success',
  'Medium': 'warning',
  'High': 'orange',          // Assuming custom orange color variant
  'Critical': 'danger'
};

export const CATEGORY_COLORS = {
  'Road Damage': '#dc2626', // red
  'Garbage': '#059669',     // emerald
  'Water Leakage': '#3b82f6', // blue
  'Street Light': '#f59e0b',  // amber
  'Drainage': '#0891b2',      // cyan
  'Traffic Signal': '#eab308', // yellow
  'Public Property Damage': '#7c3aed', // violet
  'Other': '#64748b'          // slate
};
