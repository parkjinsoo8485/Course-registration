const fs = require('fs');

try {
    let text = fs.readFileSync('cfg-lecture-time.html', 'utf8');

    // <td> 부터 </div>까지의 패턴을 찾아 모든 시간 입력란을 flexbox 디자인으로 바꿉니다.
    const regex = /<td>\s*<input id="(div_name_sh_(\d+))"([^>]+)>[\s:]*<input id="(div_name_sm_\2)"([^>]+)>[\s~]*<input id="(div_name_eh_\2)"([^>]+)>[\s:]*<input id="(div_name_em_\2)"([^>]+)>\s*<div class="">([^<]+)<\/div>/g;

    let matchCount = 0;
    
    let updated = text.replace(regex, (match, sh_id, num, sh_rest, sm_id, sm_rest, eh_id, eh_rest, em_id, em_rest, time_text) => {
        matchCount++;
        
        // 투박한 스타일을 세련되고 중앙 정렬된 스타일로 치환합니다.
        const cleanRest = (str) => {
            return str.replace(/class="form-control size100"/g, 'class="form-control"')
                      .replace(/style="width:40px"/g, 'style="width:45px; text-align: center; padding: 2px;"');
        };

        return `<td style="text-align: center; vertical-align: middle;">
			<div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
				<input id="${sh_id}"${cleanRest(sh_rest)}> :
				<input id="${sm_id}"${cleanRest(sm_rest)}>
				<span style="margin: 0 5px;">~</span>
				<input id="${eh_id}"${cleanRest(eh_rest)}> :
				<input id="${em_id}"${cleanRest(em_rest)}>
			</div>
			<div style="font-size: 11px; color: #888; margin-top: 4px;">(${time_text.trim()})</div>`;
    });

    fs.writeFileSync('cfg-lecture-time.html', updated, 'utf8');
    console.log(`Success! Fixed ${matchCount} rows.`);
} catch (error) {
    console.error(`Error: ${error.message}`);
}
