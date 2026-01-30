import React from 'react'

const Comment = ({ comment, threadAuthor }) => {
  const renderFile = () => {
    if (!comment.file) return null
    const isImage = comment.file.match(/\.(jpeg|jpg|png|gif)$/i)
    if (isImage) {
      return <img src={comment.file} width={400} alt="Comment Attachment" className="h-auto rounded-lg mt-2" />
    }
    return null
  }

  return (
    <div className="border-t border-gray-100 dark:border-gray-700 pt-2 pb-1">
      <p className="text-gray-800 dark:text-gray-300 text-xs">
        <span className={`font-semibold ${threadAuthor === comment.author._id ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-400'}`}>
          {comment.author.name}
        </span>: {comment.text}
      </p>
      {renderFile()}
    </div>
  )
}

export default Comment
