"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PREDEFINED_CATEGORIES = ["business", "technology", "economy", "india", "world", "sports", "entertainment", "startups", "lifestyle"];

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // SEO state
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  // Categories state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);

  // Image Upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Write the news article content here...</p>",
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[300px] p-4 bg-white border border-gray-300 rounded-b-lg text-sm leading-relaxed [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4 [&_p]:mb-3",
      },
    },
  });

  // Handle Category Autocomplete
  useEffect(() => {
    if (categoryInput.trim()) {
      const filtered = PREDEFINED_CATEGORIES.filter(c => 
        c.includes(categoryInput.toLowerCase().trim()) && !selectedCategories.includes(c)
      );
      setCategorySuggestions(filtered);
    } else {
      setCategorySuggestions([]);
    }
  }, [categoryInput, selectedCategories]);

  const handleAddCategory = (cat: string) => {
    const formattedCat = cat.toLowerCase().trim();
    if (formattedCat && !selectedCategories.includes(formattedCat)) {
      setSelectedCategories([...selectedCategories, formattedCat]);
    }
    setCategoryInput("");
    setCategorySuggestions([]);
  };

  const handleCategoryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddCategory(categoryInput);
    }
  };

  const removeCategory = (cat: string) => {
    setSelectedCategories(selectedCategories.filter(c => c !== cat));
  };

  // Client-side image compression
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const newFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(newFile);
              } else {
                reject(new Error("Canvas to Blob failed"));
              }
            },
            "image/jpeg",
            0.8 // Compression quality
          );
        };
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      alert("Please add at least one category.");
      return;
    }
    
    setIsSubmitting(true);

    try {
      let finalImageUrl = null;

      // 1. Upload & Compress Image if selected
      if (imageFile) {
        setIsUploadingImage(true);
        const compressedFile = await compressImage(imageFile);
        const fileExt = compressedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from('article_images')
          .upload(filePath, compressedFile);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('article_images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrlData.publicUrl;
        setIsUploadingImage(false);
      }

      // 2. Save Article
      const primaryCategory = selectedCategories[0]; // For backwards compatibility with older URL logic
      const finalSeoTitle = seoTitle.trim() || title;
      const finalSeoDesc = seoDescription.trim() || subheadline;
      const contentHtml = editor?.getHTML() || "";
      
      const { error } = await supabase
        .from('articles')
        .insert([
          {
            title,
            subheadline,
            category: primaryCategory,
            categories: selectedCategories,
            seo_title: finalSeoTitle,
            seo_description: finalSeoDesc,
            seo_keywords: seoKeywords,
            content: contentHtml,
            cover_image: finalImageUrl
          }
        ]);
        
      if (error) throw error;
      
      alert("Article Published Successfully!");
      router.push("/admin");
    } catch (error: any) {
      console.error("Error publishing article:", error);
      alert("Failed to publish: " + error.message);
    } finally {
      setIsSubmitting(false);
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center space-x-3 mb-6">
        <Link href="/admin" className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition-colors bg-white">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl font-bold">Write New Article</h1>
      </div>

      <form onSubmit={handlePublish} className="space-y-5">
        
        {/* SECTION 1: Core Details */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm space-y-4">
          <h2 className="text-sm font-bold border-b border-gray-100 pb-1.5 text-gray-800">Core Content</h2>
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Headline</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-lg font-bold border border-gray-300 p-2.5 rounded-md focus:outline-none focus:border-blue-500 transition-colors" 
              placeholder="Enter the main headline here"
              required
            />
          </div>

          {/* Subheadline & Categories Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Sub-headline</label>
              <textarea 
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500 transition-colors text-sm resize-none h-24" 
                placeholder="A brief summary of the article"
                required
              />
            </div>
            
            {/* Multiple Categories */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Categories (Type and press Enter)</label>
              <div className="w-full border border-gray-300 rounded-md p-2 bg-white flex flex-wrap gap-2 min-h-[96px] items-start focus-within:border-blue-500 transition-colors relative">
                {selectedCategories.map(cat => (
                  <span key={cat} className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md">
                    {cat}
                    <button type="button" onClick={() => removeCategory(cat)} className="text-blue-600 hover:text-blue-900"><X size={12} /></button>
                  </span>
                ))}
                <div className="flex-1 min-w-[120px] relative">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={handleCategoryKeyDown}
                    className="w-full bg-transparent focus:outline-none text-sm p-1"
                    placeholder={selectedCategories.length === 0 ? "e.g. business, startups..." : ""}
                  />
                  {categorySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-20">
                      {categorySuggestions.map(sugg => (
                        <div 
                          key={sugg} 
                          className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                          onClick={() => handleAddCategory(sugg)}
                        >
                          {sugg}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Image & Content */}
        <div className="space-y-4">
          {/* Real Cover Image Upload */}
          <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
            <label className="block text-xs font-semibold text-gray-600 mb-2">Cover Image (Auto-compresses to Web Friendly Size)</label>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleImageSelect} 
            />
            
            {imagePreview ? (
              <div className="relative w-full max-h-48 rounded-md overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded hover:bg-black"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
              >
                 <ImageIcon size={24} className="mx-auto text-gray-400 mb-2" />
                 <p className="text-gray-600 font-medium text-sm">Click to upload cover image</p>
              </div>
            )}
          </div>

          {/* Rich Text Editor */}
          <div>
            <div className="border border-gray-300 border-b-0 rounded-t-lg bg-gray-50 p-2 flex space-x-1">
              <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className={`px-2 py-1 rounded text-xs font-medium ${editor?.isActive('bold') ? 'bg-gray-200 font-bold' : 'hover:bg-gray-200'}`}>Bold</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className={`px-2 py-1 rounded text-xs font-medium ${editor?.isActive('italic') ? 'bg-gray-200 font-bold' : 'hover:bg-gray-200'}`}>Italic</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-2 py-1 rounded text-xs font-medium ${editor?.isActive('heading', { level: 3 }) ? 'bg-gray-200 font-bold' : 'hover:bg-gray-200'}`}>H3</button>
              <button type="button" onClick={() => editor?.chain().focus().toggleBlockquote().run()} className={`px-2 py-1 rounded text-xs font-medium ${editor?.isActive('blockquote') ? 'bg-gray-200 font-bold' : 'hover:bg-gray-200'}`}>Quote</button>
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* SECTION 3: SEO Details */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm space-y-4">
           <div className="flex justify-between items-end border-b border-gray-100 pb-1.5">
             <h2 className="text-sm font-bold text-gray-800">SEO Tags & Metadata</h2>
             <span className="text-[10px] text-gray-500 flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
               <Sparkles size={10} className="mr-1 text-blue-600" /> Helps with Google Search
             </span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Title</label>
               <input 
                  type="text" 
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "Custom SEO Title (Optional)"}
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500 transition-colors text-sm" 
               />
             </div>
             <div>
               <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Keywords / Tags (Comma separated)</label>
               <input 
                  type="text" 
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="news, business, market crash..."
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500 transition-colors text-sm" 
               />
             </div>
             <div className="md:col-span-2">
               <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Description</label>
               <textarea 
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={subheadline || "Custom SEO Description (Optional)"}
                  className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:border-blue-500 transition-colors text-sm h-16 resize-none" 
               ></textarea>
             </div>
           </div>
        </div>

        {/* Submit Actions */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 flex justify-end space-x-3 p-3 border-t border-gray-200 bg-white z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button type="submit" disabled={isSubmitting || isUploadingImage} className="flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:opacity-50">
            {(isSubmitting || isUploadingImage) ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> {isUploadingImage ? "Uploading Image..." : "Publishing..."}</>
            ) : (
              <><Save size={16} className="mr-2" /> Publish Article</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
