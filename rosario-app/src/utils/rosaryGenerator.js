import audioLibrary from '../data/audioLibrary.json';

const getAudioUrl = (id, type) => {
  const list = type === 'prayer' ? audioLibrary.prayers : audioLibrary.mysteries;
  return list.find((item) => item.id === id)?.src || null;
};

export const buildRosarySequence = (mysteryId, audioCatalog = []) => {
  const sequence = [
    { id: 'sign_of_cross', type: 'prayer' },
    { id: 'credo', type: 'prayer' },
    { id: 'padre_nuestro', type: 'prayer' },
    { id: 'ave_maria', type: 'prayer' },
    { id: 'ave_maria', type: 'prayer' },
    { id: 'ave_maria', type: 'prayer' },
    { id: 'gloria', type: 'prayer' },
  ];

  for (let i = 1; i <= 5; i += 1) {
    sequence.push({ id: `${mysteryId}_${i}`, type: 'mystery' });
    sequence.push({ id: 'padre_nuestro', type: 'prayer' });
    for (let j = 0; j < 10; j += 1) sequence.push({ id: 'ave_maria', type: 'prayer' });
    sequence.push({ id: 'gloria', type: 'prayer' }, { id: 'fatima', type: 'prayer' });
  }
  sequence.push({ id: 'salve', type: 'prayer' });

  return sequence.map((step) => {
    const remote = audioCatalog.find((item) => item.id === step.id);
    const url = remote?.url || remote?.src || getAudioUrl(step.id, step.type);
    return url ? { ...step, url } : { ...step, url: null, error: 'Not found' };
  });
};

// TODO: Implement audio concatenation without a CDN dependency.
export const generateRosaryAudio = async () => {
  throw new Error('La generación de audio combinado aún no está disponible en la versión estática.');
};
