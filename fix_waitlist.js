const fs = require('fs');

try {
    let text = fs.readFileSync('waitlist.html', 'utf8');

    // <li class="PAD0" 부터 </ul> 까지의 영역을 정규표현식으로 넓게 잡아 통째로 교체합니다.
    const regex = /<li class="PAD0"[^>]*>[\s\S]*?<ul class="pagination">[\s\S]*?<\/ul>\s*<\/li>\s*<\/ul>/i;
    
    const replaceStr = `<li class="PAD0" style="float: left; display: flex; align-items: center; gap: 5px;">
				<select name="update_type" class="form-control" style="width: 160px; display: inline-block;">
					<option value="">=== 일괄적용 ===</option>
					<option value="move">대기자 이동</option>
					<option value="">---------------</option>					
					<option value="del">대기자 삭제</option>
				</select>
				<input type="submit" class="btn btn-default" value="적용하기" style="height: 34px;">
			</li>
			<li style="text-align:right;" class="MAlignCenter">
				<ul class="pagination"><li class="active"><a href="#none;">1</a></li><li><a href="https://www.dbdbschool.kr/af/ad_wait/lists/sn/2848/p/2" data-ci-pagination-page="2">2</a></li><li class="next"><a href="https://www.dbdbschool.kr/af/ad_wait/lists/sn/2848/p/2" data-ci-pagination-page="2" rel="next">다음</a></li><li class="last"><a href="https://www.dbdbschool.kr/af/ad_wait/lists/sn/2848/p/10" data-ci-pagination-page="10">마지막</a></li></ul>			</li>
		</ul>`;

    if (regex.test(text)) {
        text = text.replace(regex, replaceStr);
        fs.writeFileSync('waitlist.html', text, 'utf8');
        console.log('Success! Regex successfully captured and replaced the block.');
    } else {
        console.log('Failed: Regex could not find the block.');
    }
} catch (error) {
    console.error(`Error: ${error.message}`);
}
