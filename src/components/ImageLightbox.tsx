import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { createPortal } from "react-dom";
import "../styles/ApartmentDetails.css";

type ImageLightboxProps = {
  images: string[];
  activeImageIndex: number;
  title: string;
  open: boolean;
  onClose: () => void;
  onActiveImageChange: (index: number) => void;
  renderInPortal?: boolean;
  labels: {
    previous: string;
    next: string;
    preview: string;
    close: string;
    zoomIn: string;
    zoomOut: string;
  };
};

export default function ImageLightbox({
  images,
  activeImageIndex,
  title,
  open,
  onClose,
  onActiveImageChange,
  renderInPortal = false,
  labels,
}: ImageLightboxProps) {
  const [imageZoom, setImageZoom] = useState(1);

  useEffect(() => {
    if (open) setImageZoom(1);
  }, [open]);

  if (!open) return null;

  const showPreviousImage = () => {
    setImageZoom(1);
    onActiveImageChange((activeImageIndex - 1 + images.length) % images.length);
  };
  const showNextImage = () => {
    setImageZoom(1);
    onActiveImageChange((activeImageIndex + 1) % images.length);
  };

  const lightbox = (
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={labels.preview} onClick={onClose}>
      <div className="image-lightbox-content" onClick={(event) => event.stopPropagation()}>
        <button className="image-lightbox-close" type="button" onClick={onClose} aria-label={labels.close}>
          <X size={20} />
        </button>
        {images.length > 1 && (
          <>
            <button className="round image-lightbox-nav image-lightbox-prev" type="button" aria-label={labels.previous} onClick={showPreviousImage}>
              <ArrowLeft size={18} />
            </button>
            <button className="round image-lightbox-nav image-lightbox-next" type="button" aria-label={labels.next} onClick={showNextImage}>
              <ArrowRight size={18} />
            </button>
          </>
        )}
        <img
          className="image-lightbox-image"
          src={images[activeImageIndex]}
          alt={`${title} ${activeImageIndex + 1}`}
          style={{ transform: `scale(${imageZoom})` }}
          onWheel={(event) => {
            event.preventDefault();
            setImageZoom((current) => Math.min(3, Math.max(1, current + (event.deltaY < 0 ? 0.25 : -0.25))));
          }}
        />
        <div className="image-lightbox-controls">
          <button type="button" onClick={() => setImageZoom((current) => Math.min(3, current + 0.5))} aria-label={labels.zoomIn}>
            <ZoomIn size={18} />
          </button>
          <button type="button" onClick={() => setImageZoom((current) => Math.max(1, current - 0.5))} aria-label={labels.zoomOut}>
            <ZoomOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return renderInPortal ? createPortal(lightbox, document.body) : lightbox;
}