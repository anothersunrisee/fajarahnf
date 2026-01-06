
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Project } from '../types';
import { ALL_TAGS } from '../data/projects';
import { Plus, Trash2, Save, X, Edit2, Loader2, Image as ImageIcon, Check } from 'lucide-react';


export default function AdminPanel() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

    // Simple hardcoded password for "hidden" access
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'fajarahnf77677') { // Simple secret
            setIsAuthenticated(true);
            fetchProjects();
        } else {
            alert('Invalid Access Key');
        }
    };

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
            if (error) throw error;
            if (data) {
                // Map snake_case DB columns to camelCase type
                const mappedData = data.map((p: any) => ({
                    ...p,
                    contentImages: p.content_images || (p.contentimage ? [p.contentimage] : [])
                }));
                setProjects(mappedData);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingProject) return;

        try {
            const projectToSave = { ...editingProject };

            // Need to stringify complex objects if Supabase expects JSON but we are sending as object, 
            // or if column type is JSONB, Supabase handles it. Assuming JSONB columns for arrays.

            const payload = {
                ...projectToSave,
                content_images: projectToSave.contentImages
            };
            // Remove the application-side key to avoid DB 'column not found' error if it doesn't match
            delete (payload as any).contentImages;

            if (projectToSave.id) {
                // Update
                const { error } = await supabase.from('projects').update(payload).eq('id', projectToSave.id);
                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase.from('projects').insert([payload]);
                if (error) throw error;
            }

            setEditingProject(null);
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Failed to save project. Check console for details.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Failed to delete project');
        }
    };

    const compressImage = async (file: File): Promise<Blob | File> => {
        // Only compress if it's an image and not a gif
        if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;

        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1920; // 1080p width approx
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: 'image/jpeg' }));
                            } else {
                                resolve(file);
                            }
                        },
                        'image/jpeg',
                        0.75 // 75% quality is roughly 150ppi perceived quality for web
                    );
                };
            };
        });
    };

    const handleImageUpload = (field: 'image' | 'contentImages') => async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/heic'];
        const uploadedUrls: string[] = [];

        setIsUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type && !allowedTypes.includes(file.type) && !file.name.match(/\.(heic|gif|jpg|jpeg|png)$/i)) {
                    alert(`Skipping ${file.name}: Only .png, .jpg, .jpeg, .gif, .heic formats are allowed`);
                    continue;
                }

                const fileId = `${Date.now()}-${i}`;
                setUploadingFiles(prev => [...prev, fileId]);
                setUploadProgress(prev => ({ ...prev, [fileId]: 10 }));

                // Compression
                let fileToUpload: File | Blob = file;
                if (file.type !== 'image/gif') {
                    setUploadProgress(prev => ({ ...prev, [fileId]: 30 }));
                    fileToUpload = await compressImage(file);
                }

                setUploadProgress(prev => ({ ...prev, [fileId]: 50 }));

                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('portfolio-images')
                    .upload(filePath, fileToUpload);

                if (uploadError) throw uploadError;

                setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

                const { data } = supabase.storage.from('portfolio-images').getPublicUrl(filePath);
                uploadedUrls.push(data.publicUrl);

                // Short delay to show 100% completion
                await new Promise(r => setTimeout(r, 500));
                setUploadingFiles(prev => prev.filter(id => id !== fileId));
            }

            if (uploadedUrls.length > 0) {
                if (field === 'contentImages') {
                    const currentImages = editingProject?.contentImages || [];
                    const combinedImages = [...currentImages, ...uploadedUrls].slice(0, 10);
                    if ([...currentImages, ...uploadedUrls].length > 10) {
                        alert('Maximum 10 images allowed. Some images were truncated.');
                    }
                    setEditingProject(prev => prev ? ({ ...prev, contentImages: combinedImages }) : null);
                } else {
                    setEditingProject(prev => prev ? ({ ...prev, [field]: uploadedUrls[0] }) : null);
                }
            }
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Error upload: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
        }
    };

    // Render Login
    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-900 dark:text-white">
                <h2 className="text-2xl font-bold mb-6">Restricted Access</h2>
                <form onSubmit={handleLogin} className="flex gap-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Admin Key"
                        className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 outline-none"
                    />
                    <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold">Unlock</button>
                </form>
            </div>
        );
    }

    // Render Editor
    return (
        <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl mt-10 text-zinc-900 dark:text-white">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black">Portfolio Manager</h2>
                <button
                    onClick={() => setEditingProject({ tags: [], stats: [], gallery: [] })}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:scale-105 transition-transform"
                >
                    <Plus className="w-5 h-5" /> New Project
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {projects.map(p => (
                        <div key={p.id} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex justify-between items-center group">
                            <div className="flex items-center gap-4">
                                <img src={p.image} alt={p.title} className="w-16 h-16 rounded-lg object-cover bg-zinc-200" />
                                <div>
                                    <h3 className="font-bold text-lg">{p.title}</h3>
                                    <div className="flex gap-2 text-xs text-zinc-500 mt-1">
                                        {p.tags.map(t => <span key={t} className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 rounded">{t}</span>)}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setEditingProject(p)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-blue-500"><Edit2 className="w-5 h-5" /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors text-red-500"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && <div className="text-center py-10 text-zinc-500">No projects found in database.</div>}
                </div>
            )}

            {/* Editor Modal Overlay */}
            {editingProject && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black">{editingProject.id ? 'Edit Project' : 'New Project'}</h3>
                            <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"><X className="w-6 h-6" /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">Title</label>
                                    <input
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 font-bold"
                                        value={editingProject.title || ''}
                                        onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">Size (Layout)</label>
                                    <select
                                        className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 font-bold"
                                        value={editingProject.size || 'square'}
                                        onChange={e => setEditingProject({ ...editingProject, size: e.target.value as any })}
                                    >
                                        <option value="square">Square (1:1)</option>
                                        <option value="tall">Tall (9:16)</option>
                                        <option value="wide">Wide (16:9)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Tools (Comma separated)</label>
                                <input
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 font-bold"
                                    value={editingProject.tools?.join(', ') || ''}
                                    onChange={e => setEditingProject({
                                        ...editingProject,
                                        tools: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                                    })}
                                    placeholder="e.g. Photoshop, Figma, React"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 font-bold resize-none"
                                    value={editingProject.description || ''}
                                    onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">Main Image (Header & Card)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <input
                                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 font-bold text-sm font-mono overflow-hidden"
                                                value={editingProject.image || ''}
                                                readOnly={true}
                                                placeholder="Upload image..."
                                            />
                                            {isUploading && uploadingFiles.length > 0 && (
                                                <div className="absolute inset-0 bg-blue-500/10 rounded-xl overflow-hidden pointer-events-none">
                                                    <div
                                                        className="h-full bg-blue-500/20 transition-all duration-300"
                                                        style={{ width: `${Object.values(uploadProgress)[0] || 0}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <label className={`p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition flex items-center justify-center ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <ImageIcon className="w-5 h-5" />
                                            <input
                                                type="file"
                                                accept=".png,.jpg,.jpeg,.gif,.heic"
                                                className="hidden"
                                                disabled={isUploading}
                                                onChange={handleImageUpload('image')}
                                            />
                                        </label>
                                    </div>
                                    {editingProject.image && (
                                        <div className="relative h-20 w-fit mt-2">
                                            <img src={editingProject.image} alt="Preview" className="h-full w-auto rounded-lg border border-zinc-200 dark:border-zinc-800" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">Article Images (Max 10)</label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 font-bold text-sm overflow-hidden flex flex-wrap gap-2 min-h-[66px]">
                                            {editingProject.contentImages?.map((img, idx) => (
                                                <div key={idx} className="relative group w-16 h-16">
                                                    <img src={img} alt={`Content ${idx}`} className="w-full h-full object-cover rounded-lg" />
                                                    <button
                                                        onClick={() => {
                                                            const newImages = editingProject.contentImages!.filter((_, i) => i !== idx);
                                                            setEditingProject({ ...editingProject, contentImages: newImages });
                                                        }}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}

                                            {/* Uploading Placeholders */}
                                            {uploadingFiles.map((fileId) => (
                                                <div key={fileId} className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center relative overflow-hidden">
                                                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 z-10" />
                                                    <div
                                                        className="absolute bottom-0 left-0 right-0 bg-blue-500/20 transition-all duration-300"
                                                        style={{ height: `${uploadProgress[fileId] || 0}%` }}
                                                    />
                                                </div>
                                            ))}

                                            {!editingProject.contentImages?.length && !uploadingFiles.length && (
                                                <span className="text-zinc-400 font-normal">No images uploaded</span>
                                            )}
                                        </div>
                                        <label className={`p-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition flex items-center justify-center h-fit ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            <ImageIcon className="w-5 h-5" />
                                            <input
                                                type="file"
                                                accept=".png,.jpg,.jpeg,.gif,.heic"
                                                multiple
                                                className="hidden"
                                                disabled={isUploading}
                                                onChange={handleImageUpload('contentImages')}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-zinc-400">Selected: {editingProject.contentImages?.length || 0}/10</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Tags</label>
                                <div className="flex flex-wrap gap-2">
                                    {ALL_TAGS.map(tag => {
                                        const isSelected = editingProject.tags?.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    const currentTags = editingProject.tags || [];
                                                    const newTags = isSelected
                                                        ? currentTags.filter(t => t !== tag)
                                                        : [...currentTags, tag];
                                                    setEditingProject({ ...editingProject, tags: newTags });
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition-colors flex items-center gap-2 ${isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-blue-500'
                                                    }`}
                                            >
                                                {tag} {isSelected && <Check className="w-3 h-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-zinc-500">Full Content (Markdown)</label>
                                <textarea
                                    rows={6}
                                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 outline-none focus:border-blue-500 font-mono text-sm resize-y"
                                    value={editingProject.fullContent || ''}
                                    onChange={e => setEditingProject({ ...editingProject, fullContent: e.target.value })}
                                    placeholder="## Description..."
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                <button
                                    onClick={() => setEditingProject(null)}
                                    className="px-6 py-3 text-zinc-500 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                                >
                                    <Save className="w-5 h-5" /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
