import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export interface Picked {
  base64: string; // for AI, ~768px
  thumb: string; // small data URI for storage
}

async function shrink(uri: string, width: number, compress: number): Promise<string> {
  const r = await manipulateAsync(uri, [{ resize: { width } }], {
    compress,
    format: SaveFormat.JPEG,
    base64: true,
  });
  return r.base64 ?? '';
}

export async function pickImage(source: 'camera' | 'library'): Promise<Picked | null> {
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.8 };
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
  }
  const res =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets?.[0]) return null;
  const uri = res.assets[0].uri;
  const [base64, thumb] = await Promise.all([shrink(uri, 768, 0.7), shrink(uri, 160, 0.6)]);
  return { base64, thumb: `data:image/jpeg;base64,${thumb}` };
}
