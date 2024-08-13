import React, { useState } from "react";
import { FaTimes } from 'react-icons/fa';
import ImageDetail from './imageDetail';
import "../../styles/detail/storiesDetail.scss";

const StoriesDetail = ({ stories }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

  const currentStories = stories.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleStoryClick = (story) => {
    setSelectedStory(story);
  };

  const closeStoryDetails = () => {
    setSelectedStory(null);
  };

  const openImageModal = (index) => {
    setCurrentPhotoIndex(index);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % selectedStory.photos.length);
  };

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + selectedStory.photos.length) % selectedStory.photos.length);
  };

  const truncateText = (text, length) => {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  };

  return (
    <div className="hs-newStories">
      <div className="pagination-dots">
        {Array.from({ length: Math.ceil(stories.length / ITEMS_PER_PAGE) }).map((_, index) => (
          <div
            key={index}
            className={`dot ${currentPage === index ? 'active' : ''}`}
            onClick={() => setCurrentPage(index)}
          ></div>
        ))}
      </div>
      <div className="hs-stories-container">
        <div className="hs-stories">
          {currentStories.length > 0 ? (
            currentStories.map((story, index) => (
              <div key={index} className="hs-story" onClick={() => handleStoryClick(story)}>
                {story.cover && (
                  <div className="hs-story-image-container">
                    <img 
                      src={story.cover} 
                      alt={`Portada de la historia ${story.name || 'sin nombre'}`} 
                    />
                  </div>
                )}
                <div className="hs-story-name">{truncateText(story.name, 7)}</div>
              </div>
            ))
          ) : (
            <p>No hay historias destacadas.</p>
          )}
        </div>
      </div>
      {selectedStory && (
        <div className="hs-story-details">
          <button className="hs-close-button" onClick={closeStoryDetails}>
            <FaTimes />
          </button>
          <h4>{selectedStory.name}</h4>
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

export default StoriesDetail;
