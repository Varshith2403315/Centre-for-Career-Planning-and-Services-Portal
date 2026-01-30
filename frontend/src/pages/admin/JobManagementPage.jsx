import React, { useState, useEffect, useCallback } from 'react';
import { fetchJobs, deleteJob } from "../../api/jobsApi";
import Sidebar from "../../components/Sidebar";
import JobFormModal from '../../components/JobFormModal';
import toast from "react-hot-toast";

const JobManagementPage = () => {
    const [jobs, setJobs] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [jobToEdit, setJobToEdit] = useState(null);

    const getAdminToken = useCallback(() => {
        const userString = localStorage.getItem('ccps-user');
        const tokenFromTokenKey = localStorage.getItem('ccps-token');

        if (userString) {
            try {
                const user = JSON.parse(userString);
                return user.token || user.accessToken;
            } catch (e) {
                console.error("Error parsing ccps-user data from localStorage:", e);
                return tokenFromTokenKey;
            }
        }
        return tokenFromTokenKey;
    }, []);
    const loadJobs = useCallback(async () => {
        const token = getAdminToken();

        if (!token) {
            console.error('Authentication token is missing. Please log in as Admin.');
            return;
        }

        try {
            const data = await fetchJobs(token);
            setJobs(data.jobs || []);
        } catch (err) {
            console.error('Failed to load jobs:', err.message);
            toast.error('Failed to load jobs: ' + err.message);
        }
    }, [getAdminToken]);

    useEffect(() => {
        loadJobs();
    }, [loadJobs]);

    const handleEditClick = (job) => {
        setJobToEdit(job);
        setIsFormOpen(true);
    };
    const handleFormClose = () => {
        setIsFormOpen(false);
        setJobToEdit(null);
    };

    const handleFormSubmitSuccess = (updatedOrCreatedJob) => {
        if (updatedOrCreatedJob && updatedOrCreatedJob._id) {
            setJobs(prevJobs => {
                const index = prevJobs.findIndex(job => job._id === updatedOrCreatedJob._id);

                if (index !== -1) {
                    return prevJobs.map(job =>
                        job._id === updatedOrCreatedJob._id ? updatedOrCreatedJob : job
                    );
                } else {
                    return [updatedOrCreatedJob, ...prevJobs];
                }
            });
        }

    };
    const handleDelete = async (jobId, jobTitle) => {
        const token = getAdminToken();
        if (!token) {
            toast.error('Authentication required to delete job.');
            return;
        }

        const isConfirmed = window.confirm(
            `⚠️ Are you sure you want to delete the job: "${jobTitle}"? This action cannot be undone.`
        );

        if (isConfirmed) {
            try {
                await deleteJob(jobId, token);
                setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
                toast.success(`Job "${jobTitle}" successfully deleted!`);
            } catch (err) {
                console.error('Deletion error:', err.message);
                toast.error(`Error deleting job: ${err.message}`);
            }
        }
    };


    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
            <Sidebar />

            {/* Render the modal when isFormOpen is true */}
            {isFormOpen && (
                <JobFormModal
                    jobToEdit={jobToEdit}
                    // Pass the success handler that updates state directly
                    onFormSubmitSuccess={handleFormSubmitSuccess}
                    onClose={handleFormClose}
                />
            )}

            <main className="flex-1 p-6 pt-20 md:pt-8 w-full">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">

                    {/* Header */}
                    <div className="bg-[#0c4a42] p-6 flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Job Management Portal</h1>
                            <p className="text-green-300 mt-1">Review and manage all active job postings</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md">
                            {jobs.length === 0 ? (
                                <p className="p-4 text-center text-gray-500 dark:text-gray-400">No jobs currently posted.</p>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Applications Count</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {jobs.map((job) => (
                                            <tr key={job._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{job.jobTitle}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{job.Company}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{job.jobApplications ? job.jobApplications.length : 0}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    <button
                                                        // Pass the job object to handler
                                                        onClick={() => handleEditClick(job)}
                                                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 px-3 py-1 rounded-md transition duration-150"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(job._id, job.jobTitle)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 px-3 py-1 rounded-md transition duration-150"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default JobManagementPage;