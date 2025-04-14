import { AiFillHome } from "react-icons/ai"; // or MdHome from material icons
import "./HomeButton.css"
export default function HomeButton({ onClick }) {
  return (
    <button className="homeCircleButton" onClick={onClick}>
      <AiFillHome size={24} color="#fff" />
    </button>
  );
}
