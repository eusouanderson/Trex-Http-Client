import { describe, expect, it } from 'vitest';
import { JsonDiffService, createJsonDiffService } from '../index';
import type { ExecutionResult } from '../../../features/request/interfaces';

describe('JsonDiffService', () => {
  const service = new JsonDiffService();

  describe('formatPayload', () => {
    it('should format null or undefined as empty string', () => {
      expect(service.formatPayload(null)).toBe('');
      expect(service.formatPayload(undefined)).toBe('');
    });

    it('should format valid JSON string indented with 2 spaces', () => {
      const raw = '{"a":1,"b":"text"}';
      const expected = JSON.stringify({ a: 1, b: 'text' }, null, 2);
      expect(service.formatPayload(raw)).toBe(expected);
    });

    it('should return raw string when JSON parsing fails', () => {
      const raw = 'not a json';
      expect(service.formatPayload(raw)).toBe('not a json');
    });

    it('should format JS object or array as indented JSON', () => {
      const obj = { id: 1, name: 'Dino' };
      expect(service.formatPayload(obj)).toBe(JSON.stringify(obj, null, 2));
      const arr = [1, 2, 3];
      expect(service.formatPayload(arr)).toBe(JSON.stringify(arr, null, 2));
    });
  });

  describe('computeMetaDiff', () => {
    it('should handle null values on both sides', () => {
      const diff = service.computeMetaDiff(null, null);
      expect(diff.statusLeft).toBeNull();
      expect(diff.statusRight).toBeNull();
      expect(diff.statusEqual).toBe(true);
      expect(diff.durationDeltaMs).toBeNull();
      expect(diff.sizeDeltaBytes).toBeNull();
    });

    it('should handle one side null', () => {
      const left = { status: 200, statusText: 'OK', durationMs: 100, sizeBytes: 500 };
      const diffLeftOnly = service.computeMetaDiff(left, null);
      expect(diffLeftOnly.statusLeft).toBe(200);
      expect(diffLeftOnly.statusRight).toBeNull();
      expect(diffLeftOnly.statusEqual).toBe(false);
      expect(diffLeftOnly.durationDeltaMs).toBeNull();

      const diffRightOnly = service.computeMetaDiff(null, left);
      expect(diffRightOnly.statusLeft).toBeNull();
      expect(diffRightOnly.statusRight).toBe(200);
      expect(diffRightOnly.statusEqual).toBe(false);
    });

    it('should compute deltas correctly when both sides exist', () => {
      const left = { status: 200, statusText: 'OK', durationMs: 50, sizeBytes: 1000 };
      const right = { status: 201, statusText: 'Created', durationMs: 80, sizeBytes: 1500 };

      const diff = service.computeMetaDiff(left, right);
      expect(diff.statusLeft).toBe(200);
      expect(diff.statusRight).toBe(201);
      expect(diff.statusEqual).toBe(false);
      expect(diff.durationLeftMs).toBe(50);
      expect(diff.durationRightMs).toBe(80);
      expect(diff.durationDeltaMs).toBe(30);
      expect(diff.sizeLeftBytes).toBe(1000);
      expect(diff.sizeRightBytes).toBe(1500);
      expect(diff.sizeDeltaBytes).toBe(500);
    });

    it('should detect equal status codes', () => {
      const left = { status: 200, statusText: 'OK', durationMs: 50, sizeBytes: 100 };
      const right = { status: 200, statusText: 'OK', durationMs: 40, sizeBytes: 100 };

      const diff = service.computeMetaDiff(left, right);
      expect(diff.statusEqual).toBe(true);
      expect(diff.durationDeltaMs).toBe(-10);
      expect(diff.sizeDeltaBytes).toBe(0);
    });
  });

  describe('computeHeaderDiff', () => {
    it('should return empty array when both header records are empty', () => {
      expect(service.computeHeaderDiff({}, {})).toEqual([]);
    });

    it('should mark removed headers when only present on left', () => {
      const diff = service.computeHeaderDiff({ 'content-type': 'application/json' }, {});
      expect(diff).toEqual([
        {
          key: 'content-type',
          type: 'removed',
          valueLeft: 'application/json',
          valueRight: null,
        },
      ]);
    });

    it('should mark added headers when only present on right', () => {
      const diff = service.computeHeaderDiff({}, { 'x-trace-id': 'xyz-123' });
      expect(diff).toEqual([
        {
          key: 'x-trace-id',
          type: 'added',
          valueLeft: null,
          valueRight: 'xyz-123',
        },
      ]);
    });

    it('should mark unchanged headers when identical', () => {
      const diff = service.computeHeaderDiff(
        { authorization: 'Bearer token' },
        { authorization: 'Bearer token' },
      );
      expect(diff).toEqual([
        {
          key: 'authorization',
          type: 'unchanged',
          valueLeft: 'Bearer token',
          valueRight: 'Bearer token',
        },
      ]);
    });

    it('should mark modified headers when values differ', () => {
      const diff = service.computeHeaderDiff(
        { etag: 'W/"123"' },
        { etag: 'W/"456"' },
      );
      expect(diff).toEqual([
        {
          key: 'etag',
          type: 'modified',
          valueLeft: 'W/"123"',
          valueRight: 'W/"456"',
        },
      ]);
    });

    it('should return headers sorted by key name', () => {
      const diff = service.computeHeaderDiff(
        { zzz: '1', aaa: '2' },
        { bbb: '3', aaa: '2' },
      );
      expect(diff.map((item) => item.key)).toEqual(['aaa', 'bbb', 'zzz']);
    });
  });

  describe('computeTextDiff', () => {
    it('should handle empty strings on both sides', () => {
      const result = service.computeTextDiff('', '');
      expect(result.lines).toEqual([]);
      expect(result.summary).toEqual({
        totalAdded: 0,
        totalRemoved: 0,
        totalModified: 0,
        totalUnchanged: 0,
        hasDifferences: false,
      });
    });

    it('should mark all lines as added when left is empty', () => {
      const result = service.computeTextDiff('', 'line1\nline2');
      expect(result.summary.totalAdded).toBe(2);
      expect(result.summary.totalRemoved).toBe(0);
      expect(result.summary.hasDifferences).toBe(true);
      expect(result.lines[0]).toEqual({
        lineNumberLeft: null,
        lineNumberRight: 1,
        type: 'added',
        contentLeft: '',
        contentRight: 'line1',
      });
    });

    it('should mark all lines as removed when right is empty', () => {
      const result = service.computeTextDiff('line1\nline2', '');
      expect(result.summary.totalRemoved).toBe(2);
      expect(result.summary.totalAdded).toBe(0);
      expect(result.summary.hasDifferences).toBe(true);
      expect(result.lines[0]).toEqual({
        lineNumberLeft: 1,
        lineNumberRight: null,
        type: 'removed',
        contentLeft: 'line1',
        contentRight: '',
      });
    });

    it('should mark all lines as unchanged when strings are identical', () => {
      const result = service.computeTextDiff('{\n  "id": 1\n}', '{\n  "id": 1\n}');
      expect(result.summary.hasDifferences).toBe(false);
      expect(result.summary.totalUnchanged).toBe(3);
      expect(result.summary.totalAdded).toBe(0);
      expect(result.summary.totalRemoved).toBe(0);
      expect(result.summary.totalModified).toBe(0);
      expect(result.lines[1]).toEqual({
        lineNumberLeft: 2,
        lineNumberRight: 2,
        type: 'unchanged',
        contentLeft: '  "id": 1',
        contentRight: '  "id": 1',
      });
    });

    it('should detect additions, removals, and modifications', () => {
      const left = ['{', '  "id": 1,', '  "name": "Dino"', '}'].join('\n');
      const right = ['{', '  "id": 1,', '  "name": "Rex",', '  "diet": "carnivore"', '}'].join('\n');

      const result = service.computeTextDiff(left, right);
      expect(result.summary.hasDifferences).toBe(true);
      expect(result.summary.totalUnchanged).toBeGreaterThanOrEqual(2);
      expect(result.lines.some((l) => l.type === 'modified' || l.type === 'added')).toBe(true);
    });

    it('should handle paired modified lines for property updates', () => {
      const left = 'key: old';
      const right = 'key: new';
      const result = service.computeTextDiff(left, right);
      expect(result.summary.totalModified).toBe(1);
      expect(result.lines[0]).toEqual({
        lineNumberLeft: 1,
        lineNumberRight: 1,
        type: 'modified',
        contentLeft: 'key: old',
        contentRight: 'key: new',
      });
    });
  });

  describe('compare', () => {
    it('should compare two full ExecutionResult objects', () => {
      const leftResult: ExecutionResult = {
        status: 200,
        statusText: 'OK',
        durationMs: 40,
        sizeBytes: 250,
        headers: { 'content-type': 'application/json' },
        data: { id: 1, name: 'T-Rex' },
      };

      const rightResult: ExecutionResult = {
        status: 200,
        statusText: 'OK',
        durationMs: 90,
        sizeBytes: 290,
        headers: { 'content-type': 'application/json', 'x-cache': 'hit' },
        data: { id: 1, name: 'Velociraptor' },
      };

      const diff = service.compare(leftResult, rightResult);
      expect(diff.meta.statusEqual).toBe(true);
      expect(diff.meta.durationDeltaMs).toBe(50);
      expect(diff.meta.sizeDeltaBytes).toBe(40);
      expect(diff.headers.some((h) => h.key === 'x-cache' && h.type === 'added')).toBe(true);
      expect(diff.body.summary.hasDifferences).toBe(true);
      expect(diff.summary.hasDifferences).toBe(true);
    });

    it('should handle null execution results gracefully', () => {
      const diff = service.compare(null, null);
      expect(diff.meta.statusLeft).toBeNull();
      expect(diff.meta.statusRight).toBeNull();
      expect(diff.headers).toEqual([]);
      expect(diff.body.lines).toEqual([]);
      expect(diff.summary.hasDifferences).toBe(false);
    });

    it('should handle diff when multiple lines are removed', () => {
      const left = ['alpha', 'beta', 'gamma', 'delta'].join('\n');
      const right = ['alpha', 'delta'].join('\n');
      const result = service.computeTextDiff(left, right);
      expect(result.summary.totalRemoved).toBe(2);
      expect(result.summary.hasDifferences).toBe(true);
      expect(result.lines.some((l) => l.type === 'removed')).toBe(true);
    });
    it('should retrieve line at valid index and empty string when out of bounds', () => {
      expect(service.getLineAt(['hello', 'world'], 0)).toBe('hello');
      expect(service.getLineAt(['hello', 'world'], 1)).toBe('world');
      expect(service.getLineAt(['hello', 'world'], 5)).toBe('');
      expect(service.getLineAt(['hello', 'world'], -1)).toBe('');
    });

    it('should retrieve table value or return 0 when out of bounds', () => {
      const table = [[1, 2], [3, 4]];
      expect(service.getTableValue(table, 0, 1)).toBe(2);
      expect(service.getTableValue(table, 5, 0)).toBe(0);
      expect(service.getTableValue(table, 0, 5)).toBe(0);
    });

    it('should set table value or safely ignore out of bounds rows', () => {
      const table = [[1, 2], [3, 4]];
      service.setTableValue(table, 0, 1, 99);
      expect(service.getTableValue(table, 0, 1)).toBe(99);
      service.setTableValue(table, 10, 10, 99);
      expect(service.getTableValue(table, 10, 10)).toBe(0);
    });
  });

  describe('createJsonDiffService', () => {
    it('should create an instance of JsonDiffService', () => {
      const instance = createJsonDiffService();
      expect(instance).toBeInstanceOf(JsonDiffService);
    });
  });
});
