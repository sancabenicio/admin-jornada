'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Calendar, Eye, Clock, User, Tag, FolderOpen } from 'lucide-react';
import { useAdmin } from '@/contexts/AdminContext';
import BlogForm from '@/components/blog/BlogForm';
import { BlogPost, BlogStatus } from '@/types';
import { translateBlogStatus } from '@/lib/utils';

export default function BlogPage() {
  const { blogPosts, deleteBlogPost } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const [selectedPost, setSelectedPost] = useState<BlogPost | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = Array.from(new Set(blogPosts.map(post => post.category)));

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddPost = () => {
    setEditingPost(undefined);
    setShowForm(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setShowForm(true);
  };

  const handleDeletePost = (id: string) => {
    deleteBlogPost(id);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingPost(undefined);
  };

  const getStatusColor = (status: BlogStatus) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'ARCHIVED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <BlogForm
          post={editingPost}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Blog</h1>
          <p className="text-gray-600 mt-2">Gerir artigos e conteúdos do blog</p>
        </div>
        <Button onClick={handleAddPost}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Artigo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Pesquisar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os estados</SelectItem>
              <SelectItem value="PUBLISHED">Publicado</SelectItem>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="ARCHIVED">Arquivado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-48">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                <Badge className={getStatusColor(post.status)}>
                  {translateBlogStatus(post.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {post.coverImage && (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
              )}
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {post.status === 'PUBLISHED' && post.publishedAt 
                      ? new Date(post.publishedAt).toLocaleDateString('pt-PT')
                      : new Date(post.createdAt).toLocaleDateString('pt-PT')
                    }
                  </span>
                </div>
                <div className="text-gray-500">
                  <span className="font-medium">Categoria:</span> {post.category}
                </div>
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPost(post)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-gray-900">
                        {post.title}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                      {/* Imagem de capa */}
                      {post.coverImage && (
                        <div className="w-full h-64 overflow-hidden rounded-lg">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Metadados */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>
                            {post.status === 'PUBLISHED' && post.publishedAt 
                              ? new Date(post.publishedAt).toLocaleDateString('pt-PT')
                              : new Date(post.createdAt).toLocaleDateString('pt-PT')
                            }
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{post.readTime} min de leitura</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <FolderOpen className="h-4 w-4 mr-2" />
                          <span>{post.category}</span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(post.status)}>
                          {translateBlogStatus(post.status)}
                        </Badge>
                        {post.status === 'PUBLISHED' && (
                          <span className="text-sm text-green-600">
                            • Publicado em {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('pt-PT') : 'Data não disponível'}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-500" />
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-sm">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resumo */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Resumo</h3>
                        <p className="text-blue-800">{post.excerpt}</p>
                      </div>

                      {/* Conteúdo */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Conteúdo</h3>
                        <div className="blog-content">
                          <div 
                            dangerouslySetInnerHTML={{ __html: post.content }}
                          />
                        </div>
                      </div>

                      {/* Informações adicionais */}
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Criado em:</span> {new Date(post.createdAt).toLocaleDateString('pt-PT')}
                          </div>
                          <div>
                            <span className="font-medium">Última atualização:</span> {new Date(post.updatedAt).toLocaleDateString('pt-PT')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPost(post)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem a certeza que deseja eliminar o artigo &quot;{post.title}&quot;? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeletePost(post.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhum artigo encontrado</div>
          <p className="text-gray-500">Tente ajustar os filtros ou adicione um novo artigo</p>
        </div>
      )}
    </div>
  );
}