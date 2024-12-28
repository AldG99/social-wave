// Importa React y los hooks necesarios para manejar estados y efectos.
import React, { useEffect, useState } from 'react';

// Importa el hook personalizado para acceder al estado global de la aplicación.
import { useChatStore } from '../../lib/chatStore';

// Importa la configuración de Firebase Firestore.
import { db } from '../../lib/firebaseConfig';

// Importa las funciones necesarias de Firestore para manejar documentos.
import { doc, getDoc } from 'firebase/firestore';

// Importa los estilos específicos para el componente "Detail".
import '../../styles/detail/detail.scss';

// Objeto que traduce los nombres de continentes en inglés a español.
const continentNames = {
  africa: 'África',
  asia: 'Asia',
  europe: 'Europa',
  'north-america': 'América del Norte',
  'south-america': 'América del Sur',
  oceania: 'Oceanía',
};

// Define el componente funcional "Detail" con una propiedad "onProfileClick".
// Esta propiedad es una función que se ejecuta al hacer clic en el botón del perfil.
const Detail = ({ onProfileClick }) => {
  // Define un estado local "presentation" para almacenar el mensaje de presentación del usuario.
  const [presentation, setPresentation] = useState('');

  // Accede al estado global para obtener la información del usuario actual.
  const { user } = useChatStore();

  // Efecto que se ejecuta al montarse el componente o cuando cambia el usuario.
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return; // Si no hay un usuario, termina la función.

      try {
        // Obtiene el documento del usuario desde Firestore utilizando su ID.
        const userDoc = await getDoc(doc(db, 'users', user.id));

        // Si el documento del usuario existe, actualiza el estado "presentation" con sus datos.
        if (userDoc.exists()) {
          setPresentation(userDoc.data().presentation || 'Hola a Todos!'); // Valor por defecto si no hay presentación.
        }
      } catch (err) {
        // Maneja errores durante la obtención de datos.
        console.log(err);
      }
    };

    // Llama a la función para obtener los datos del usuario.
    fetchUserData();
  }, [user]); // Dependencia: el efecto se ejecuta cuando cambia el valor de "user".

  return (
    <div className="detail">
      <div className="user">
        {/* Muestra el avatar del usuario si está disponible. */}
        <img src={user?.avatar} alt="Avatar" />

        {/* Muestra el nombre de usuario si está disponible. */}
        <h2>{user?.username}</h2>

        {/* Muestra el identificador único del usuario. */}
        <h4>{user?.uid}</h4>

        {/* Muestra el nombre del continente basado en el código almacenado para el usuario. */}
        <h3>{continentNames[user?.continent]}</h3>

        {/* Muestra el mensaje de presentación del usuario. */}
        <p>{presentation}</p>

        {/* Botón que llama a la función "onProfileClick" cuando se hace clic en él. */}
        <button className="user-profile-button" onClick={onProfileClick}>
          Perfil de Usuario
        </button>
      </div>
    </div>
  );
};

// Exporta el componente "Detail" como el predeterminado del módulo.
export default Detail;
