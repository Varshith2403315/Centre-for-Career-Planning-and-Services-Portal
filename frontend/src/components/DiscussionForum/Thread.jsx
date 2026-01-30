import React, { useState } from 'react'
import useThreadStore from '../../api/thread/useThreadStore'
import { useAuthContext } from '../../context/AuthContext'
import Comment from '../Comment'
import toast from 'react-hot-toast'

const Thread = ({ thread, onVoteSuccess, refreshThreads }) => {
    const { createComment, loading, handleThreadVote } = useThreadStore()
    const { authUser } = useAuthContext()
    const currentUserId = authUser?._id

    const [localThread, setLocalThread] = useState(thread)
    const [showComments, setShowComments] = useState(false)
    const [newComment, setNewComment] = useState("")
    const [file, setFile] = useState(null)
    const [showCommentForm, setShowCommentForm] = useState(false)
    const [voteLoading, setVoteLoading] = useState(false)

    const handleFileChange = (e) => setFile(e.target.files[0])

    const isUpvoted = localThread.upvotes?.includes(currentUserId)
    const isDownvoted = localThread.downvotes?.includes(currentUserId)

    const handleVote = async (type) => {
        if (!currentUserId || voteLoading) return
        setVoteLoading(true)

        try {
            let updatedThread = { ...localThread }

            if (type === 'upvote') {
                if (isUpvoted) {
                    updatedThread.upvotes = updatedThread.upvotes.filter(id => id !== currentUserId)
                } else {
                    updatedThread.upvotes = [...updatedThread.upvotes, currentUserId]
                    updatedThread.downvotes = updatedThread.downvotes.filter(id => id !== currentUserId)
                }
            } else if (type === 'downvote') {
                if (isDownvoted) {
                    updatedThread.downvotes = updatedThread.downvotes.filter(id => id !== currentUserId)
                } else {
                    updatedThread.downvotes = [...updatedThread.downvotes, currentUserId]
                    updatedThread.upvotes = updatedThread.upvotes.filter(id => id !== currentUserId)
                }
            }

            setLocalThread(updatedThread)

            const res = await handleThreadVote(thread._id, type)
            if (res?.updatedThread) {
                setLocalThread(res.updatedThread)
                if (typeof onVoteSuccess === 'function') onVoteSuccess(res.updatedThread)
            }
        } catch (error) {
            console.error("Voting failed:", error)
            toast.error(error.message || "Failed to record vote.")
        } finally {
            setVoteLoading(false)
        }
    }

    useEffect(() => {
        setLocalThread(thread)
    }, [thread])
    const handleAddComment = async (e) => {
        e.preventDefault()
        const commentData = { text: newComment, threadId: thread._id, file }
        const success = await createComment(commentData)
        if (success) {
            setNewComment("")
            setFile(null)
            setShowCommentForm(false)
            refreshThreads()

            toast.success("Comment added successfully!")
        }
    }

    const renderFile = () => {
        if (!localThread.file) return null
        const isImage = localThread.file.match(/\.(jpeg|jpg|png|gif)$/i)
        if (isImage) {
            return (
                <img
                    src={localThread.file}
                    alt="Thread Attachment"
                    width={400}
                    className="mt-3 rounded-md shadow-sm"
                />
            )
        }
        return null
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 min-h-[210px] flex gap-4 shadow border border-gray-200 dark:border-gray-700 hover:shadow-md transition duration-150">

            <div className="flex flex-col items-center justify-start w-10 mt-auto mb-1">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleVote('upvote')}
                        disabled={voteLoading || !currentUserId}
                        className={`text-gray-500 hover:text-green-600 disabled:opacity-50 transition
                            ${isUpvoted ? '!text-green-600' : ''}`}
                        aria-label="Upvote thread"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4l-8 8h16z" />
                        </svg>
                    </button>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {localThread.upvotes?.length || 0}
                    </span>
                </div>

                <div className="flex items-center gap-1 mt-2">
                    <button
                        onClick={() => handleVote('downvote')}
                        disabled={voteLoading || !currentUserId}
                        className={`text-gray-500 hover:text-red-600 disabled:opacity-50 transition
                            ${isDownvoted ? '!text-red-600' : ''}`}
                        aria-label="Downvote thread"
                    >
                        <svg className="w-5 h-5 rotate-180" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 4l-8 8h16z" />
                        </svg>
                    </button>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {localThread.downvotes?.length || 0}
                    </span>
                </div>
            </div>

            {/* THREAD CONTENT */}
            <div className="flex-1 flex flex-col">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{localThread.title}</h3>
                <div className="mt-2 flex-1 flex flex-col justify-between gap-3">
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{localThread.text}</p>
                    {renderFile()}
                </div>

                {/* Bottom Bar */}
                <div className="flex justify-end items-end w-full mt-3">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
                            Author: {localThread.author.name}
                        </span>
                    </div>
                    <button
                        className="px-4 py-1.5 text-xs font-medium rounded transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        onClick={() => setShowComments(!showComments)}
                        type="button"
                    >
                        {showComments ? "Hide Comments" : `Show Comments (${localThread.comments.length})`}
                    </button>
                </div>

                {/* Comments */}
                {showComments && (
                    <div className="mt-4 space-y-2">
                        {localThread.comments.length > 0 ? (
                            localThread.comments.map((comment) => (
                                <Comment key={comment._id} comment={comment} threadAuthor={localThread.author._id} />
                            ))
                        ) : (
                            <p className="text-gray-500 text-xs">No comments yet.</p>
                        )}

                        <button
                            className="mt-2 px-3 py-1 text-xs bg-emerald-100 text-emerald-700 font-medium rounded hover:bg-emerald-200 transition"
                            onClick={() => setShowCommentForm(!showCommentForm)}
                            type="button"
                        >
                            {showCommentForm ? "Cancel" : "Add Comment"}
                        </button>

                        {showCommentForm && (
                            <form
                                onSubmit={handleAddComment}
                                className="mt-2 flex flex-col gap-2 rounded-md bg-emerald-50 dark:bg-emerald-900/30 p-3"
                            >
                                <textarea
                                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded-md focus:border-emerald-400 focus:ring-emerald-100 dark:bg-gray-700 dark:text-white text-sm"
                                    rows="2"
                                    placeholder="Write a comment..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    required
                                />
                                <input
                                    type="file"
                                    className="text-xs"
                                    accept=".jpg,.jpeg,.png,.gif,.pdf"
                                    onChange={handleFileChange}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || newComment.trim() === ""}
                                    className="self-end mt-1 px-4 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 disabled:opacity-50 transition"
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Thread
