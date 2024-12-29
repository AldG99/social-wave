// Importa React y los iconos necesarios desde react-icons.
import React from 'react';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';

// Importa los estilos específicos para el componente ImageDetail.
import '../../styles/detail/imageDetail.scss';

// Define el componente funcional ImageDetail.
const ImageDetail = ({
  isOpen,
  photos,
  currentPhotoIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  // Si el modal no está abierto, no renderiza nada.
  if (!isOpen) return null;

  // Función para formatear la fecha en un formato legible.
  const formatDate = dateString => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Obtiene la foto actual basada en el índice proporcionado.
  const currentPhoto = photos[currentPhotoIndex];

  // Si no hay una foto válida en el índice actual, no renderiza nada.
  if (!currentPhoto) return null;

  return (
    <div className="image-modal-overlay">
      {/* Contenedor principal del modal */}
      <div className="image-modal-content">
        {/* Botón para cerrar el modal */}
        <button className="image-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Botón para ir a la imagen anterior */}
        <button className="image-modal-prev" onClick={onPrev}>
          <FaArrowLeft />
        </button>

        {/* Contenedor de la imagen principal */}
        <div className="image-modal-image-container">
          <img
            src={currentPhoto.url}
            alt={`photo-${currentPhotoIndex}`}
            className="image-modal-image"
          />
        </div>

        {/* Botón para ir a la siguiente imagen */}
        <button className="image-modal-next" onClick={onNext}>
          <FaArrowRight />
        </button>

        {/* Información adicional de la imagen */}
        <div className="image-modal-info">
          {/* Contador de imágenes actuales */}
          <div className="image-modal-counter-wrapper">
            <div className="image-modal-counter">
              {currentPhotoIndex + 1} de {photos.length}
            </div>
          </div>

          {/* Fecha de subida de la imagen */}
          <div className="image-modal-date-wrapper">
            <div className="image-modal-date">
              {formatDate(currentPhoto.uploadedAt)}
            </div>
          </div>

          {/* Título de la imagen */}
          <div className="image-modal-title-wrapper">
            <div className="image-modal-title">{currentPhoto.title}</div>
          </div>

          {/* Comentario asociado a la imagen */}
          <div className="image-modal-comment-wrapper">
            <div className="image-modal-comment">{currentPhoto.comment}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exporta el componente como predeterminado para su uso en otros módulos.
export default ImageDetail;
