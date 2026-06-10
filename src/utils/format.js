const { applicationStatuses } = require('../config/app');

function statusLabel(status) {
  return applicationStatuses.find((item) => item.value === status)?.label || status;
}

function formatDate(value) {
  if (!value) {
    return '';
  }
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }
  const date = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function fileSize(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} Ko`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
}

function slugify(input) {
  return String(input)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function isApplicationOpen(deadline) {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayKey = `${today.getFullYear()}-${month}-${day}`;
  return todayKey <= deadline;
}

module.exports = {
  statusLabel,
  formatDate,
  formatDateTime,
  fileSize,
  slugify,
  isApplicationOpen
};
