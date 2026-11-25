const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

export const money = (n) => peso.format(n);

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });

export const pad2 = (n) => String(n).padStart(2, '0');
