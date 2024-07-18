import "../../styles/chat/list.scss";
import UserInfo from "../user/userInfo";
import ChatList from "./chatList";

const List = () => {
  return (
    <div className="list">
      <UserInfo />
      <ChatList />
    </div>
  )
}

export default List;
