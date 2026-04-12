import type { CanvasElement } from './EbookCanvasEditor';

interface PageThumbnailProps {
  elements: CanvasElement[];
  className?: string;
}

const CANVAS_W = 480;
const CANVAS_H = 640;

const PageThumbnail = ({ elements, className = '' }: PageThumbnailProps) => {
  return (
    <div className={`relative w-full overflow-hidden bg-white ${className}`} style={{ aspectRatio: '3/4' }}>
      {/* Render at full canvas size, then scale to fit via CSS */}
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(var(--thumb-scale, 0.3))`,
        }}
        ref={(node) => {
          if (!node) return;
          const parent = node.parentElement;
          if (!parent) return;
          const scale = parent.clientWidth / CANVAS_W;
          node.style.setProperty('--thumb-scale', String(scale));
          // Re-measure on resize
          const ro = new ResizeObserver(() => {
            const s = parent.clientWidth / CANVAS_W;
            node.style.setProperty('--thumb-scale', String(s));
          });
          ro.observe(parent);
        }}
      >
        {elements.map(el => {
          if (el.type === 'image') {
            if ((el as any).isPlaceholder || !el.src) {
              return (
                <div key={el.id} className="absolute bg-muted/30 border border-dashed border-muted-foreground/20" style={{
                  left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`,
                }} />
              );
            }
            return (
              <div key={el.id} className="absolute overflow-hidden" style={{
                left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`,
              }}>
                <img src={el.src} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            );
          }
          if (el.type === 'shape') {
            return (
              <div key={el.id} className="absolute" style={{
                left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`,
                backgroundColor: el.fill, borderRadius: el.shapeType === 'circle' ? '50%' : undefined,
              }} />
            );
          }
          if (el.type === 'text') {
            return (
              <div key={el.id} className="absolute overflow-hidden" style={{
                left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`,
                fontSize: `${el.fontSize || 16}px`,
                fontFamily: el.fontFamily,
                color: el.textColor,
                fontWeight: el.fontWeight || 'normal',
                textAlign: el.textAlign || 'left',
                lineHeight: 1.2,
                whiteSpace: 'pre-wrap',
              }}>
                {el.content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default PageThumbnail;
