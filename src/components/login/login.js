import { useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import "../../styles/login.scss";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../../lib/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url: ""
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if(e.target.files[0]){
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    if (!validateEmail(email)) {
      toast.error("Por favor ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);

      await updateProfile(res.user, {
        displayName: username,
        photoURL: imgUrl,
      });

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Cuenta creada! Puedes iniciar sesión ahora!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    if (!validateEmail(email)) {
      toast.error("Por favor ingresa un correo electrónico válido.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="item">
        <h2>Bienvenido de nuevo</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Correo Electrónico" name="email" />
          <input type="password" placeholder="Contraseña" name="password" />
          <button disabled={loading}>{loading ? "Cargando" : "Iniciar Sesión"}</button>
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
          <input type="file" id="file" style={{display: "none"}} onChange={handleAvatar} />
          <input type="text" placeholder="Nombre de usuario" name="username" />
          <input type="text" placeholder="Correo Electrónico" name="email" />
          <input type="password" placeholder="Contraseña" name="password" />
          <button disabled={loading}>{loading ? "Cargando" : "Registrarse"}</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
