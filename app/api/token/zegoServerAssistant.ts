import crypto from 'crypto';

export function generateToken04(
  appId: number,
  userId: string,
  serverSecret: string,
  effectiveTimeInSeconds: number,
  payload: string
): string {
  if (!appId || !userId || !serverSecret) {
    throw new Error('Missing required parameters for token generation');
  }

  const createTime = Math.floor(Date.now() / 1000);
  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: Math.floor(Math.random() * 2147483647),
    ctime: createTime,
    expire: createTime + effectiveTimeInSeconds,
    payload: payload || '',
  };

  const plaintText = Buffer.from(JSON.stringify(tokenInfo), 'utf8');
  const cipher = crypto.createCipher('aes-128-ecb', serverSecret);
  cipher.setAutoPadding(true);
  let encrypted = cipher.update(plaintText, undefined, 'base64');
  encrypted += cipher.final('base64');

  return encrypted;
}
