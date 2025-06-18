'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import { createLowlight, common } from 'lowlight';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className,
  editable = true,
}: TiptapEditorProps) {
  const lowlight = createLowlight(common);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use the lowlight version
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      Placeholder.configure({
        placeholder,
      }),
      Typography,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown?.getMarkdown() || editor.getHTML();
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none',
          'prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground',
          'prose-em:text-foreground prose-code:text-foreground prose-pre:text-foreground',
          'prose-blockquote:text-foreground prose-li:text-foreground prose-a:text-foreground',
          'prose-th:text-foreground prose-td:text-foreground',
          'dark:prose-invert',
          'min-h-[200px] p-6',
          className
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border-0 rounded-none overflow-hidden bg-transparent">
      {editable && (
        <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm px-6 py-4 sticky top-0 z-10">
          <div className="flex flex-wrap items-center gap-2 max-w-4xl mx-auto">
            {/* Text Formatting Group */}
            <div className="flex items-center gap-1 mr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200",
                  editor.isActive('bold') 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Bold (Ctrl+B)"
              >
                <strong className="text-sm">B</strong>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200",
                  editor.isActive('italic') 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Italic (Ctrl+I)"
              >
                <em className="text-sm not-italic font-medium">I</em>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200 text-xs",
                  editor.isActive('code') 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Inline Code"
              >
                Code
              </Button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-border mr-3" />

            {/* Headings Group */}
            <div className="flex items-center gap-1 mr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200 text-xs font-semibold",
                  editor.isActive('heading', { level: 1 }) 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Heading 1"
              >
                H1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200 text-xs font-semibold",
                  editor.isActive('heading', { level: 2 }) 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Heading 2"
              >
                H2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200 text-xs font-semibold",
                  editor.isActive('heading', { level: 3 }) 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Heading 3"
              >
                H3
              </Button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-border mr-3" />

            {/* Lists Group */}
            <div className="flex items-center gap-1 mr-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200 text-xs",
                  editor.isActive('bulletList') 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Bullet List"
              >
                • List
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200 text-xs",
                  editor.isActive('orderedList') 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Numbered List"
              >
                1. List
              </Button>
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-border mr-3" />

            {/* Blocks Group */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200 text-xs",
                  editor.isActive('codeBlock') 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Code Block"
              >
                Code Block
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                  "h-8 px-2 transition-all duration-200 text-xs",
                  editor.isActive('blockquote') 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'hover:bg-muted/70'
                )}
                title="Quote"
              >
                Quote
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="relative bg-transparent">
        <div className="max-w-4xl mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}