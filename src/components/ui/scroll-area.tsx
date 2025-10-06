import * as React from "react";

type ScrollAreaProps = React.PropsWithChildren<{
  className?: string;
}>;

export function ScrollArea({ className, children }: ScrollAreaProps) {
  return (
    <div
      className={
        "overflow-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 " +
        (className ?? "")
      }
    >
      {children}
    </div>
  );
}


