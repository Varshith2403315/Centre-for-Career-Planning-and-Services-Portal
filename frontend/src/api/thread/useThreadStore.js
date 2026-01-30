import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';
import { useState, useEffect } from 'react';

const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

const useThreadStore = () => {
    const [loading, setLoading] = useState(false);
    const [threads, setThreads] = useState([]);
    const { backendUrl } = useAppContext();
    const token = localStorage.getItem('ccps-token');

    useEffect(() => {
        getThreads();
    }, []);

    const getThreads = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/api/threads/getThreads`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            setThreads(data.threads);
        }
        catch (error) {
            toast.error(error.message);
        }
        finally {
            setLoading(false);
        }
    };

    const createThread = async (threadData) => {
        const success = handleInputError(threadData);
        if (!success) return;

        if (threadData.file) {
            threadData.file = await convertToBase64(threadData.file);
        }

        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/api/threads/createThread`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(threadData)
            });

            if (!res.ok) {
                throw new Error(`Request failed with status: ${res.status}`);
            }

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Unknown error");
            }

            setThreads((prevThreads) => [data.newThread, ...prevThreads]); 
            toast.success("Thread created!");
            return true;
        } catch (error) {
            console.error("Error creating thread:", error);
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const createComment = async (commentData) => {
        const success = handleInputError1(commentData);
        if (!success) return;

        if (commentData.file) {
            commentData.file = await convertToBase64(commentData.file);
        }

        setLoading(true);
        try {
            const res = await fetch(`${backendUrl}/api/threads/createComment/${commentData.threadId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(commentData)
            });

            if (!res.ok) {
                throw new Error(`Request failed with status: ${res.status}`);
            }

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message || "Unknown error");
            }
            
            // Re-fetch threads to update comments list
                        // setThreads((prevThreads) =>
            //     prevThreads.map((t) =>
            //         t._id === commentData.threadId
            //             ? { ...t, comments: [...t.comments, data.newComment] }
            //             : t
            //     )
            // );
            getThreads();
            toast.success("Comment added!");
            return true;
        } catch (error) {
            console.error("Error creating comment:", error);
            toast.error(error.message);
            return false;
        } finally {
            setLoading(false);
        }
    };
    const handleThreadVote = async (threadId, voteType) => {
        try {
            const res = await fetch(`${backendUrl}/api/threads/vote/${threadId}`, { 
                method: 'PUT', // ✅ Method is PUT
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ voteType }) 
            });

            let data = {};
            if (res.ok) {
                data = await res.json();
            } else {
                try {
                    data = await res.json();
                } catch (e) {
                    // Fallback for HTML error pages (the 404 issue)
                    throw new Error(data.message || `Server error (Status: ${res.status}). Route not found on server.`); 
                }
            }

            if (!res.ok) {
                throw new Error(data.message || res.statusText); 
            }

            return data.updatedThread; 

        } catch (error) {
            // Re-throw so Thread.jsx can catch and display the toast
            console.error("Error voting on thread:", error);
            throw error; 
        }
    };


    // 🚀 EXPORT: Ensure handleThreadVote is returned
    return { 
        loading, 
        threads, 
        getThreads, 
        setThreads, 
        createThread, 
        createComment, 
        handleThreadVote 
    };
}

function handleInputError({ title, text }) {
    if (!title || !text) {
        toast.error('Fill out the required fields');
        return false;
    }
    return true;
}

function handleInputError1({ text, file, threadId }) {
    if (!text && !file) {
        toast.error('Empty comment');
        return false;
    }
    if (!threadId) {
        toast.error('Thread not found');
        return false;
    }
    return true;
}

export default useThreadStore; 
