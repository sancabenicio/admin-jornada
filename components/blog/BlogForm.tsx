'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BlogPost, BlogStatus } from '@/types';
import { useAdmin } from '@/contexts/AdminContext';
import { translateBlogStatus } from '@/lib/utils';
import { uploadImageToCloudinary } from '@/lib/services/cloudinary.service';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface BlogFormProps {
  post?: BlogPost;
  onSubmit: () => void;
  onCancel: () => void;
}

export default function BlogForm({ post, onSubmit, onCancel }: BlogFormProps) {
  const { addBlogPost, updateBlogPost } = useAdmin();
  const [formData, setFormData] = useState({
    title: post?.title || '',
    content: post?.content || '',
    excerpt: post?.excerpt || '',
    coverImage: post?.coverImage || '',
    tags: post?.tags?.join(', ') || '',
    category: post?.category || '',
    status: post?.status || 'DRAFT' as BlogStatus,
    publishedAt: post?.publishedAt || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const postData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      publishedAt: formData.status === 'PUBLISHED' ? new Date().toISOString() : formData.publishedAt,
      author: 'Admin', // Valor padrão para o autor
      readTime: Math.ceil(formData.content.split(' ').length / 200) // Estimativa baseada em 200 palavras por minuto
    };

    if (post) {
      updateBlogPost(post.id, postData);
    } else {
      addBlogPost(postData);
    }
    onSubmit();
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Mostrar loading ou preview temporário
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          handleChange('coverImage', imageUrl);
        };
        reader.readAsDataURL(file);
        
        // Upload para Cloudinary
        const cloudinaryUrl = await uploadImageToCloudinary(file);
        handleChange('coverImage', cloudinaryUrl);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        alert('Erro ao fazer upload da imagem. Tente novamente.');
      }
    }
  };

  const removeImage = () => {
    handleChange('coverImage', '');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{post ? 'Editar Artigo' : 'Novo Artigo'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Resumo</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={2}
              placeholder="Breve descrição do artigo..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Imagem de Capa</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
              {formData.coverImage ? (
                <div className="relative">
                  <img
                    src={formData.coverImage}
                    alt="Cover preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={removeImage}
                    className="absolute top-2 right-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="space-y-2">
                    <label className="cursor-pointer">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                        <Upload className="h-3 w-3 mr-1" />
                        Carregar Imagem
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF até 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={12}
              placeholder="Escreva o conteúdo do artigo..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="ex: Carreira, Tecnologia..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => handleChange('tags', e.target.value)}
                placeholder="ex: formação, desenvolvimento, carreira"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={formData.status} onValueChange={(value: BlogStatus) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Rascunho</SelectItem>
                  <SelectItem value="PUBLISHED">Publicado</SelectItem>
                  <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              {post ? 'Atualizar' : 'Criar'} Artigo
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}