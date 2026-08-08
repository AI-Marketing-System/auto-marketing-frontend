import React from 'react';
import './AvatarGroup.css';

// Hàm lấy chữ cái đầu của tên (hỗ trợ tiếng Việt)
const getInitials = (name) => {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

// Hàm điều chỉnh độ sáng/tối của màu (để chữ luôn dễ đọc hoặc màu dịu hơn)
const adjustColor = (colorCode) => {
  // Đơn giản hóa: dùng mảng màu cố định cho đẹp
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#f43f5e'
  ];
  let hash = 0;
  for (let i = 0; i < colorCode.length; i++) {
    hash = colorCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const AvatarGroup = ({ members = [], max = 4, onAddClick, onGroupClick }) => {
  // Lọc ra danh sách cần hiển thị
  const showCount = members.length > max ? max - 1 : members.length;
  const visibleMembers = members.slice(0, showCount);
  const remainingCount = members.length - showCount;

  return (
    <div className="avatar-group-container">
      <button 
        className="avatar-add-btn" 
        onClick={(e) => { e.stopPropagation(); onAddClick?.(); }}
        title="Thêm thành viên"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      </button>
      
      <div className="avatar-group" onClick={onGroupClick} title="Quản lý thành viên">
        {visibleMembers.map((member, index) => {
          const initials = getInitials(member.fullName || member.email);
          const bgColor = adjustColor(member.email || member.id?.toString() || String(index));
          
          return (
            <div 
              key={member.id || index} 
              className="avatar-item" 
              style={{ zIndex: visibleMembers.length - index, backgroundColor: bgColor }}
              title={`${member.fullName || 'Người dùng'} (${member.email})`}
            >
              {initials}
            </div>
          );
        })}

        {remainingCount > 0 && (
          <div className="avatar-item avatar-more" style={{ zIndex: 0 }}>
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarGroup;
