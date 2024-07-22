// src/components/highlightedStoriesUserDetail.jsx
import React from "react";
import "../../styles/detail/highlightedStoriesUserDetail.scss";

const HighlightedStoriesUserDetail = ({ stories }) => {
  return (
    <div className="highlightedStoriesUserDetail">
      {stories.length > 0 ? (
        stories.map((story, index) => (
          <div key={index} className="story">
            {story.photos.map((photo, photoIndex) => (
              <div key={photoIndex} className="photo">
                <img 
                  src={photo.url} 
                  alt={`Foto de la historia ${story.name || 'sin nombre'} cargada el ${new Date(photo.uploadedAt).toLocaleDateString()}`} 
                />
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>No hay historias destacadas.</p>
      )}
    </div>
  );
};

export default HighlightedStoriesUserDetail;
