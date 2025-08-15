import { AiFillHome } from "react-icons/ai";
import "./HomeButton.css"
export default function HomeButton({ onClick }) {
  return (
    <button className="homeCircleButton" onClick={onClick}>
      <AiFillHome size={24} color="#fff" />
    </button>
  );
}
