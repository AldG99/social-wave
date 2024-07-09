import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "../../styles/login.scss";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  })

  const handleAvatar = e => {
    if(e.target.files[0]){
      setAvatar({
        file:e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const {username, email, password} = Object.fromEntries(formData);

    try {
      
      const res = await createUserWithEmailAndPassword(auth, email, password);

    } catch(err) {
      console.log(err);
      toast.error(err.message);
    }
  }

  const handleLogin = e => {
    e.preventDefault();
  }

  return (
    <div className="login">
      <div className="item">
        <h2>Bienvenido de nuevo</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Correo Electrónico" name="email" />
          <input type="password" placeholder="Contraseña" name="password" />
          <button>Iniciar Sesión</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Crear una cuenta</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
           {avatar.url ? (
              <img src={avatar.url} alt="Avatar" />
            ) : (
              <FaUserCircle className="avatarIcon" />
            )}
            Subir una imagen
          </label>
          <input type="file" id="file" style={{display:"none"}} onChange={handleAvatar} />
          <input type="text" placeholder="Nombre de usuario" name="username" />
          <input type="text" placeholder="Correo Electrónico" name="email" />
          <input type="password" placeholder="Contraseña" name="password" />
          <button>Registrarse</button>
        </form>
      </div>
    </div>
  )
}

export default Login;
