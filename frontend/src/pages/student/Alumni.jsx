import { useEffect, useState, useRef } from "react";

import Sidebar from "../../components/Sidebar";
import useGetAlumni from "../../api/alumni/useGetAlumni";
import useGetAllAlumni from "../../api/alumni/useGetAllAlumni";
import { useAuthContext } from '../../context/AuthContext';
import AddEditAlumniModal from "../../components/AddEditAlumniModal";
import AlumniCard from "../../components/AlumniCard";
import useAlumniAdmin from "../../api/alumni/useAlumniAdmin";
import toast from "react-hot-toast";

const Alumni = () => {
  const { authUser } = useAuthContext();
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState("company");
  const [alumniList, setAlumniList] = useState([]);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { loading: loadingAll, alumni } = useGetAllAlumni();
  const { loading: loadingSearch, getAlumni } = useGetAlumni();
  const { deleteAlumni } = useAlumniAdmin();

  useEffect(() => {
    setAlumniList(alumni);
  }, [alumni]);

  const handleSearch = async () => {
    const data = await getAlumni(searchType, search);
    setAlumniList(data.length > 0 ? data : []);
  };

  const handleReset = () => {
    setSearch("");
    setSearchType("company");
    setAlumniList(alumni);
  };

  const handleEditAlumni = (id) => () => {
    const alum = alumniList.find((a) => a._id === id);
    if (alum) {
      openAddEditModal(alum);
    }
  };

  const handleDeleteAlumni = (id) => async () => {
    const token = localStorage.getItem("ccps-token");
    if (!id) return;
    if (window.confirm("Are you sure you want to delete this alumni?")) {
      try {
        await deleteAlumni(id, token);
        setAlumniList(alumniList.filter((a) => a._id !== id));
      } catch (error) {
        toast.error("Failed to delete alumni");
      }
    }
  }

  const openAddEditModal = (alumni) => {
    setSelectedAlumni(alumni);
    setIsModalOpen(true);
  };

  const closeAddEditModal = () => {
    setIsModalOpen(false);
    setSelectedAlumni(null);
  };

  const onAddNewAlumni = (newAlumni) => {
    // Add the new alumni to the list
    setAlumniList([...alumniList, newAlumni]);
    setIsModalOpen(false);
  };

  const onUpdateExistingAlumni = (updatedAlumni) => {
    // Update the alumni in the list
    setAlumniList(alumniList.map((a) => (a._id === updatedAlumni._id ? { ...a, ...updatedAlumni } : a)));
    setIsModalOpen(false);
  };

  const onDeleteExistingAlumni = (id) => {
    // Remove the alumni from the list
    setAlumniList(alumniList.filter((a) => a._id !== id));
    setIsModalOpen(false);
  }

  const labelMap = {
    company: "Company Name",
    jobRole: "Job Role",
    jobId: "Job ID",
    batch: "Batch (e.g., 2022 or 2022-2025)",
    name: "Name",
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <section className="flex-1 overflow-y-auto pt-16 bg-gray-100 dark:bg-black px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl mt-6 md:mt-0 font-bold text-center text-[#13665b] dark:text-emerald-400 mb-4">
            Welcome to the Alumni Portal 🎓
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Search for alumni by company, job role, job ID, batch or name
          </p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-2 mb-8">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white rounded-md"
            >
              <option value="company">Company</option>
              <option value="jobRole">Job Role</option>
              <option value="jobId">Job ID</option>
              <option value="batch">Batch</option>
              <option value="name">Name</option>
            </select>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Enter ${labelMap[searchType]}`}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md w-72"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-[#13665b] "
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-[#13665b] "
            >
              Reset Search
            </button>
            {authUser?.role === "admin" && (
              <button
                onClick={() => openAddEditModal(null)}
                className="px-4 py-2 bg-gradient-to-r from-[#0fa18e] to-emerald-600 text-white rounded-md hover:from-[#13665b] hover:to-emerald-700"
              >
                + Add Alumni
              </button>
            )}
          </div>

          {(loadingAll || loadingSearch) ? (
            <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
          ) : alumniList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {alumniList.map((alum, index) => (
                <AlumniCard
                  key={index}
                  alum={alum}
                  index={index}
                  authUser={authUser}
                  onEditAlumni={handleEditAlumni(alum._id)}
                  onDeleteAlumni={handleDeleteAlumni(alum._id)}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">No alumni found.</p>
          )}
        </div>
      </section>
      {isModalOpen && (
        <AddEditAlumniModal
          alumni={selectedAlumni}
          alumniList={alumniList}
          onAddAlumni={onAddNewAlumni}
          onUpdateAlumni={onUpdateExistingAlumni}
          onDeleteAlumni={onDeleteExistingAlumni}
          onClose={closeAddEditModal}
        />
      )}
    </div>
  );
};

export default Alumni;