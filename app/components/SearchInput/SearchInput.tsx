'use client';
import { ChangeEvent, HTMLProps } from 'react';
import { Search, LoaderCircle, CircleX } from 'lucide-react';
import styles from './SearchInput.module.scss';

interface SearchInputProps {
  autoFocus?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: HTMLProps<HTMLButtonElement>['onClick'];
  value: string;
};

export default function SearchInput({
  autoFocus = false,
  disabled = false,
  isLoading = false,
  onChange,
  onClear,
  value,
}: SearchInputProps) {
  return (
    <div className={styles.container}>
      <div className={styles.iconPrefix}>
        {isLoading ? (
          <LoaderCircle className={styles.spinner} size={20} />
        ) : (
          <Search size={20} />
        )}
      </div>
      <input
        type="search"
        className={styles.searchInput}
        disabled={disabled}
        onChange={onChange}
        value={value}
        autoFocus={autoFocus}
      />
      {Boolean(value.length) && (
        <button
          type="button"
          className={styles.clearButton}
          disabled={disabled}
          onClick={onClear}
        >
          <CircleX size={20} />
        </button>
      )}
    </div>
  );
}
