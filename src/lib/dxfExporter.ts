import { DxfWriter, Units } from '@tarikjabiri/dxf';
import type { BoxResult } from './boxGeometry';

export function generateDXF(result: BoxResult): string {
  const dxf = new DxfWriter();
  
  dxf.setUnits(Units.Millimeters);
  
  for (const path of result.paths) {
    if (path.length < 2) continue;
    
    const isClosed = path.length > 2 && 
      Math.abs(path[0].x - path[path.length - 1].x) < 0.01 &&
      Math.abs(path[0].y - path[path.length - 1].y) < 0.01;
    
    const points: [number, number][] = path.map(p => [p.x, p.y]);
    
    if (isClosed && points.length > 1) {
      points.pop();
    }
    
    for (let i = 0; i < points.length - 1; i++) {
      dxf.addLine(
        { x: points[i][0], y: points[i][1], z: 0 },
        { x: points[i + 1][0], y: points[i + 1][1], z: 0 }
      );
    }
    if (isClosed && points.length > 1) {
      dxf.addLine(
        { x: points[points.length - 1][0], y: points[points.length - 1][1], z: 0 },
        { x: points[0][0], y: points[0][1], z: 0 }
      );
    }
  }
  
  return dxf.stringify();
}

export function downloadDXF(data: string, filename: string = 'box.dxf'): void {
  const blob = new Blob([data], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
