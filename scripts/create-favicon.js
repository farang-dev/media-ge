// シンプルなファビコンを作成するスクリプト
const fs = require('fs');
const path = require('path');

// Base64エンコードされた赤い四角形のPNG画像
const redSquarePng = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAABFUlEQVR4nO2XMU7DQBBF3xIJIVGkpKGiQlyAK3AFTsEJOAJH4ApcgSNQUVJSIEQRUvxoVrKQYzxrr+3dBvZLo9HK8r5nPDtjsCxLSQtwCzwBH8A3sAFegUdgWsrADFgDUeN6B+5KGHgBDsDFifsXYJHbwDPw9wfxmPUqp4FrYNdDPGbdDDXQiMcZxGPWbR8DV8BnRvGYdQWM+hh4G0g8Zr3/ZWAErIYUb7Fuu5roLOA9MBnwzidN1l1nE10FvKSAeIv10sVEFwHPKSLe4nmIiTYBTykk3uJpkIlTAh5STLzFw1kTbQIWKSfe4vn0y6hZwH3KiR+57zTRJuAuxcSP3HeaaBNwm1LiMQvgG/gCPoEfYJ5S4hZLFf4BanIqWdU9BcIAAAAASUVORK5CYII=';

// Base64デコード
const pngData = Buffer.from(redSquarePng, 'base64');

// ファビコンファイルのパス
const faviconPath = path.join(__dirname, '..', 'public', 'favicon.ico');

// ファイルに書き込み
fs.writeFileSync(faviconPath, pngData);

console.log(`新しいファビコンを作成しました: ${faviconPath}`);
