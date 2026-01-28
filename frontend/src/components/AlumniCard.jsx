import { useRef, useState } from "react";
import { MdEmail, MdSchool, MdBadge, MdWork } from "react-icons/md";
import { FaLinkedin, FaUser } from "react-icons/fa6";
import { RiPhoneFill } from "react-icons/ri";
import { useMenuClose } from "../utils/closeMenuEffect";

function AlumniCard({ alum, index, authUser, onEditAlumni, onDeleteAlumni }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleContextMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEditAlumni = (id) => {
    onEditAlumni(id);
    setIsMenuOpen(false);
  };

  const handleDeleteAlumni = (id) => {
    onDeleteAlumni(id);
    setIsMenuOpen(false);
  };

  useMenuClose(menuRef, () => {
    setIsMenuOpen(false);
  });

  return (
    <div
      key={alum._id}
      className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
    >
      <div className="grid grid-cols-2">
      <div className="col-start-1 col-end-3 flex items-center gap-2">
        <div className="w-[45px] h-[45px] rounded-[50%] border flex items-center justify-center overflow-hidden">
          <FaUser size={28} color="#14B8A6" />
        </div>
        <h3 className="text-xl font-semibold text-[#13665b] relative bottom-1">{alum.name}</h3>
      </div>
      {authUser?.role == "admin" && (
        <div className="col-span-2 col-end-7" ref={menuRef}>
          <div className="relative">
            <div className="flex flex-col space-y-1" role="button" onClick={() => handleContextMenuToggle()} tabIndex={index}>
            <span className="block w-1 h-1 bg-gray-600 rounded-full"></span>
            <span className="block w-1 h-1 bg-gray-600 rounded-full"></span>
            <span className="block w-1 h-1 bg-gray-600 rounded-full"></span>
            </div>
            {isMenuOpen && (
              <ul tabIndex={index} className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                <li><button onClick={handleEditAlumni} className="block w-full px-4 py-2 text-center text-sm text-gray-700 hover:bg-gray-100 focus:outline-hidden">Edit</button></li>
                <li><button onClick={handleDeleteAlumni} className="block w-full px-4 py-2 text-center text-sm text-red-600 hover:bg-gray-100 focus:outline-hidden">Delete</button></li>
              </ul>
            )}
          </div>
        </div>
      )}
      </div>
      <div className="flex items-center gap-2">
        <MdEmail size={20} color="#14B8A6" className="relative top-[1.2px]" />
        <p>{alum.Email || "N/A"}</p>
        </div>
      <div className="flex items-center gap-2">
        <RiPhoneFill size={20} color="#14B8A6" className="relative top-[1.2px]" />
        <p>Mobile: {alum.MobileNumber || "N/A"}</p>
        </div>
      <div className="flex items-center gap-2">
        <MdWork size={20} color="#14B8A6" className="relative top-[1.2px]" />
        <p>Company: {alum.company || "N/A"}</p>
        </div>
      <div className="flex items-center gap-2">
        <MdSchool size={20} color="#14B8A6" className="relative top-[1.2px]" />
        <p>Batch: {alum.batch || "N/A"}</p>
        </div>
      <div className="flex items-center gap-2 mb-3">
        <MdBadge size={20} color="#14B8A6" className="relative top-[1.2px]" />
        <p>Institute ID: {alum.InstituteId || "N/A"}</p>
        </div>
      
      
      {alum.linkedin && (
        <a href={alum.linkedin} target="_blank" rel="noopener noreferrer" className="text-teal-600  hover:underline">
          <div className="flex items-center justify-center h-8 gap-[9px] text-[white] rounded-md bg-[linear-gradient(135deg,#1466C2,#4F9AE3)]">
          <FaLinkedin color="white" />
          <p>View LinkedIn Profile</p>
        </div>
        </a>
      )}
    </div>
  );
}

export default AlumniCard;
