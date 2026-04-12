import type { CanvasElement } from './EbookCanvasEditor';

interface PageThumbnailProps {
  elements: CanvasElement[];
  className?: string;
}

const PageThumbnail = ({ elements, className = '' }: PageThumbnailProps) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-white ${className}`}>
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
              fontSize: `${Math.max(3, (el.fontSize || 16) * 0.25)}px`,
              fontFamily: el.fontFamily, color: el.textColor,
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
  );
};

export default PageThumbnail;
