'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import SearchInput from '@/app/components/SearchInput';
import useDebounce from '@/app/util/useDebounce';

export default function FilterBar() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 250);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set('query', searchQuery);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
  }, [debouncedSearchQuery]);

  return (
    <div>
      <SearchInput
        isLoading={debouncedSearchQuery !== searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        onClear={() => setSearchQuery('')}
        value={searchQuery}
      />
    </div>
  );
}
