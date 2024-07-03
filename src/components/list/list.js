import "../../styles/list.scss";
import ChatList from "./chatList/chatList";
import UserInfo from "./userInfo/userInfo";

const List = () => {
  return (
    <div className="list">
      <UserInfo/>
      <ChatList/>
    </div>
  )
}

export default List;
