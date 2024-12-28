// Importa los estilos específicos para el componente "List" desde el archivo correspondiente.
import '../../styles/chat/list.scss';

// Importa el componente "UserInfo", que probablemente muestra la información del usuario.
import UserInfo from '../user/userInfo';

// Importa el componente "ChatList", que probablemente muestra una lista de chats.
import ChatList from './chatList';

// Define el componente funcional "List".
const List = () => {
  return (
    // Contenedor principal con una clase CSS "list".
    <div className="list">
      {/* Renderiza el componente "UserInfo" dentro del contenedor. */}
      <UserInfo />
      {/* Renderiza el componente "ChatList" dentro del contenedor. */}
      <ChatList />
    </div>
  );
};

// Exporta el componente "List" como el predeterminado del módulo.
export default List;
