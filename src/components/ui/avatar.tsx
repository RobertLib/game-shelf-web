import { UserCircle } from "lucide-react";
import cn from "../../utils/cn";

type AvatarProps = React.ComponentProps<"div">;

export default function Avatar({ className, ...props }: AvatarProps) {
  return (
    <div {...props} className={cn("inline-block", className)}>
      <UserCircle size={24} />
    </div>
  );
}
