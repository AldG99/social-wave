import React from 'react';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import '../../styles/user/imageModal.scss';

const ImageModal = ({ isOpen, photos, currentPhotoIndex, onClose, onNext, onPrev }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Asegúrate de que la foto actual existe
  const currentPhoto = photos[currentPhotoIndex];
  
  if (!currentPhoto) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <button className="prev-button" onClick={onPrev}>
          <FaArrowLeft />
        </button>
        <div className="modal-image-container">
          <img src={currentPhoto.url} alt={`photo-${currentPhotoIndex}`} className="modal-image" />
        </div>
        <button className="next-button" onClick={onNext}>
          <FaArrowRight />
        </button>
        <div className="photo-info">
          <div className="photo-counter-container">
            <div className="photo-counter">
              {currentPhotoIndex + 1} de {photos.length}
            </div>
          </div>
          <div className="photo-date-container">
            <div className="photo-date">{formatDate(currentPhoto.uploadedAt)}</div>
          </div>
          <div className="photo-title-container">
            <div className="photo-title">
              {currentPhoto.title}
            </div>
          </div>
          <div className="photo-comment-container">
            <div className="photo-comment">
              {currentPhoto.comment} {/* Mostrar comentario */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
