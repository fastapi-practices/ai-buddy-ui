import { describe, expect, it } from 'vitest';

import { formatOwner, ownerColumn } from './owner';

describe('formatOwner', () => {
  it('maps system user_id 0 to builtin and others to user-owned', () => {
    expect(formatOwner(0)).not.toEqual(formatOwner(1));
    expect(formatOwner(0)).toEqual(formatOwner(0));
    expect(formatOwner(12)).toEqual(formatOwner(1));
  });
});

describe('ownerColumn', () => {
  it('renders user_id as an ownership column', () => {
    const column = ownerColumn();
    expect(column.field).toBe('user_id');
    expect(column.formatter?.({ cellValue: 0 } as never)).toEqual(
      formatOwner(0),
    );
    expect(column.formatter?.({ cellValue: 8 } as never)).toEqual(
      formatOwner(8),
    );
  });
});
