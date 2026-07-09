import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FaPaperPlane } from 'react-icons/fa';
import * as commentApi from '../../api/commentApi';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import toast from 'react-hot-toast';

const CommentSection = ({ reportId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [reportId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await commentApi.getComments(reportId, { limit: 50 });
      setComments(res.data.data.comments);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const res = await commentApi.addComment(reportId, { comment: newComment });
      
      // Add the new comment to the list with current user data to avoid refetching
      const commentWithUser = {
        ...res.data.data,
        userId: {
          _id: user.id,
          name: user.name,
          profileImage: user.profileImage,
          role: user.role
        }
      };
      
      setComments([commentWithUser, ...comments]);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error(error.extractedMessage || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-8 flex justify-center"><Spinner /></div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Comments ({comments.length})</h3>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-3">
          <Avatar src={user?.profileImage} name={user?.name} className="mt-1" />
          <div className="flex-grow">
            <textarea
              className="input w-full min-h-[80px] resize-y"
              placeholder="Add a public comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            ></textarea>
            <div className="mt-2 flex justify-end">
              <Button 
                type="submit" 
                size="sm" 
                disabled={!newComment.trim() || submitting}
                loading={submitting}
                icon={<FaPaperPlane />}
              >
                Comment
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center border border-gray-200">
          <p className="text-gray-600 mb-2">Please login to join the discussion.</p>
        </div>
      )}

      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-4">
              <Avatar 
                src={comment.userId?.profileImage} 
                name={comment.userId?.name || 'User'} 
              />
              <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {comment.userId?.name || 'Deleted User'}
                    </span>
                    {comment.userId?.role === 'officer' && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        Official
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-line text-sm">{comment.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 py-4">No comments yet. Be the first to share your thoughts!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
