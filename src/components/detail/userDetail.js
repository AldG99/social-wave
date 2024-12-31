import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '../../lib/chatStore'; // Importa el estado global del chat.
import { db } from '../../lib/firebaseConfig'; // Configuración de Firebase.
import { doc, getDoc } from 'firebase/firestore'; // Funciones de Firebase para obtener documentos.
import StoriesDetail from './storiesDetail'; // Componente para mostrar historias.
import '../../styles/detail/userDetail.scss'; // Estilos para el componente.

const continentNames = {
  africa: 'África',
  asia: 'Asia',
  europe: 'Europa',
  'north-america': 'América del Norte',
  'south-america': 'América del Sur',
  oceania: 'Oceanía',
};

const UserDetail = ({ handleBackToChat }) => {
  const [presentation, setPresentation] = useState(''); // Estado para la presentación del usuario.
  const [newStories, setNewStories] = useState([]); // Estado para las historias del usuario.
  const { user } = useChatStore(); // Obtiene el usuario actual desde el estado global.

  const userDetailRef = useRef(null); // Referencia al contenedor principal del componente.

  // Efecto para cargar los datos del usuario desde Firebase.
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return; // Si no hay usuario, no hace nada.

      try {
        const userDoc = await getDoc(doc(db, 'users', user.id)); // Obtiene el documento del usuario desde Firebase.
        if (userDoc.exists()) {
          setPresentation(userDoc.data().presentation || 'Hola a Todos!'); // Actualiza la presentación.
          setNewStories(userDoc.data().newStories || []); // Actualiza las historias.
        }
      } catch (err) {
        console.log(err); // Maneja errores en la consola.
      }
    };

    fetchUserData(); // Llama a la función para obtener los datos del usuario.
  }, [user]); // Dependencia: se ejecuta cuando cambia `user`.

  // Efecto para manejar clics fuera del componente y regresar al chat.
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        userDetailRef.current &&
        !userDetailRef.current.contains(event.target)
      ) {
        handleBackToChat(); // Llama a la función para regresar al chat si se hace clic fuera.
      }
    };

    document.addEventListener('mousedown', handleClickOutside); // Añade un event listener para detectar clics.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Limpia el listener al desmontar el componente.
    };
  }, [handleBackToChat]); // Dependencia: se ejecuta cuando cambia `handleBackToChat`.

  return (
    <div className="userDetail" ref={userDetailRef}>
      {' '}
      {/* Contenedor principal del componente. */}
      <div className="user">
        {' '}
        {/* Sección para mostrar los datos del usuario. */}
        <img src={user?.avatar} alt="Avatar" />{' '}
        {/* Muestra el avatar del usuario. */}
        <h2>{user?.username}</h2> {/* Muestra el nombre de usuario. */}
        <h4>{user?.uid}</h4> {/* Muestra el ID del usuario. */}
        <h3>{continentNames[user?.continent]}</h3>{' '}
        {/* Muestra el continente del usuario. */}
        <p>{presentation}</p> {/* Muestra la presentación del usuario. */}
        <button onClick={handleBackToChat}>Regresar</button>{' '}
        {/* Botón para regresar al chat. */}
      </div>
      <StoriesDetail stories={newStories} />{' '}
      {/* Componente para mostrar historias del usuario. */}
    </div>
  );
};

export default UserDetail; // Exporta el componente.
