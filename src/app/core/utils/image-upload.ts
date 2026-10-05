/**
 * Preparo de imagem antes do upload (§8.14).
 *
 * O back-end **não aceita HEIC/HEIF** (padrão do iPhone) — a conversão é do
 * front. Fazemos via `canvas`: o iOS/Safari (de onde o HEIC vem) decodifica o
 * formato num `<img>`, então desenhamos no canvas e exportamos JPEG, sem
 * dependência extra. Em navegadores que não decodificam HEIC a Promise rejeita
 * com mensagem amigável (caso raro fora do iPhone).
 */

const HEIC_RE = /^image\/(heic|heif)$|\.(heic|heif)$/i;

/** O arquivo é HEIC/HEIF? (por mime-type ou extensão — o iOS às vezes manda type vazio). */
export function isHeic(file: File): boolean {
  return HEIC_RE.test(file.type) || HEIC_RE.test(file.name);
}

/** Converte um HEIC/HEIF em JPEG via canvas. */
export function convertHeicToJpeg(file: File): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível preparar a imagem.'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Não foi possível converter a imagem.'));
              return;
            }
            const nome = file.name.replace(/\.(heic|heif)$/i, '.jpg') || 'foto.jpg';
            resolve(new File([blob], nome, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.9,
        );
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Formato de imagem não suportado neste navegador (HEIC).'));
    };
    img.src = url;
  });
}

/**
 * Normaliza o arquivo antes de enviar. Hoje só trata HEIC→JPEG; qualquer outro
 * formato passa direto. Centraliza o preparo para todas as telas de upload.
 */
export function prepareImageUpload(file: File): Promise<File> {
  return isHeic(file) ? convertHeicToJpeg(file) : Promise.resolve(file);
}
