import { useState } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { formatTimeAgo } from '@/lib/utils';
import api from '@/lib/api';

interface Comment {
  _id: string;
  userId: { username: string; email: string };
  content: string;
  replies?: Comment[];
  createdAt: string;
}

interface CommentsSectionProps {
  problemId: string;
  comments: Comment[];
  onCommentsUpdate: (comments: Comment[]) => void;
  user: any;
  onLoginRequired: (action: 'comment') => void;
}

export default function CommentsSection({
  problemId,
  comments,
  onCommentsUpdate,
  user,
  onLoginRequired,
}: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const fetchComments = async () => {
    try {
      const response = await api.get('/comments', {
        params: { problemId },
      });
      onCommentsUpdate(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      onLoginRequired('comment');
      return;
    }

    setSubmittingComment(true);
    try {
      await api.post('/comments', {
        problemId,
        content: newComment,
      });

      setNewComment('');
      await fetchComments();
    } catch (error: any) {
      if (error.response?.status === 401) {
        onLoginRequired('comment');
      } else {
        alert(error.response?.data?.message || 'Failed to post comment');
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!replyText.trim()) return;

    if (!user) {
      onLoginRequired('comment');
      return;
    }

    try {
      await api.post('/comments', {
        problemId,
        content: replyText,
        parentId,
      });

      setReplyText('');
      setReplyingTo(null);
      await fetchComments();
    } catch (error: any) {
      if (error.response?.status === 401) {
        onLoginRequired('comment');
      } else {
        alert(error.response?.data?.message || 'Failed to post reply');
      }
    }
  };

  const CommentItem = ({ comment, isReply = false, depth = 0 }: { comment: Comment; isReply?: boolean; depth?: number }) => {
    const maxDepth = 5; // Prevent infinite nesting beyond reasonable levels
    const canReply = depth < maxDepth;

    return (
      <div className={`${isReply ? 'ml-8 mt-3' : ''} ${isReply ? 'border-l-2 border-gray-600 pl-4' : 'border-l-2 border-gray-600 pl-4 py-3 hover:border-blue-500 transition'}`}>
        <div className="flex items-start gap-3">
          <Avatar username={comment.userId?.username || 'User'} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-white">
                {comment.userId?.username || 'Anonymous'}
              </span>
              <span className="text-gray-400 text-xs">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-2">{comment.content}</p>

            {canReply && user && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                className="text-blue-400 hover:text-blue-300 text-xs font-medium transition"
              >
                Reply
              </button>
            )}
          </div>
        </div>

        {/* Reply form */}
        {replyingTo === comment._id && (
          <div className="mt-3 ml-11">
            <div className="flex gap-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[60px]"
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleReplySubmit(comment._id)}
                  disabled={!replyText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50 transition"
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  className="text-gray-400 hover:text-gray-300 px-3 py-2 rounded-lg text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Render replies recursively */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply._id} comment={reply} isReply={true} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Discussion
      </h2>

      {user ? (
        <div className="space-y-4 mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
          />
          <button
            onClick={handleCommentSubmit}
            disabled={submittingComment || !newComment.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition"
          >
            <Send className="h-4 w-4" />
            Post Comment
          </button>
        </div>
      ) : (
        <div className="mb-4 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
          <p className="text-gray-300 mb-3">Login to join the discussion</p>
          <button
            onClick={() => onLoginRequired('comment')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            Login to Comment
          </button>
        </div>
      )}

      <div className="space-y-4 mt-6">
        {comments.length === 0 ? (
          <p className="text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
}