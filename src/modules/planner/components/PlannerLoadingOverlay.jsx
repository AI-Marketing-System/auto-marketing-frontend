import React from 'react';
import { SparkleIcon } from './PlannerIcons';

function PlannerLoadingOverlay({ isLoading, message = 'AI đang xử lý yêu cầu...' }) {
  if (!isLoading) return null;

  return (
    <div
      className="planner-loading-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        animation: 'plannerFadeIn 0.2s ease-out',
      }}
    >
      <div
        className="planner-loading-card"
        style={{
          background: '#1e293b',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '32px 40px',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          color: '#f8fafc',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '48px',
            height: '48px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2.5px solid transparent',
              borderTopColor: '#818cf8',
              borderRightColor: '#6366f1',
              animation: 'plannerSpin 1s linear infinite',
            }}
          />
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.4)',
            }}
          >
            <SparkleIcon size={18} />
          </div>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '15px',
            fontWeight: 500,
            color: '#f1f5f9',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>

        <p
          style={{
            margin: '8px 0 0',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: 1.5,
          }}
        >
          Vui lòng đợi trong giây lát...
        </p>

        <style>{`
          @keyframes plannerSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes plannerFadeIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default PlannerLoadingOverlay;
