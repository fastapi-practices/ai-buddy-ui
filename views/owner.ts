import type { VxeGridProps } from '#/adapter/vxe-table';

import { $t } from '@vben/locales';

export function formatOwner(userId: unknown) {
  return userId === 0 ? $t('ai-buddy.builtin') : $t('ai-buddy.userOwned');
}

export function ownerColumn(): NonNullable<VxeGridProps['columns']>[number] {
  return {
    field: 'user_id',
    title: $t('ai-buddy.owner'),
    width: 90,
    formatter: ({ cellValue }) => formatOwner(cellValue),
  };
}
