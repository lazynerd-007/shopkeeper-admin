import React from 'react';

const loaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  width: '100%',
};

const spinnerStyle: React.CSSProperties = {
  border: '6px solid #f3f3f3',
  borderTop: '6px solid #2563eb',
  borderRadius: '50%',
  width: '48px',
  height: '48px',
  animation: 'spin 1s linear infinite',
};

const keyframes = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;

export default function Loader() {
  return (
    <div style={loaderStyle}>
      <style>{keyframes}</style>
      <div style={spinnerStyle} />
    </div>
  );
} 