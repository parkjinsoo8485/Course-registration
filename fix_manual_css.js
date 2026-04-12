const fs = require('fs');

try {
    let cssText = fs.readFileSync('assets/css/manual-clone.css', 'utf8');

    // CSS 내의 기존 그리드 레이아웃을 Flexbox 구조로 변경합니다.
    const regex1 = /\.manual-admin-panel \.panel-body\s*\{[\s\S]*?\}/;
    const replacement1 = `.manual-admin-panel .panel-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: #fdfdfd;
}`;

    const regex2 = /\.manual-admin-form\s*\{[\s\S]*?\}/;
    const replacement2 = `.manual-admin-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #e0e5ea;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}`;

    const regex3 = /\.manual-admin-grid\s*\{[\s\S]*?\}/;
    const replacement3 = `.manual-admin-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.manual-admin-grid > input {
  flex: 1;
  min-width: 250px;
}`;

	const regex4 = /\.manual-admin-summary\s*\{[\s\S]*?\}/;
	const replacement4 = `.manual-admin-summary {
  border: 1px solid #e3e8ee;
  background: linear-gradient(180deg, #fbfdff 0%, #f4f8fc 100%);
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}`;

    cssText = cssText.replace(regex1, replacement1);
    cssText = cssText.replace(regex2, replacement2);
    cssText = cssText.replace(regex3, replacement3);
	cssText = cssText.replace(regex4, replacement4);

    fs.writeFileSync('assets/css/manual-clone.css', cssText, 'utf8');
    console.log('Success! Refactored the CSS layout for manual-admin-panel.');
} catch (error) {
    console.error(`Error: ${error.message}`);
}
