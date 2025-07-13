export async function uploadToCloudinary(file: File, resourceType: 'image' | 'raw' = 'image'): Promise<string> {
  const url = '/api/cloudinary/upload';
  const formData = new FormData();
  formData.append('file', file);
  formData.append('resourceType', resourceType);

  const response = await fetch(url, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    console.error('Erro no upload Cloudinary:', errorData);
    throw new Error(errorData.error || 'Erro ao fazer upload para o Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}

// Função específica para upload de documentos
export async function uploadDocumentToCloudinary(file: File): Promise<string> {
  return uploadToCloudinary(file, 'raw');
}

// Função específica para upload de imagens
export async function uploadImageToCloudinary(file: File): Promise<string> {
  return uploadToCloudinary(file, 'image');
} 