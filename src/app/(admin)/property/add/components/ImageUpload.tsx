import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { uploadPropertyImage } from '@/lib/supabase';
import Image from 'next/image';

interface ImageUploadProps {
  propertyId: string;
  onUploadComplete?: (image: any) => void;
}

export default function ImageUpload({ propertyId, onUploadComplete }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const isMainInput = form.querySelector('input[type="checkbox"]') as HTMLInputElement;

    if (!fileInput.files?.length) {
      alert('Por favor seleccione una imagen');
      return;
    }

    setIsUploading(true);
    try {
      const image = await uploadPropertyImage(
        propertyId,
        fileInput.files[0],
        isMainInput.checked
      );
      
      if (image && onUploadComplete) {
        onUploadComplete(image);
      }
      
      // Reset form
      form.reset();
      setPreview(null);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      alert('Error al subir la imagen. Por favor intente de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form onSubmit={handleUpload} className="mb-4">
      <Form.Group className="mb-3">
        <Form.Label>Seleccionar Imagen</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </Form.Group>

      {preview && (
        <div className="mb-3">
          <Image
            src={preview}
            alt="Vista previa"
            width={200}
            height={150}
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}

      <Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          label="Establecer como imagen principal"
          disabled={isUploading}
        />
      </Form.Group>

      <Button
        type="submit"
        variant="primary"
        disabled={isUploading}
      >
        {isUploading ? 'Subiendo...' : 'Subir Imagen'}
      </Button>
    </Form>
  );
} 