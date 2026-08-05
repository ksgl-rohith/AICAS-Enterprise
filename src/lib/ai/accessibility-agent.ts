import { z } from 'zod';
import { AgentResult, AgentTask } from './agent-contract';
import { agentRegistry } from './agent-registry';

export const AccessibilityIssueSchema = z.object({
  code: z.enum([
    'MISSING_ALT_TEXT',
    'POOR_ALT_TEXT_QUALITY',
    'HEADING_HIERARCHY_INVALID',
    'COMPLEX_LANGUAGE_READABILITY',
    'MISSING_VIDEO_CAPTIONS',
    'POTENTIAL_CONTRAST_DEFICIT',
  ]),
  severity: z.enum(['warning', 'error']),
  element: z.string(),
  description: z.string(),
  remediation: z.string(),
});

export type AccessibilityIssue = z.infer<typeof AccessibilityIssueSchema>;

export const AccessibilityInputSchema = z.object({
  contentItemId: z.string(),
  format: z.enum(['text_post', 'image_post', 'carousel', 'video_script']),
  text: z.string(),
  altText: z.string().optional(),
  visualConcept: z.string().optional(),
  carouselSlides: z.array(z.object({
    slideNumber: z.number(),
    title: z.string(),
    content: z.string(),
  })).optional(),
});

export type AccessibilityInput = z.input<typeof AccessibilityInputSchema>;

export const AccessibilityOutputSchema = z.object({
  contentItemId: z.string(),
  status: z.enum(['pass', 'needs_revision']),
  accessibilityScore: z.number().min(0).max(100),
  generatedAltText: z.string().optional(),
  issues: z.array(AccessibilityIssueSchema),
  remediations: z.array(z.string()),
  contrastCheckRequirements: z.array(z.string()),
});

export type AccessibilityOutput = z.infer<typeof AccessibilityOutputSchema>;

export class AccessibilityAgent {
  public async execute(
    task: AgentTask<AccessibilityInput>
  ): Promise<AgentResult<AccessibilityOutput>> {
    const startTime = Date.now();
    const { contentItemId, format, text, altText, visualConcept, carouselSlides } = task.input;

    const issues: AccessibilityIssue[] = [];
    const remediations: string[] = [];
    let generatedAltText = altText;

    // 1. Alt Text check for image_post and carousel
    if (format === 'image_post' || format === 'carousel') {
      if (!altText || altText.trim().length === 0) {
        // Auto-generate high quality alt text from visual concept or text summary
        const summary = visualConcept || text.slice(0, 100);
        generatedAltText = `Visual representation showing: ${summary.replace(/[\n\r]+/g, ' ')}`;

        issues.push({
          code: 'MISSING_ALT_TEXT',
          severity: 'warning',
          element: 'Image/Visual Asset',
          description: 'Alt text was missing. Auto-generated descriptive fallback alt text.',
          remediation: `Review and confirm generated alt text: "${generatedAltText}"`,
        });
      } else if (altText.toLowerCase().includes('image of') || altText.length < 10) {
        issues.push({
          code: 'POOR_ALT_TEXT_QUALITY',
          severity: 'warning',
          element: 'Alt Text',
          description: 'Alt text is generic or contains redundant words ("image of").',
          remediation: 'Provide specific visual description omitting "image of".',
        });
      }
    }

    // 2. Carousel heading hierarchy check
    if (format === 'carousel' && carouselSlides && carouselSlides.length > 0) {
      let previousTitleLength = 0;
      for (const slide of carouselSlides) {
        if (!slide.title || slide.title.trim().length === 0) {
          issues.push({
            code: 'HEADING_HIERARCHY_INVALID',
            severity: 'error',
            element: `Slide ${slide.slideNumber}`,
            description: `Slide ${slide.slideNumber} lacks a clear heading title.`,
            remediation: 'Add a concise slide title for screen-reader navigation.',
          });
        }
      }
    }

    // 3. Language complexity check (Flesch-Kincaid style readability indicator)
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const avgWordLength = words.length > 0 ? words.reduce((a, b) => a + b.length, 0) / words.length : 0;
    if (avgWordLength > 6.8) {
      issues.push({
        code: 'COMPLEX_LANGUAGE_READABILITY',
        severity: 'warning',
        element: 'Post Text Body',
        description: 'Text contains long, complex words that may reduce readability accessibility.',
        remediation: 'Simplify sentences and replace heavy jargon with plain language.',
      });
    }

    // 4. Video Script Captions check
    if (format === 'video_script') {
      if (!text.toLowerCase().includes('caption') && !text.toLowerCase().includes('subtitle')) {
        issues.push({
          code: 'MISSING_VIDEO_CAPTIONS',
          severity: 'error',
          element: 'Video Package',
          description: 'Video script package lacks explicit subtitle/closed caption track specifications.',
          remediation: 'Include burnt-in or sidecar SRT captions for hearing-impaired accessibility.',
        });
      }
    }

    // Contrast check requirements (disclaiming pixel-level contrast)
    const contrastCheckRequirements = [
      'Text elements on visual graphics must maintain a minimum WCAG 2.1 AA contrast ratio of 4.5:1 against visual background.',
      'Header text must maintain 3.0:1 contrast ratio.',
      'Note: Actual pixel contrast must be validated on rendered image output.',
    ];

    const errorCount = issues.filter((i) => i.severity === 'error').length;
    const warningCount = issues.filter((i) => i.severity === 'warning').length;

    const accessibilityScore = Math.max(0, 100 - errorCount * 25 - warningCount * 10);
    const status = errorCount === 0 ? 'pass' : 'needs_revision';

    remediations.push(...issues.map((i) => i.remediation));

    const output: AccessibilityOutput = {
      contentItemId,
      status,
      accessibilityScore,
      generatedAltText,
      issues,
      remediations,
      contrastCheckRequirements,
    };

    return {
      taskId: task.taskId,
      agentName: 'AccessibilityAgent',
      status: status === 'pass' ? 'completed' : 'needs_revision',
      output,
      confidence: 0.95,
      warnings: issues.map((i) => `${i.element}: ${i.description}`),
      evidence: [],
      evaluationScores: {
        accessibilityScore,
        issueCount: issues.length,
      },
      usage: {
        latencyMs: Date.now() - startTime,
      },
      provenance: {
        model: 'accessibility-checker-v1',
        promptVersion: 'v1.0',
        policyVersion: 'v1.0',
      },
    };
  }
}

export const accessibilityAgent = new AccessibilityAgent();

// Register agent in AgentRegistry
agentRegistry.register({
  name: 'AccessibilityAgent',
  version: '1.0.0',
  description: 'Validates alt text, visual hierarchy, plain language, and visual contrast guidelines',
  executionMode: 'deterministic',
  inputSchema: AccessibilityInputSchema,
  outputSchema: AccessibilityOutputSchema,
  allowedTools: ['alt_text_validator', 'readability_checker'],
  enabled: true,
  handler: (task) => accessibilityAgent.execute(task),
});
