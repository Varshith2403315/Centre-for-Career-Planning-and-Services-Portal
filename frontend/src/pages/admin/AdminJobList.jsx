import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const ROOT = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const BASE_URL = ROOT.replace(/\/$/, '') + '/api';

const AdminJobList = () => {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem("ccps-token");
        const res = await axios.get(`${BASE_URL}/jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setJobs(res.data.jobs || []);
      } catch (error) {
        console.error("Error fetching jobs:", error.response?.data || error.message);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div>
      <Sidebar />
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">All Job Postings</h2>

        {jobs.length === 0 && (
          <p className="text-red-500">No job data found or API failed. Check console.</p>
        )}

        <div className="grid gap-4">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
              <h3 className="text-xl font-bold dark:text-gray-100">{job.jobTitle}</h3>
              <p className="dark:text-gray-300">
                {job.Company} — <span className="italic">{job.Type}</span>
              </p>
              <p className="dark:text-gray-300">Batch: {job.batch}</p>
              <p className="dark:text-gray-300">Deadline: {new Date(job.Deadline).toLocaleDateString()}</p>
              <button
                onClick={() => navigate(`/admin/job/${job._id}/applicants`)}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Applicants
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminJobList;
