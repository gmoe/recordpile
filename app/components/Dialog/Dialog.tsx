import {
  useLayoutEffect,
  forwardRef,
  ButtonHTMLAttributes,
  HTMLProps,
  ReactNode,
} from 'react';
import {
  useMergeRefs,
  FloatingPortal,
  FloatingFocusManager,
  FloatingOverlay,
  useId,
} from '@floating-ui/react';
import { useDialog, useDialogContext, DialogContext } from './utils';
import styles from './Dialog.module.scss';

export interface DialogOptions {
  initialOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({
  children,
  ...options
}: {
  children: ReactNode;
} & DialogOptions) {
  const dialog = useDialog(options);
  return (
    <DialogContext.Provider value={dialog}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  children: ReactNode;
}

export const DialogTrigger = forwardRef<
  HTMLElement,
  HTMLProps<HTMLElement> & DialogTriggerProps
>(function DialogTrigger({ children, ...props }, propRef) {
  const context = useDialogContext();
  const childrenRef = (children as any).ref;
  const ref = useMergeRefs([context.refs.setReference, propRef, childrenRef]);

  return (
    <button
      ref={ref}
      // The user can style the trigger based on the state
      data-state={context.open ? 'open' : 'closed'}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
});

export const DialogContent = forwardRef<
  HTMLDivElement,
  HTMLProps<HTMLDivElement>
>(function DialogContent(props, propRef) {
  const { context: floatingContext, ...context } = useDialogContext();
  const ref = useMergeRefs([context.refs.setFloating, propRef]);

  if (!floatingContext.open) return null;

  return (
    <FloatingPortal>
      <FloatingOverlay className={styles.overlay} lockScroll>
        <FloatingFocusManager context={floatingContext}>
          <div
            ref={ref}
            aria-labelledby={context.labelId}
            aria-describedby={context.descriptionId}
            className={styles.dialog}
            {...context.getFloatingProps(props)}
          >
            {props.children}
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
});

export const DialogHeading = forwardRef<
  HTMLHeadingElement,
  HTMLProps<HTMLHeadingElement>
>(function DialogHeading({ children, ...props }, ref) {
  const { setLabelId, setOpen } = useDialogContext();
  const id = useId();

  // Only sets `aria-labelledby` on the Dialog root element
  // if this component is mounted inside it.
  useLayoutEffect(() => {
    setLabelId(id);
    return () => setLabelId(undefined);
  }, [id, setLabelId]);

  return (
    <header {...props} className={styles.dialogHeader} ref={ref} id={id}>
      <h2>
        {children}
      </h2>
      <button
        type="button"
        aria-label="Close dialog"
        className={styles.closeButton}
        onClick={() => setOpen(false)}
      >
        X
      </button>
    </header>
  );
});

export const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLProps<HTMLParagraphElement>
>(function DialogDescription({ children, ...props }, ref) {
  const { setDescriptionId } = useDialogContext();
  const id = useId();

  // Only sets `aria-describedby` on the Dialog root element
  // if this component is mounted inside it.
  useLayoutEffect(() => {
    setDescriptionId(id);
    return () => setDescriptionId(undefined);
  }, [id, setDescriptionId]);

  return (
    <p {...props} ref={ref} id={id}>
      {children}
    </p>
  );
});

export const DialogClose = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogClose(props, ref) {
  const { setOpen } = useDialogContext();
  return (
    <footer className={styles.dialogFooter}>
      <button type="button" {...props} ref={ref} onClick={() => setOpen(false)} />
    </footer>
  );
});
