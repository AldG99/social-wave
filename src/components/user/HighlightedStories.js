import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import '../../styles/user/highlightedStories.scss';
import { db, storage } from '../../lib/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useUserStore } from '../../lib/userStore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const HighlightedStories = () => {
  const { currentUser } = useUserStore();
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState(null);
  const [newStoryCover, setNewStoryCover] = useState(null);
  const [newStoryName, setNewStoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [editStoryName, setEditStoryName] = useState("");
  const [editStoryCover, setEditStoryCover] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      if (!currentUser?.id) return;
      const userDoc = await getDoc(doc(db, 'users', currentUser.id));
      if (userDoc.exists()) {
        setStories(userDoc.data().highlightedStories || []);
      }
    };
    fetchStories();
  }, [currentUser]);

  const handleFileChange = (e) => {
    if (e.target.files[0] && e.target.files[0].type.startsWith('image/')) {
      setNewStory(e.target.files[0]);
    } else {
      alert('Por favor, seleccione un archivo de imagen válido');
    }
  };

  const handleCoverChange = (e) => {
    if (e.target.files[0] && e.target.files[0].type.startsWith('image/')) {
      setNewStoryCover(e.target.files[0]);
    } else {
      alert('Por favor, seleccione un archivo de imagen válido');
    }
  };

  const handleNameChange = (e) => {
    setNewStoryName(e.target.value);
  };

  const addStory = async () => {
    if (!newStory || !newStoryCover || !newStoryName.trim()) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    setLoading(true);
    const date = new Date().toISOString();
    const coverRef = ref(storage, `stories/${currentUser.id}/${date}-${newStoryCover.name}`);
    const storyRef = ref(storage, `stories/${currentUser.id}/${date}-${newStory.name}`);

    const coverUploadTask = uploadBytesResumable(coverRef, newStoryCover);
    const storyUploadTask = uploadBytesResumable(storyRef, newStory);

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
        storyUploadTask.on(
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
            const storyURL = await getDownloadURL(storyUploadTask.snapshot.ref);
            try {
              const newStoryData = {
                id: date,
                name: newStoryName.trim(),
                cover: coverURL,
                photos: [{ url: storyURL, uploadedAt: date }],
              };
              await updateDoc(doc(db, 'users', currentUser.id), {
                highlightedStories: arrayUnion(newStoryData),
              });
              setStories((prev) => [...prev, newStoryData]);
              setNewStory(null);
              setNewStoryCover(null);
              setNewStoryName("");
            } catch (error) {
              console.error('Error saving story: ', error);
            }
            setLoading(false);
          }
        );
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
          };
          updatedStories[storyIndex].photos.push(newPhotoData);
          await updateDoc(doc(db, 'users', currentUser.id), {
            highlightedStories: updatedStories,
          });
          setStories(updatedStories);
          setSelectedStory(null);
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

      // Delete the photo from storage
      const photoRef = ref(storage, photoToDelete.url);
      await deleteObject(photoRef);

      // Remove the photo from the story
      updatedStories[storyIndex].photos.splice(photoIndex, 1);

      await updateDoc(doc(db, 'users', currentUser.id), {
        highlightedStories: updatedStories,
      });
      setStories(updatedStories);
    } catch (error) {
      console.error('Error deleting photo from story: ', error);
    }
    setLoading(false);
  };

  const handlePhotoChange = (e, storyId) => {
    if (e.target.files[0] && e.target.files[0].type.startsWith('image/')) {
      addPhotoToStory(storyId, e.target.files[0]);
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
              highlightedStories: updatedStories,
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
          highlightedStories: updatedStories,
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="highlightedStories">
      <h3>Historias Destacadas</h3>
      <div className="stories">
        {stories.map((story, index) => (
          <div key={index} className="story">
            <div className="story-image-container" onClick={() => handleStoryClick(story)}>
              {story.cover && (
                <img src={story.cover} alt={`story-cover-${index}`} />
              )}
            </div>
            <div className="story-name">{story.name}</div>
          </div>
        ))}
        <div className="addStory">
          <input
            type="file"
            id="story-cover"
            style={{ display: 'none' }}
            onChange={handleCoverChange}
          />
          <label htmlFor="story-cover" className="addStoryLabel">
            <FaPlus /> Portada
          </label>
          <input
            type="file"
            id="story-file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="story-file" className="addStoryLabel">
            <FaPlus /> Historia
          </label>
          <input
            type="text"
            placeholder="Nombre de la historia"
            value={newStoryName}
            onChange={handleNameChange}
          />
          {newStory && newStoryCover && (
            <button onClick={addStory} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Historia'}
            </button>
          )}
        </div>
      </div>
      {selectedStory && (
        <div className="story-details">
          <h4>{selectedStory.name}</h4>
          <input
            type="text"
            value={editStoryName}
            onChange={handleEditStoryNameChange}
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
            Guardar Cambios
          </button>
          <div className="photos">
            {selectedStory.photos.map((photo, index) => (
              <div key={index} className="photo-container">
                <img src={photo.url} alt={`story-photo-${index}`} />
                <div className="photo-date">{formatDate(photo.uploadedAt)}</div>
                <button
                  className="delete-photo-button"
                  onClick={() => deletePhotoFromStory(selectedStory.id, photo.url)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
          <input
            type="file"
            id="photo-file"
            style={{ display: 'none' }}
            onChange={(e) => handlePhotoChange(e, selectedStory.id)}
          />
          <label htmlFor="photo-file" className="addPhotoLabel">
            <FaPlus /> Agregar foto
          </label>
        </div>
      )}
    </div>
  );
};

export default HighlightedStories;