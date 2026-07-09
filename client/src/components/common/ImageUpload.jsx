import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ImageUpload = ({ images, onChange, maxFiles = 5, maxSize = 5242880 }) => {
  const [previews, setPreviews] = useState([]);

  // Generate previews when images change
  React.useEffect(() => {
    // Cleanup old object URLs to avoid memory leaks
    previews.forEach(p => {
      if (p.url && p.url.startsWith('blob:')) {
        URL.revokeObjectURL(p.url);
      }
    });

    const newPreviews = images.map(file => {
      if (typeof file === 'string') return { url: file, isNew: false };
      return { url: URL.createObjectURL(file), isNew: true, file };
    });

    setPreviews(newPreviews);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const onDrop = useCallback(acceptedFiles => {
    if (images.length + acceptedFiles.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} images`);
      return;
    }

    const newFiles = [...images, ...acceptedFiles];
    onChange(newFiles);
  }, [images, maxFiles, onChange]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize,
    maxFiles: maxFiles - images.length
  });

  const removeImage = (indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onChange(newImages);
  };

  return (
    <div className="w-full">
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition duration-200 ease-out
            ${isDragActive ? 'border-primary-500 bg-primary-50/90 shadow-[0_0_0_1px_rgba(59,130,246,0.35)]' : 'border-slate-300 hover:border-slate-400 bg-slate-50'}
            ${isDragReject ? 'border-danger-500 bg-danger-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <FaCloudUploadAlt className={`mx-auto text-5xl mb-3 ${isDragActive ? 'text-primary-500' : 'text-slate-400'}`} />
          <p className="text-slate-800 font-semibold">
            {isDragActive ? 'Drop the images here...' : 'Drag & drop images here, or click to select'}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            JPEG, PNG, WEBP up to {Math.round(maxSize / 1024 / 1024)}MB • Max {maxFiles} files
          </p>
        </div>
      )}

      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 aspect-video shadow-sm transition hover:shadow-md">
              <img
                src={preview.url}
                alt={`Preview ${index}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/0 transition duration-200 hover:bg-slate-950/30">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="rounded-full bg-danger-600 p-3 text-white shadow-lg shadow-danger-500/20 transition hover:bg-danger-700"
                  title="Remove image"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
