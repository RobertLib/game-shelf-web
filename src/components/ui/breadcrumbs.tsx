import { getDictionary } from "../../dictionaries";
import { House } from "lucide-react";
import { Link } from "react-router";
import cn from "../../utils/cn";

interface Item {
  href?: string;
  label: string | null | undefined;
}

interface BreadcrumbsProps extends React.ComponentProps<"nav"> {
  items: Item[];
}

export default function Breadcrumbs({
  className,
  items,
  ...props
}: BreadcrumbsProps) {
  const dict = getDictionary();

  return (
    <nav {...props} className={cn("truncate", className)}>
      <ol className="flex">
        <li className="flex items-center">
          <Link aria-label="Home" className="link" tabIndex={-1} to="/">
            <House className="mr-1.5" size={12} />
          </Link>
        </li>
        {[{ href: "/", label: dict.home.title }, ...items].map(
          (item, index) => {
            const isLast = index === items.length;

            return (
              <li
                className="text-sm after:mx-2 after:text-gray-500 after:content-['>'] last:after:content-['']"
                key={index}
              >
                {isLast ? (
                  <span className="font-semibold text-gray-500 dark:text-gray-400">
                    {item.label ?? "..."}
                  </span>
                ) : (
                  <Link className="link" to={item.href ?? "/"}>
                    {item.label ?? "..."}
                  </Link>
                )}
              </li>
            );
          },
        )}
      </ol>
    </nav>
  );
}
