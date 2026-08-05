export interface RenderVideoRequest {
  tenantId: string;
  packageId: string;
  script: string;
  aspectRatio: string;
  voiceoverText: string;
  onScreenText: string;
  brollTags: string[];
}

export interface RenderVideoResult {
  status: 'PREVIEW_GENERATED' | 'QUEUED' | 'COMPLETED' | 'FAILED';
  videoUrl?: string;
  previewUrl: string;
  provider: string;
  renderingCostUsd: number;
  message: string;
}

export interface IVideoRenderingProvider {
  renderVideo(request: RenderVideoRequest): Promise<RenderVideoResult>;
}

export class MockVideoRenderingProvider implements IVideoRenderingProvider {
  public async renderVideo(request: RenderVideoRequest): Promise<RenderVideoResult> {
    const isEnabled = process.env.ENABLE_VIDEO_RENDERING_PROVIDER === 'true';
    if (!isEnabled) {
      return {
        status: 'PREVIEW_GENERATED',
        previewUrl: `https://preview.aicas.internal/video/${request.packageId}_preview.mp4`,
        provider: 'MockPreviewProvider',
        renderingCostUsd: 0.0,
        message: 'Video rendering provider is disabled. Rendered preview package successfully.',
      };
    }

    return {
      status: 'COMPLETED',
      videoUrl: `https://cdn.aicas.internal/rendered/${request.packageId}.mp4`,
      previewUrl: `https://preview.aicas.internal/video/${request.packageId}_preview.mp4`,
      provider: 'EnterpriseCloudRenderV1',
      renderingCostUsd: 0.75,
      message: 'Video rendered successfully via cloud provider interface.',
    };
  }
}

export const videoRenderingProvider: IVideoRenderingProvider = new MockVideoRenderingProvider();
