import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import CollapsibleContent from "./collapsible-content";
import IconButton from "./icon-button";
import Panel from "./panel";

interface AccordionProps extends React.ComponentProps<"div"> {
  header?: React.ReactNode;
  open?: boolean;
}

export default function Accordion({
  header,
  children,
  open = true,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(open);

  const Icon = isOpen ? ChevronUp : ChevronDown;

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <Panel className="flex items-center gap-3">
      <div className="flex-1">
        <div
          aria-expanded={isOpen}
          className="cursor-pointer"
          onClick={handleToggle}
          role="button"
          tabIndex={0}
        >
          {header}
        </div>
        <CollapsibleContent isOpen={isOpen}>{children}</CollapsibleContent>
      </div>
      <IconButton
        aria-expanded={isOpen}
        aria-label="Toggle accordion"
        onClick={handleToggle}
      >
        <Icon size={18} />
      </IconButton>
    </Panel>
  );
}
