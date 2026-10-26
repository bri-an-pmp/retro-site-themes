// Photo collections for the Memories section.
// To add a collection: put the photos in assets/photos/<id>/ as 01.jpg, 01-thumb.jpg, …
// (or 01.svg, … with ext: 'svg', which needs no thumbnails) and add an entry here.
// Sizes are width × height in pixels (large, then thumbnail).
// The two collections below are original placeholder artwork: replace them with yours.
export const ALBUMS = [
  {
    id: 'night-city',
    ext: 'svg',
    title: { en: 'Night City', es: 'Ciudad de noche' },
    subtitle: { en: 'Sample collection: replace with your photos', es: 'Colección de ejemplo: reemplácela con sus fotos' },
    cover: 1,
    preview: [1, 2, 3, 4],
    photos: [
      { w: 1200, h: 900, tw: 560, th: 420, en: 'Skyline at dusk', es: 'Rascacielos al anochecer' },
      { w: 1200, h: 900, tw: 560, th: 420, en: 'Ember glow', es: 'Resplandor de brasas' },
      { w: 1200, h: 900, tw: 560, th: 420, en: 'Blue hour', es: 'Hora azul' },
      { w: 1200, h: 900, tw: 560, th: 420, en: 'Late lights', es: 'Luces de madrugada' },
    ],
  },
  {
    id: 'neon-signs',
    ext: 'svg',
    title: { en: 'Neon Signs', es: 'Letreros de neón' },
    subtitle: { en: 'Sample collection: replace with your photos', es: 'Colección de ejemplo: reemplácela con sus fotos' },
    cover: 2,
    preview: [2, 1, 3],
    photos: [
      { w: 900, h: 1200, tw: 420, th: 560, en: 'Open all night', es: 'Abierto toda la noche' },
      { w: 900, h: 1200, tw: 420, th: 560, en: 'Noodle bar', es: 'Barra de fideos' },
      { w: 900, h: 1200, tw: 420, th: 560, en: 'Corner café', es: 'Café de la esquina' },
    ],
  },
];

export const photoSrc = (album, i, thumb = false) => {
  const ext = album.ext || 'jpg';
  const suffix = thumb && ext !== 'svg' ? '-thumb' : '';
  return `assets/photos/${album.id}/${String(i + 1).padStart(2, '0')}${suffix}.${ext}`;
};
