import { ResizableHandle as BaseResizableHandle } from "@/components/ui/resizable";
import { cn } from "@/lib/utils";

interface EnhancedResizableHandleProps {
  className?: string;
  withHandle?: boolean;
}

export function EnhancedResizableHandle({ 
  className, 
  withHandle = true,
  ...props 
}: EnhancedResizableHandleProps) {
  return (
    <BaseResizableHandle
      className={cn(
        "group relative",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center">
          <div className="h-8 w-4 flex flex-col justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="h-1 w-1 rounded-full bg-gray-500 mx-auto" />
            <div className="h-1 w-1 rounded-full bg-gray-500 mx-auto" />
            <div className="h-1 w-1 rounded-full bg-gray-500 mx-auto" />
          </div>
        </div>
      )}
    </BaseResizableHandle>
  );
}