import { describe, it, expect, beforeEach } from 'vitest';
import { useResponseViewer } from '../use-response-viewer';

describe('useResponseViewer', () => {
  beforeEach(() => {
    const viewer = useResponseViewer();
    viewer.setTab('body');
  });

  it('should format bytes to human readable sizes', () => {
    const viewer = useResponseViewer();

    expect(viewer.formatBytes(500)).toBe('500 B');
    expect(viewer.formatBytes(2048)).toBe('2.00 KB');
    expect(viewer.formatBytes(1048576)).toBe('1.00 MB');
  });

  it('should format duration times correctly', () => {
    const viewer = useResponseViewer();

    expect(viewer.formatDuration(142)).toBe('142 ms');
    expect(viewer.formatDuration(1500)).toBe('1.50 s');
  });

  it('should return correct status classes based on status code', () => {
    const viewer = useResponseViewer();

    expect(viewer.getStatusColor(200)).toContain('text-dino-400');
    expect(viewer.getStatusColor(302)).toContain('text-amber-400');
    expect(viewer.getStatusColor(404)).toContain('text-magma-400');
    expect(viewer.getStatusColor(500)).toContain('text-magma-400');
    expect(viewer.getStatusColor(0)).toContain('text-fossil-400');
  });

  it('should format data to pretty JSON', () => {
    const viewer = useResponseViewer();

    const formatted = viewer.formatResponseData({ dino: 'T-Rex' });
    expect(formatted).toContain('\n');
    expect(formatted).toContain('"dino": "T-Rex"');

    expect(viewer.formatResponseData(null)).toBe('');
    expect(viewer.formatResponseData(undefined)).toBe('');

    const formattedJsonStr = viewer.formatResponseData('{"parsed": true}');
    expect(formattedJsonStr).toContain('"parsed": true');

    const rawStr = viewer.formatResponseData('not json string');
    expect(rawStr).toBe('not json string');
  });

  it('should switch tabs between body and headers', () => {
    const viewer = useResponseViewer();

    viewer.setTab('headers');
    expect(viewer.activeTab.value).toBe('headers');
    viewer.setTab('body');
    expect(viewer.activeTab.value).toBe('body');
  });
});
