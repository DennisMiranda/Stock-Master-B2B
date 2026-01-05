import * as L from 'leaflet';
export function createOrderIcon(status: string): L.DivIcon {
    const colors: Record<string, string> = {
      'CREATED': '#EAB308',
      'IN_PACKING': '#3B82F6',
      'READY': '#10B981',
      'DELIVERED': '#6B7280',
      'CANCELLED': '#EF4444'
    };

    const color = colors[status] || '#6B7280';

    return L.divIcon({
      className: 'custom-icon',
      html: `
        <div style="
          background: ${color};
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });
  }