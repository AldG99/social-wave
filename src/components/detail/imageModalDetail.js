import React from 'react';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import '../../styles/detail/imageModalDetail.scss';

const ImageModalDetail = ({ isOpen, photos, currentPhotoIndex, onClose, onNext, onPrev }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Asegúrate de que la foto actual existe
  const currentPhoto = photos[currentPhotoIndex];
  
  if (!currentPhoto) return null;

  return (
    <div className="image-modal-overlay">
      <div className="image-modal-content">
        <button className="image-modal-close" onClick={onClose}>
          <FaTimes />
        </button>
        <button className="image-modal-prev" onClick={onPrev}>
          <FaArrowLeft />
        </button>
        <div className="image-modal-image-container">
          <img 
            src={currentPhoto.url} 
            alt={`photo-${currentPhotoIndex}`} 
            className="image-modal-image" 
          />
        </div>
        <button className="image-modal-next" onClick={onNext}>
          <FaArrowRight />
        </button>
        <div className="image-modal-info">
          <div className="image-modal-counter-wrapper">
            <div className="image-modal-counter">
              {currentPhotoIndex + 1} de {photos.length}
            </div>
          </div>
          <div className="image-modal-date-wrapper">
            <div className="image-modal-date">{formatDate(currentPhoto.uploadedAt)}</div>
          </div>
          <div className="image-modal-title-wrapper">
            <div className="image-modal-title">
              {currentPhoto.title}
            </div>
          </div>
          <div className="image-modal-comment-wrapper">
            <div className="image-modal-comment">
              {currentPhoto.comment} {/* Mostrar comentario */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModalDetail;
