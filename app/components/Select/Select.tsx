'use client';

import {
  useState,
  useMemo,
  Children,
  ReactElement,
  SelectHTMLAttributes,
  OptionHTMLAttributes,
} from 'react';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
} from '@floating-ui/react';
import { ChevronsUpDown } from 'lucide-react';
import { cva } from 'class-variance-authority';
import styles from './Select.module.scss';

interface SelectProps {
  children: ReactElement<OptionHTMLAttributes<HTMLOptionElement>>[];
  disabled?: boolean;
  onChange: (value: OptionHTMLAttributes<HTMLOptionElement>['value']) => void;
  value: string;
};

const selectVariants = cva(styles.select, {
  variants: {
    disabled: {
      true: styles.disabled,
    }
  },
});

const optionVariants = cva(styles.option, {
  variants: {
    selected: {
      true: styles.selected,
    },
  },
});

export default function Select({
  children,
  disabled = false,
  onChange,
  value,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(4), flip(), shift()],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const activeOption = useMemo(() => {
    const found = children.find((option) => value === option.props.value);
    if (!found) {
      throw new Error(`Missing option for value: ${value}`);
    }
    return found;
  }, [children, value]);

  return (
    <>
      <div
        {...getReferenceProps()}
        role="listbox"
        aria-readonly={disabled}
        className={selectVariants({ disabled })}
        ref={refs.setReference}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.activeOption}>
          {activeOption.props.children}
        </div>
        <ChevronsUpDown size={20} />
      </div>
      {isOpen && (
        <FloatingFocusManager context={context} modal={false}>
          <ul
            ref={refs.setFloating}
            className={styles.popup}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            {Children.map(children, (child) => (
              <li
                role="option"
                className={optionVariants({ selected: child.props.value === value })}
                onClick={() => onChange(child.props.value)}
              >
                {child.props.children}
              </li>
            ))}
          </ul>
        </FloatingFocusManager>
      )}
    </>
  );
}
