import TemplateSelector from '@/components/workspace/TemplateSelector';
import { useState } from 'react';

export default function Demo() {
  const [completed, setCompleted] = useState(false);

  const handleComplete = (template: any, stacks: string[], config: any) => {
    console.log('Template completed:', { template, stacks, config });
    setCompleted(true);
  };

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Demo Complete!</h1>
          <p className="text-lg text-muted-foreground">
            Template selection and AI sales agent interaction completed.
          </p>
        </div>
      </div>
    );
  }

  return <TemplateSelector onComplete={handleComplete} />;
}