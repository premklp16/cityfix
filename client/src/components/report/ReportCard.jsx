import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCommentAlt, FaArrowUp, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Card from '../common/Card';
import StatusBadge from '../common/StatusBadge';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { CATEGORY_COLORS } from '../../utils/constants';

const ReportCard = ({ report, onUpvote }) => {
  const handleUpvote = (e) => {
    e.preventDefault(); // Prevent navigation since it's wrapped in a Link
    e.stopPropagation();
    if (onUpvote) onUpvote(report._id);
  };

  const categoryColor = CATEGORY_COLORS[report.category] || CATEGORY_COLORS['Other'];

  return (
    <Link to={`/complaints/${report._id}`} className="block h-full">
      <Card hover padding="none" className="h-full flex flex-col border border-gray-100">
        <div className="relative h-48 w-full bg-gray-200">
          {report.images && report.images.length > 0 ? (
            <img
              src={report.images[0]}
              alt={report.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-slate-100">
              <span className="text-4xl mb-2">📸</span>
              <span>No image provided</span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex gap-2">
            <StatusBadge status={report.status} />
          </div>

          <div className="absolute top-3 right-3">
            <Badge
              text={report.severity}
              variant={report.severity === 'Critical' ? 'danger' : report.severity === 'High' ? 'orange' : report.severity === 'Medium' ? 'warning' : 'success'}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5 flex flex-col flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: categoryColor }}
            ></div>
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
              {report.category}
            </span>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
            {report.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
            {report.description}
          </p>

          <div className="flex items-center text-gray-500 text-xs mb-4">
            <FaMapMarkerAlt className="mr-1.5 flex-shrink-0 text-primary-500" />
            <span className="line-clamp-1">{report.location}</span>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar src={report.createdBy?.profileImage} name={report.createdBy?.name} size="sm" />
              <div className="text-xs">
                <p className="font-medium text-gray-900">{report.createdBy?.name || 'Anonymous'}</p>
                <p className="text-gray-500 flex items-center gap-1">
                  <FaClock className="text-[10px]" />
                  {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors bg-gray-50 hover:bg-primary-50 px-2 py-1 rounded"
                onClick={handleUpvote}
              >
                <FaArrowUp className="text-xs" />
                <span className="text-xs font-semibold">{report.upvoteCount || 0}</span>
              </button>
              <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 py-1 rounded">
                <FaCommentAlt className="text-xs" />
                <span className="text-xs font-semibold">{report.commentsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default ReportCard;
