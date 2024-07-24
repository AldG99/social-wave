import React, { useState } from "react";
import { FaTimes } from 'react-icons/fa';
import ImageModalDetail from './imageModalDetail';
import "../../styles/detail/storiesUserDetail.scss"

const HighlightedStoriesUserDetail = ({ stories }) => {
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="hs-highlightedStories">
      <div className="hs-stories">
        {stories.length > 0 ? (
          stories.map((story, index) => (
            <div key={index} className="hs-story" onClick={() => handleStoryClick(story)}>
              {story.cover && (
                <div className="hs-story-image-container">
                  <img 
                    src={story.cover} 
                    alt={`Portada de la historia ${story.name || 'sin nombre'}`} 
                  />
                </div>
              )}
              <div className="hs-story-name">{story.name}</div>
            </div>
          ))
        ) : (
          <p>No hay historias destacadas.</p>
        )}
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
        <ImageModalDetail
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

export default HighlightedStoriesUserDetail;
