import { isHeic, prepareImageUpload } from './image-upload';

function file(name: string, type: string): File {
  return new File([new Blob(['x'])], name, { type });
}

describe('image-upload (§8.14 HEIC)', () => {
  it('isHeic detecta por mime-type', () => {
    expect(isHeic(file('a.jpg', 'image/heic'))).toBe(true);
    expect(isHeic(file('a.jpg', 'image/heif'))).toBe(true);
    expect(isHeic(file('a.jpg', 'image/jpeg'))).toBe(false);
  });

  it('isHeic detecta por extensão (type vazio no iOS)', () => {
    expect(isHeic(file('foto.HEIC', ''))).toBe(true);
    expect(isHeic(file('foto.heif', ''))).toBe(true);
    expect(isHeic(file('foto.png', ''))).toBe(false);
  });

  it('prepareImageUpload passa arquivo não-HEIC direto (mesma referência)', async () => {
    const f = file('foto.jpg', 'image/jpeg');
    await expect(prepareImageUpload(f)).resolves.toBe(f);
  });
});
