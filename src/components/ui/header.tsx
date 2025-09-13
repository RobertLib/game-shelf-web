import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import cn from "../../utils/cn";
import IconButton from "./icon-button";
import Skeleton from "./skeleton";

interface HeaderProps extends Omit<React.ComponentProps<"div">, "title"> {
  actions?: React.ReactNode;
  back?: boolean;
  title: React.ReactNode;
}

export default function Header({
  actions,
  back,
  className,
  title,
  ...props
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <div
      {...props}
      className={cn("flex items-center justify-between", className)}
    >
      <div className="flex items-center gap-2.5">
        {back && (
          <IconButton aria-label="Back" onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </IconButton>
        )}
        <h1 className="text-3xl font-medium">
          {title ?? (
            <Skeleton
              className="bg-neutral-200/70"
              height="h-8"
              width="w-[20vw]"
            />
          )}
        </h1>
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}
