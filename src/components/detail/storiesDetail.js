// Importa React, el hook useState y el icono FaTimes.
import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

// Importa el componente ImageDetail para mostrar detalles de imágenes.
import ImageDetail from './imageDetail';

// Importa los estilos específicos del componente StoriesDetail.
import '../../styles/detail/storiesDetail.scss';

const StoriesDetail = ({ stories }) => {
  // Estado para almacenar la historia seleccionada.
  const [selectedStory, setSelectedStory] = useState(null);

  // Estado para manejar el índice de la foto actual en el modal de imágenes.
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Estado para manejar si el modal de imágenes está abierto o cerrado.
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para manejar la página actual en la paginación de historias.
  const [currentPage, setCurrentPage] = useState(0);

  // Número de elementos por página en la paginación.
  const ITEMS_PER_PAGE = 6;

  // Crea un subconjunto de historias basado en la página actual.
  const currentStories = stories.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Maneja el clic en una historia y actualiza el estado con la historia seleccionada.
  const handleStoryClick = story => {
    setSelectedStory(story);
  };

  // Cierra los detalles de la historia seleccionada.
  const closeStoryDetails = () => {
    setSelectedStory(null);
  };

  // Abre el modal de imágenes y establece el índice de la foto seleccionada.
  const openImageModal = index => {
    setCurrentPhotoIndex(index);
    setIsModalOpen(true);
  };

  // Cierra el modal de imágenes.
  const closeImageModal = () => {
    setIsModalOpen(false);
  };

  // Mueve al usuario a la siguiente foto en el modal.
  const handleNextPhoto = () => {
    setCurrentPhotoIndex(
      prevIndex => (prevIndex + 1) % selectedStory.photos.length
    );
  };

  // Mueve al usuario a la foto anterior en el modal.
  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(
      prevIndex =>
        (prevIndex - 1 + selectedStory.photos.length) %
        selectedStory.photos.length
    );
  };

  // Trunca un texto si excede una longitud específica.
  const truncateText = (text, length) => {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  return (
    <div className="hs-newStories">
      {/* Dots para la paginación de historias */}
      <div className="pagination-dots">
        {Array.from({ length: Math.ceil(stories.length / ITEMS_PER_PAGE) }).map(
          (_, index) => (
            <div
              key={index}
              className={`dot ${currentPage === index ? 'active' : ''}`}
              onClick={() => setCurrentPage(index)}
            ></div>
          )
        )}
      </div>

      {/* Contenedor de las historias */}
      <div className="hs-stories-container">
        <div className="hs-stories">
          {/* Muestra las historias de la página actual */}
          {currentStories.length > 0 ? (
            currentStories.map((story, index) => (
              <div
                key={index}
                className="hs-story"
                onClick={() => handleStoryClick(story)}
              >
                {/* Muestra la portada de la historia si existe */}
                {story.cover && (
                  <div className="hs-story-image-container">
                    <img
                      src={story.cover}
                      alt={`Portada de la historia ${
                        story.name || 'sin nombre'
                      }`}
                    />
                  </div>
                )}
                {/* Nombre de la historia truncado */}
                <div className="hs-story-name">
                  {truncateText(story.name, 7)}
                </div>
              </div>
            ))
          ) : (
            <p>No hay historias destacadas.</p>
          )}
        </div>
      </div>

      {/* Detalles de la historia seleccionada */}
      {selectedStory && (
        <div className="hs-story-details">
          {/* Botón para cerrar los detalles */}
          <button className="hs-close-button" onClick={closeStoryDetails}>
            <FaTimes />
          </button>
          {/* Nombre de la historia */}
          <h4>{selectedStory.name}</h4>
          {/* Galería de fotos asociadas a la historia */}
          <div className="hs-photos">
            {selectedStory.photos.map((photo, index) => (
              <div key={index} className="hs-photo-container">
                <img
                  src={photo.url}
                  alt={`story-photo-${index}`}
                  onClick={() => openImageModal(index)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de detalles de imagen */}
      {isModalOpen && selectedStory && (
        <ImageDetail
          isOpen={isModalOpen}
          photos={selectedStory.photos}
          currentPhotoIndex={currentPhotoIndex}
          onClose={closeImageModal}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
        />
      )}
    </div>
  );
};

// Exporta el componente como predeterminado.
export default StoriesDetail;
