"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { createCheck } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Uploading..." : "Upload"}
    </Button>
  );
}

export function UploadCheckDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { toast } = useToast();

  const [state, formAction] = useActionState(createCheck, {
    message: "",
    errors: {},
  });

  useEffect(() => {
    if (state.message) {
      toast({ title: "Success", description: state.message });
      resetAndClose();
    }
    if (state.errors?._server) {
      toast({
        variant: "destructive",
        title: "Error",
        description: state.errors._server[0],
      });
    }
  }, [state, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const resetAndClose = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    formRef.current?.reset();
    setIsOpen(false);
  };
  
  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
    }
  }, [previewUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          resetAndClose();
        } else {
          setIsOpen(true);
        }
      }}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Upload Check</Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload a New Check</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          <div className="grid gap-4 py-4">
            {previewUrl ? (
              <div className="relative group">
                <Image
                  src={previewUrl}
                  alt="Check preview"
                  width={400}
                  height={200}
                  className="w-full h-auto rounded-md"
                />
                 <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={() => {
                        if (previewUrl) URL.revokeObjectURL(previewUrl);
                        setPreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                 >
                    <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
                <div className="flex items-center justify-center w-full">
                    <Label
                    htmlFor="checkImage"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                    >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                    </div>
                    </Label>
              </div>
            )}
            <Input
                id="checkImage"
                name="checkImage"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                ref={fileInputRef}
            />
             {state.errors?.checkImage && (
                <p className="text-sm text-destructive mt-1">{state.errors.checkImage[0]}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetAndClose} type="button">Cancel</Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
