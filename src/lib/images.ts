export const AMBIENT_IMAGES: Record<string, { url: string; alt: string; creditNote: string }> = {
  hero: {
    url: '/src/assets/images/hero_clinique_ambiance_1794565298582.jpg',
    alt: 'Illustration d’ambiance médicale : accueil lumineux et apaisant avec touches végétales',
    creditNote: 'Illustration d’ambiance médicale (visuel générique)',
  },
  nephrology: {
    url: '/src/assets/images/nephrology_care_ambiance_1794565298957.jpg',
    alt: 'Illustration d’ambiance médicale : consultation spécialisée attentive et sereine',
    creditNote: 'Illustration d’ambiance médicale (visuel générique)',
  },
  womens: {
    url: '/src/assets/images/womens_prenatal_ambiance_1794565299211.jpg',
    alt: 'Illustration d’ambiance médicale : accompagnement santé féminine et suivi prénatal',
    creditNote: 'Illustration d’ambiance médicale (visuel générique)',
  },
  lab: {
    url: '/src/assets/images/lab_diagnostics_ambiance_1794565299430.jpg',
    alt: 'Illustration d’ambiance médicale : espace analyses biomédicales et diagnostic',
    creditNote: 'Illustration d’ambiance médicale (visuel générique)',
  },
  prevention: {
    url: '/src/assets/images/prevention_wellness_ambiance_1794565300205.jpg',
    alt: 'Illustration d’ambiance médicale : entretien de prévention et surveillance tensionnelle',
    creditNote: 'Illustration d’ambiance médicale (visuel générique)',
  },
};

export function getAmbientImage(key: string) {
  return AMBIENT_IMAGES[key] || AMBIENT_IMAGES.hero;
}
