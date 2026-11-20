export const CLINIC_INFO = {
  name: 'Clinique EVA',
  address: 'Agoè Démakpoé, Lomé, Togo',
  landmark: 'Derrière le Bar Le Sourire',
  phone: '+228 90 72 20 01',
  phoneLink: '+22890722001',
  whatsappLink: 'https://wa.me/22890722001',
  latitude: 6.2368007,
  longitude: 1.20786214,
  directionsUrl:
    'https://www.google.com/maps/dir/?api=1&destination=6.2368007%2C1.20786214',
  timeZone: 'Africa/Lome',
} as const;

export const CLINIC_HOURS = [
  { day: 'Lundi', hours: '07:00–18:00' },
  { day: 'Mardi', hours: '07:00–18:00' },
  { day: 'Mercredi', hours: '07:00–18:00' },
  { day: 'Jeudi', hours: '07:00–18:00' },
  { day: 'Vendredi', hours: '07:00–18:00' },
  { day: 'Samedi', hours: '07:00–13:30' },
  { day: 'Dimanche', hours: 'Fermé' },
] as const;

export const CLINIC_HOURS_SUMMARY =
  'Lun–Ven 07:00–18:00 · Sam 07:00–13:30 · Dim fermé';
