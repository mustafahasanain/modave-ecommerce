"use client";

import { useRef, useState } from "react";
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
};

export function ImageUpload({ value, onChange, label = "Image", required = false }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: data });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed.");
      onChange(result.url);
      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-widest">{label}{required ? " *" : ""}</Label>
      <div className="flex items-center gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-secondary">
          {value ? <img src={value} alt="Selected" className="size-full object-cover" /> : <ImageIcon className="size-5 text-muted-foreground" />}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Paste an image URL or upload a file"
            className="min-w-0"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading} className="shrink-0 gap-1.5">
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
            {uploading ? "Uploading" : "Upload"}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG, WebP, or GIF up to 5 MB.</p>
    </div>
  );
}
