import React from 'react';

export function getWhatsAppLink(message, phone) {
  const base = phone ? `https://wa.me/${phone.replace(/\D/g, '')}` : 'https://wa.me/';
  const url = `${base}?text=${encodeURIComponent(message)}`;
  return url;
}

export function shareOnWhatsApp(message, phone) {
  const whatsappUrl = getWhatsAppLink(message, phone);
  window.open(whatsappUrl, '_blank');
}