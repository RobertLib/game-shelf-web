interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  height?: string;
  width?: string;
}

export default function Skeleton({
  className = "",
  height = "h-4",
  width = "w-full",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-neutral-100 ${height} ${width} ${className}`}
      {...props}
    />
  );
}
