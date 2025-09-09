'use client';
import { ChangeEvent, HTMLProps } from 'react';
import { cva } from 'class-variance-authority';
import { Search, LoaderCircle, CircleX } from 'lucide-react';
import styles from './SearchInput.module.scss';

interface SearchInputProps {
  disabled?: boolean;
  isLoading?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: HTMLProps<HTMLButtonElement>['onClick'];
  value: string;
};

const search = cva(styles.searchInput, {
  variants: {
  },
});

export default function SearchInput({
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
