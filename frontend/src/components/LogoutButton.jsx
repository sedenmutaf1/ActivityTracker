import { FiLogOut } from "react-icons/fi"; // logout icon
import "./HomeButton.css"; // reuse styles

export default function LogoutButton({ onClick }) {
  return (
    <button className="homeCircleButton" onClick={onClick}>
      <FiLogOut size={24} color="#fff" />
    </button>
  );
}