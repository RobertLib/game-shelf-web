import { createPortal } from "react-dom";
import cn from "../../utils/cn";

type OverlayProps = React.ComponentProps<"div">;

export default function Overlay({ className, ...props }: OverlayProps) {
  return createPortal(
    <div
      {...props}
      className={cn(
        "animate-fade-in fixed inset-0 z-30 bg-black/50",
        className,
      )}
    />,
    document.body,
  );
}
