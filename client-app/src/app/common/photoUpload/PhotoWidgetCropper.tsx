import React, { useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

interface IProps {
  setImage: (file: Blob) => void;
  imagePreview: string;
}

const PhotoWidgetCropper: React.FC<IProps> = ({ setImage, imagePreview }) => {
  const cropperRef = useRef<Cropper>(null);
  const onCrop = () => {
    if (
      cropperRef.current &&
      typeof cropperRef.current.getCroppedCanvas() === "undefined"
    ) {
      return;
    }
    cropperRef &&
      cropperRef.current &&
      cropperRef.current.getCroppedCanvas().toBlob((blob: any) => {
        setImage(blob);
      }, "image/jpeg");
  };

  return (
    <Cropper
      ref={cropperRef}
      src={imagePreview}
      style={{ height: 200, width: "100%" }}
      // Cropper.js options
      aspectRatio={1 / 1}
      preview=".img-preview"
      guides={false}
      crop={onCrop}
      viewMode={1}
      dragMode="move"
      scalable={true}
      cropBoxResizable={true}
      cropBoxMovable={true}
    />
  );
};
export default PhotoWidgetCropper;
