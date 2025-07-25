import JSEncrypt from "jsencrypt";

/**
 * 密码加密工具类
 */
export class PasswordCrypto {
  private static encryptor: JSEncrypt | null = null;
  private static publicKey: string | null = null;

  /**
   * 设置公钥
   * @param publicKey PEM格式的公钥
   */
  static setPublicKey(publicKey: string) {
    this.publicKey = publicKey;
    this.encryptor = new JSEncrypt();
    this.encryptor.setPublicKey(publicKey);
  }

  /**
   * 加密密码
   * @param password 明文密码
   * @returns 加密后的密码
   */
  static encryptPassword(password: string): string {
    if (!this.encryptor || !this.publicKey) {
      throw new Error("公钥未设置，请先调用setPublicKey方法");
    }

    const encrypted = this.encryptor.encrypt(password);
    if (!encrypted) {
      throw new Error("密码加密失败");
    }

    return encrypted;
  }

  /**
   * 检查公钥是否已设置
   */
  static isPublicKeySet(): boolean {
    return this.publicKey !== null && this.encryptor !== null;
  }

  /**
   * 清除公钥
   */
  static clearPublicKey() {
    this.publicKey = null;
    this.encryptor = null;
  }
}
