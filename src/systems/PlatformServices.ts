export interface ServiceResult { ok: boolean; message: string }
export class RewardedAdService {
  async showRewarded(_rewardType: string): Promise<ServiceResult> {
    // Intentionally never grants rewards: no real ad SDK or verified completion callback is configured.
    return { ok: false, message: "Ödüllü reklam sağlayıcısı bağlı değil; ödül verilmedi." };
  }
}
export class PurchaseService {
  async purchase(_productId: string): Promise<ServiceResult> {
    // No fake checkout. Integrate Google Play Billing or a supported web provider before selling.
    return { ok: false, message: "Gerçek satın alma sistemi yapılandırılmadı; ürün açılmadı." };
  }
}
