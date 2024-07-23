import React from 'react';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import '../../styles/detail/imageModalDetail.scss';

const ImageModalDetail = ({ isOpen, photos, currentPhotoIndex, onClose, onNext, onPrev }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <button className="prev-button" onClick={onPrev}>
          <FaArrowLeft />
        </button>
        <img src={photos[currentPhotoIndex].url} alt={`photo-${currentPhotoIndex}`} className="modal-image" />
        <button className="next-button" onClick={onNext}>
          <FaArrowRight />
        </button>
        <div className="photo-counter">
          {currentPhotoIndex + 1} de {photos.length}
        </div>
      </div>
    </div>
  );
};

export default ImageModalDetail;
