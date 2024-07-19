import React from "react";
import { useUserStore } from "../../lib/userStore";
import { useChatStore } from "../../lib/chatStore";
import "../../styles/user/userInfo.scss";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  const userProfile = useChatStore((state) => state.userProfile);

  console.log("currentUser:", currentUser);

  return (
    <div className="userInfo" onClick={userProfile}>
      <div className="user">
        <img src={currentUser?.avatar} alt="Avatar" />
        <h2>{currentUser?.username}</h2>
      </div>
    </div>
  );
};

export default UserInfo;
