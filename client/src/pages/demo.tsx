import AISalesAgent from '@/components/workspace/AISalesAgent';
import { projectTemplates } from '@shared/templates';
import { marketingStacks } from '@shared/marketing-stacks';

export default function Demo() {
  // Use Personal Injury template for demo
  const personalInjuryTemplate = projectTemplates.find(t => t.id === 'personal-injury-attorney') || projectTemplates[0];
  
  // Get relevant marketing stacks for legal industry
  const relevantStacks = marketingStacks.filter(stack => 
    stack.industries && (stack.industries.includes('legal') || stack.industries.includes('all'))
  );

  const handleComplete = (template: any, stacks: string[], config: any) => {
    console.log('Demo completed:', { template, stacks, config });
  };

  return (
    <AISalesAgent
      selectedTemplate={personalInjuryTemplate}
      availableStacks={relevantStacks}
      onStackSelection={() => {}}
      onComplete={handleComplete}
    />
  );
}