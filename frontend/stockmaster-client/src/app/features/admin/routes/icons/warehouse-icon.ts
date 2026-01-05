import * as L from 'leaflet';
export function createWarehouseIcon(): L.DivIcon {
    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 4px solid white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
            <path d="M4 21V10L12 3L20 10V21H14V14H10V21H4Z" opacity="0.3"/>
            <path d="M12 3L4 9V21H9V14H15V21H20V9L12 3Z"/>
          </svg>
          <div style="
            position: absolute;
            bottom: -3px;
            right: -3px;
            background: #22c55e;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 3px solid white;
            animation: pulse 2s infinite;
          "></div>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        </style>
      `,
      iconSize: [50, 50],
      iconAnchor: [25, 50],
      popupAnchor: [0, -50]
    });
  }