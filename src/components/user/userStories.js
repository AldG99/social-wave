import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import { FaRegSquarePlus } from "react-icons/fa6";
import '../../styles/user/userStories.scss';
import { db, storage } from '../../lib/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useUserStore } from '../../lib/userStore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import ImageModal from './imageModal';

const UserStories = () => {
  const { currentUser } = useUserStore();
  const [stories, setStories] = useState([]);
  const [newStoryCover, setNewStoryCover] = useState(null);
  const [newStoryName, setNewStoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [editStoryName, setEditStoryName] = useState("");
  const [editStoryCover, setEditStoryCover] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoComment, setPhotoComment] = useState("");
  const [remainingChars, setRemainingChars] = useState(260);
  const [newPhoto, setNewPhoto] = useState(null);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [showAddPhotoOptions, setShowAddPhotoOptions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const fetchStories = async () => {
      if (!currentUser?.id) return;
      const userDoc = await getDoc(doc(db, 'users', currentUser.id));
      if (userDoc.exists()) {
        setStories(userDoc.data().newStories || []);
      }
    };
    fetchStories();
  }, [currentUser]);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewStoryCover(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Por favor, seleccione un archivo de imagen válido');
    }
  };

  const currentStories = stories.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleNameChange = (e) => {
    setNewStoryName(e.target.value);
  };

  const handlePhotoTitleChange = (e) => {
    const title = e.target.value;
    if (title.length <= 40) {
      setPhotoTitle(title);
    } else {
      alert('El título no puede exceder los 40 caracteres.');
    }
  };

  const handlePhotoCommentChange = (e) => {
    const comment = e.target.value;
    if (comment.length <= 260) {
        setPhotoComment(comment);
        setRemainingChars(260 - comment.length);
    } else {
        alert('El comentario no puede exceder los 260 caracteres.');
    }
  };

  const addStory = async () => {
    if (!newStoryCover || !newStoryName.trim()) {
      alert('Por favor, complete todos los campos: portada y nombre de la historia.');
      return;
    }

    setLoading(true);
    const date = new Date().toISOString();
    const coverRef = ref(storage, `stories/${currentUser.id}/${date}-${newStoryCover.name}`);

    const coverUploadTask = uploadBytesResumable(coverRef, newStoryCover);

    coverUploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Upload error: ', error);
        setLoading(false);
      },
      async () => {
        const coverURL = await getDownloadURL(coverUploadTask.snapshot.ref);
        try {
          const newStoryData = {
            id: date,
            name: newStoryName.trim(),
            cover: coverURL,
            photos: [],
          };
          await updateDoc(doc(db, 'users', currentUser.id), {
            newStories: arrayUnion(newStoryData),
          });
          setStories((prev) => [...prev, newStoryData]);
          setNewStoryCover(null);
          setNewStoryName("");
        } catch (error) {
          console.error('Error saving story: ', error);
        }
        setLoading(false);
        setIsAddingStory(false);
      }
    );
  };

  const addPhotoToStory = async (storyId, newPhoto) => {
    setLoading(true);
    const date = new Date().toISOString();
    const storageRef = ref(storage, `stories/${currentUser.id}/${date}-${newPhoto.name}`);

    const uploadTask = uploadBytesResumable(storageRef, newPhoto);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('Upload error: ', error);
        setLoading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          const storyIndex = stories.findIndex((story) => story.id === storyId);
          const updatedStories = [...stories];
          const newPhotoData = {
            url: downloadURL,
            uploadedAt: date,
            title: photoTitle,
            comment: photoComment,
          };
          updatedStories[storyIndex].photos.push(newPhotoData);
          await updateDoc(doc(db, 'users', currentUser.id), {
            newStories: updatedStories,
          });
          setStories(updatedStories);
          setSelectedStory(null);
          setPhotoTitle(""); // Limpiar el título
          setPhotoComment(""); // Limpiar el comentario
        } catch (error) {
          console.error('Error adding photo to story: ', error);
        }
        setLoading(false);
      }
    );
  };

  const deletePhotoFromStory = async (storyId, photoUrl) => {
    setLoading(true);
    try {
      const storyIndex = stories.findIndex((story) => story.id === storyId);
      const updatedStories = [...stories];
      const photoIndex = updatedStories[storyIndex].photos.findIndex((photo) => photo.url === photoUrl);
      const photoToDelete = updatedStories[storyIndex].photos[photoIndex];

      const photoRef = ref(storage, photoToDelete.url);
      await deleteObject(photoRef);

      updatedStories[storyIndex].photos.splice(photoIndex, 1);

      await updateDoc(doc(db, 'users', currentUser.id), {
        newStories: updatedStories,
      });
      setStories(updatedStories);
    } catch (error) {
      console.error('Error deleting photo from story: ', error);
    }
    setLoading(false);
  };

  const handlePhotoChange = (e, storyId) => {
    if (e.target.files[0] && e.target.files[0].type.startsWith('image/')) {
      setNewPhoto(e.target.files[0]);
    } else {
      alert('Por favor, seleccione un archivo de imagen válido');
    }
  };

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setEditStoryName(story.name);
  };

  const handleEditStoryNameChange = (e) => {
    setEditStoryName(e.target.value);
  };

  const handleEditCoverChange = (e) => {
    if (e.target.files[0] && e.target.files[0].type.startsWith('image/')) {
      setEditStoryCover(e.target.files[0]);
    } else {
      alert('Por favor, seleccione un archivo de imagen válido');
    }
  };

  const saveEditedStoryNameAndCover = async () => {
    setLoading(true);
    const updatedStories = [...stories];
    const storyIndex = stories.findIndex((story) => story.id === selectedStory.id);
    if (editStoryName.trim()) {
      updatedStories[storyIndex].name = editStoryName.trim();
    }

    if (editStoryCover) {
      const date = new Date().toISOString();
      const coverRef = ref(storage, `stories/${currentUser.id}/${date}-${editStoryCover.name}`);
      const uploadTask = uploadBytesResumable(coverRef, editStoryCover);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('Upload error: ', error);
          setLoading(false);
        },
        async () => {
          const coverURL = await getDownloadURL(uploadTask.snapshot.ref);
          updatedStories[storyIndex].cover = coverURL;
          try {
            await updateDoc(doc(db, 'users', currentUser.id), {
              newStories: updatedStories,
            });
            setStories(updatedStories);
            setSelectedStory(null);
            setEditStoryCover(null);
            setLoading(false);
          } catch (error) {
            console.error('Error updating story: ', error);
            setLoading(false);
          }
        }
      );
    } else {
      try {
        await updateDoc(doc(db, 'users', currentUser.id), {
          newStories: updatedStories,
        });
        setStories(updatedStories);
        setSelectedStory(null);
        setLoading(false);
      } catch (error) {
        console.error('Error updating story: ', error);
        setLoading(false);
      }
    }
  };

  const deleteStory = async () => {
    setLoading(true);
    try {
      const storyIndex = stories.findIndex((story) => story.id === selectedStory.id);
      const storyToDelete = stories[storyIndex];
      const updatedStories = stories.filter((story) => story.id !== selectedStory.id);

      if (storyToDelete.cover) {
        const coverRef = ref(storage, storyToDelete.cover);
        await deleteObject(coverRef);
      }

      for (const photo of storyToDelete.photos) {
        const photoRef = ref(storage, photo.url);
        await deleteObject(photoRef);
      }

      await updateDoc(doc(db, 'users', currentUser.id), {
        newStories: updatedStories,
      });
      setStories(updatedStories);
      setSelectedStory(null);
    } catch (error) {
      console.error('Error deleting story: ', error);
    }
    setLoading(false);
  };

  const openImageModal = (story, index) => {
    setSelectedStory(story);
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

  const toggleEditing = () => {
    setIsEditing(!isEditing);
    if (showAddPhotoOptions) {
      setShowAddPhotoOptions(false);
    }
  };

  const toggleAddPhotoOptions = () => {
    setShowAddPhotoOptions(!showAddPhotoOptions);
    if (isEditing) {
      setIsEditing(false);
    }
  };

  return (
    <div className="newStories">
      <div
        className="addStoryIcon"
        onClick={() => setIsAddingStory(!isAddingStory)}
      >
        <FaRegSquarePlus />
      </div>
      <div className={`addStory ${isAddingStory ? 'active' : ''}`}>
        <input
          type="file"
          id="story-cover"
          style={{ display: 'none' }}
          onChange={handleCoverChange}
        />
        <label htmlFor="story-cover" className="addStoryLabel">
          <FaPlus /> Portada
        </label>
        {previewImage && (
          <img src={previewImage} alt="Vista previa de la portada" className="previewImage" />
        )}
        <input
          type="text"
          placeholder="Nombre de la historia"
          value={newStoryName}
          onChange={handleNameChange}
        />
        <button
          onClick={addStory}
          disabled={!newStoryCover || !newStoryName.trim() || loading}
        >
          {loading ? 'Guardando...' : 'Guardar Historia'}
        </button>
      </div>
      <div className="pagination-dots">
        {Array.from({ length: Math.ceil(stories.length / ITEMS_PER_PAGE) }).map((_, index) => (
          <div
            key={index}
            className={`dot ${currentPage === index ? 'active' : ''}`}
            onClick={() => setCurrentPage(index)}
          ></div>
        ))}
      </div>
      <div className="stories-container">
        <div className="stories">
          {currentStories.map((story, index) => (
            <div key={index} className="story">
              <div className="story-image-container" onClick={() => handleStoryClick(story)}>
                {story.cover && (
                  <img
                    src={story.cover}
                    alt={`story-cover-${index}`}
                  />
                )}
              </div>
              <div className="story-name">
                {truncateText(story.name, 7)}
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedStory && (
      <div className="story-details">
        <button className="close-button" onClick={() => setSelectedStory(null)}>
          <FaTimes />
        </button>
        <h4>{selectedStory.name}</h4>
        <div className="photos-count">
          <strong>Número de fotos:</strong> {selectedStory.photos.length}
        </div>
        <button onClick={toggleEditing}>
          {isEditing ? 'Cancelar' : <FaEdit />} Editar historias
        </button>
        {isEditing && (
        <>
          <input
            type="text"
            value={editStoryName}
            onChange={handleEditStoryNameChange}
            placeholder="Nombre de la historia"
          />
          <input
            type="file"
            id="edit-cover-file"
            style={{ display: 'none' }}
            onChange={handleEditCoverChange}
          />
          <label htmlFor="edit-cover-file" className="editCoverLabel">
            <FaPlus /> Cambiar portada
          </label>
          <button onClick={saveEditedStoryNameAndCover}>
            <FaSave />
          </button>
          <button
            className="deleteStoryButton"
            onClick={deleteStory}
            disabled={loading}
          >
            {loading ? 'Eliminando...' : <FaTrash />}
          </button>
        </>
      )}
      <div className="photos-container">
        <div className="photos">
          {selectedStory.photos.map((photo, index) => (
            <div key={index} className="photo-container">
              <img
                src={photo.url}
                alt={`story-photo-${index}`}
                onClick={() => openImageModal(selectedStory, index)}
              />
              <div className="photo-comment">{photo.comment}</div>
                {isEditing && (
                  <button
                    className="delete-photo-button"
                    onClick={() => deletePhotoFromStory(selectedStory.id, photo.url)}
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="add-photo">
          <button
            onClick={toggleAddPhotoOptions}
            className="toggle-add-photo-button"
          >
            {showAddPhotoOptions ? 'Cancelar' : 'Agregar Foto'}
          </button>
          {showAddPhotoOptions && (
            <>
              <input
                type="file"
                id="photo-file"
                style={{ display: 'none' }}
                onChange={(e) => handlePhotoChange(e, selectedStory.id)}
              />
              <label htmlFor="photo-file" className="addPhotoLabel">
                <MdOutlineAddPhotoAlternate /> Agregar foto
              </label>
              <input
                type="text"
                placeholder="Título de la foto"
                value={photoTitle}
                onChange={handlePhotoTitleChange}
                className="title-photo"
              />
              <textarea
                placeholder="Comentario sobre la foto"
                value={photoComment}
                onChange={handlePhotoCommentChange}
                className="textarea-comment"
              />
              <div className="char-counter">
                Te quedan {remainingChars} caracteres.
              </div>
              <button
                onClick={() => newPhoto && addPhotoToStory(selectedStory.id, newPhoto)}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Foto'}
              </button>
            </>
          )}
        </div>
      </div>
      )}
      {isModalOpen && selectedStory && (
        <ImageModal
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

export default UserStories;
